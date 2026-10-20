import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { buildBrain, buildConnections, earSites, scalpSites } from './brain';
import { hash1 } from './noise';
import {
  brainFrag, brainVert,
  deviceFrag, deviceVert,
  electrodeFrag, electrodeVert,
  gradeShader,
  latticeFrag, latticeLineFrag, latticeLineVert, latticeVert,
  traceFrag, traceVert,
  wireFrag, wireVert,
} from './shaders';

/* ------------------------------------------------------------------ palette */

const BONE = new THREE.Color('#EDE9E1');
const SIGNAL = new THREE.Color('#BFE4FF'); // cortical activation
const EEG = new THREE.Color('#8FC9FF');    // cool: neural
const EMG = new THREE.Color('#FFA469');    // warm: muscular

/* ------------------------------------------------------------------ quality */

export type Tier = 'high' | 'mid' | 'low';

interface QualitySpec {
  points: number;
  wires: number;
  dprCap: number;
  bloom: boolean;
  tracePoints: number;
}

const QUALITY: Record<Tier, QualitySpec> = {
  high: { points: 165_000, wires: 1200, dprCap: 2.0, bloom: true, tracePoints: 2200 },
  mid:  { points: 88_000,  wires: 700,  dprCap: 1.75, bloom: true, tracePoints: 1400 },
  low:  { points: 36_000,  wires: 260,  dprCap: 1.5, bloom: false, tracePoints: 700 },
};

export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'mid';
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (w < 760 || (coarse && w < 1100) || cores <= 4) return 'low';
  if (w < 1400 || cores <= 8) return 'mid';
  return 'high';
}

/* ------------------------------------------------------------------- easing */

/**
 * Ken Perlin's smootherstep. Zero first *and* second derivative at both ends,
 * so where two ramp segments meet there is no change in acceleration. Plain
 * smoothstep is only C0 at the joins, which is what made the choreography feel
 * faintly stepped between beats.
 */
function smoother(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Piecewise smootherstep through (progress, value) stops. */
function ramp(p: number, stops: readonly (readonly [number, number])[]): number {
  if (p <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (p >= last[0]) return last[1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, v0] = stops[i];
    const [p1, v1] = stops[i + 1];
    if (p >= p0 && p <= p1) {
      const t = p1 === p0 ? 0 : (p - p0) / (p1 - p0);
      return v0 + (v1 - v0) * smoother(t);
    }
  }
  return last[1];
}

/** Local 0..1 progress within a window. */
function span(p: number, a: number, b: number): number {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

/* ------------------------------------------------- camera choreography ------ */

interface Key {
  p: number;
  pos: [number, number, number];
  tgt: [number, number, number];
  roll?: number;
}

/**
 * The camera moves through real Z depth rather than sliding layers: it starts
 * far out, orbits the cortex, dives to the ear, follows the signal out, pulls
 * back through the decoder, settles on the device, then retreats.
 */
const KEYS: Key[] = [
  //            act  camera position              look-at
  { p: 0.000, pos: [  1.85,  0.62,  4.05], tgt: [ 0.00, -0.06,  0.00] }, // 00 hero, 3/4
  { p: 0.080, pos: [  1.65,  0.53,  3.93], tgt: [ 0.00, -0.04,  0.00] },
  { p: 0.170, pos: [  0.77,  0.42,  4.26], tgt: [ 0.00,  0.00,  0.00] }, // 01 close on cortex
  { p: 0.245, pos: [  1.21,  1.76,  3.67], tgt: [ 0.00,  0.12,  0.00], roll: 0.02 },
  { p: 0.290, pos: [  1.75,  2.00,  3.45], tgt: [ 0.00,  0.12,  0.00], roll: 0.02 }, // 02 the cap, from above
  { p: 0.350, pos: [  3.35,  0.88,  2.16], tgt: [ 0.45, -0.10, -0.10] },
  { p: 0.400, pos: [  4.22,  0.21,  0.63], tgt: [ 1.14, -0.27, -0.10] }, // 03 lateral on the ear
  { p: 0.470, pos: [  4.31,  0.33,  1.80], tgt: [ 1.40, -0.22,  0.12] },
  { p: 0.520, pos: [  3.86,  0.43,  3.59], tgt: [ 1.85, -0.16,  0.42] }, // 04 traces leaving
  { p: 0.615, pos: [  2.71,  0.41,  4.63], tgt: [ 1.45, -0.05,  0.55] }, // 05 separation
  { p: 0.700, pos: [  0.96,  0.40,  4.73], tgt: [ 0.25,  0.02,  0.30] },
  { p: 0.735, pos: [ -0.21,  0.43,  4.68], tgt: [ 0.02,  0.02,  0.10], roll: -0.012 }, // 06 lattice
  { p: 0.830, pos: [  0.82,  0.25,  2.46], tgt: [ 0.02, -0.06,  0.00] }, // 07 device
  { p: 0.900, pos: [  0.43,  0.18,  4.17], tgt: [ 0.00, -0.04,  0.00] },
  { p: 0.960, pos: [  0.97,  0.41,  4.68], tgt: [ 0.00, -0.04,  0.00] }, // 08 reformed
  { p: 1.000, pos: [  0.59,  0.28,  5.56], tgt: [ 0.00, -0.04,  0.00] },
];

/**
 * Where the subject should sit in frame, in units of half the frame width:
 * +1 is the right edge, -1 the left. Applied by nudging the look-at target
 * sideways, never by moving the scene, because the electrode arrays have to
 * stay where the camera thinks they are. Mirrors PLACEMENT in Journey.tsx.
 */
const ROTATION: readonly (readonly [number, number])[] = [
  [0.00, -0.88], [0.10, -0.96], [0.17, -1.12],  // three-quarter, then lateral
  [0.245, -0.70], [0.29, -0.40],                // turn up toward the cap view
  [0.35, -0.12], [0.40, 0.00], [0.52, 0.05],    // square the right ear to camera
  [0.62, 0.12], [0.72, 0.30], [0.83, 0.55],
  [0.93, -0.38], [1.00, -0.86],
];

const COMPOSITION: readonly (readonly [number, number])[] = [
  [0.00,  0.44], [0.10,  0.42],   // copy left  -> subject right
  [0.17,  0.30],
  [0.25, -0.30], [0.30, -0.32],   // copy right -> subject left
  [0.37,  0.28], [0.41,  0.30],   // copy left
  [0.48, -0.28], [0.52, -0.30],   // copy right
  [0.60,  0.28], [0.64,  0.30],   // copy left
  [0.71, -0.24], [0.75, -0.26],   // copy right
  [0.82,  0.36], [0.86,  0.38],   // copy left
  [0.93,  0.22], [1.00,  0.16],   // copy left, receding
];


function sampleKeys(p: number, outPos: THREE.Vector3, outTgt: THREE.Vector3): number {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const raw = b.p === a.p ? 0 : (p - a.p) / (b.p - a.p);
  const t = Math.min(1, Math.max(0, raw));
  const e = smoother(t);

  outPos.set(
    a.pos[0] + (b.pos[0] - a.pos[0]) * e,
    a.pos[1] + (b.pos[1] - a.pos[1]) * e,
    a.pos[2] + (b.pos[2] - a.pos[2]) * e,
  );
  outTgt.set(
    a.tgt[0] + (b.tgt[0] - a.tgt[0]) * e,
    a.tgt[1] + (b.tgt[1] - a.tgt[1]) * e,
    a.tgt[2] + (b.tgt[2] - a.tgt[2]) * e,
  );
  return (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * e;
}

/* ------------------------------------------------------------------- handle */

export interface JourneyOptions {
  tier?: Tier;
  reducedMotion?: boolean;
  onReady?: () => void;
  /** Pulled once per frame; avoids a second rAF loop and a layout read. */
  getProgress?: () => number;
}

export interface JourneyHandle {
  setProgress(p: number): void;
  resize(): void;
  setPaused(paused: boolean): void;
  dispose(): void;
  tier: Tier;
}

/** Exposes live timeline state on window during development only. */
const DEBUG = process.env.NODE_ENV !== 'production';

export function createJourney(
  canvas: HTMLCanvasElement,
  options: JourneyOptions = {},
): JourneyHandle {
  const tier = options.tier ?? detectTier();
  const q = QUALITY[tier];
  const reduced = options.reducedMotion ?? false;

  /* ---------------------------------------------------------- renderer ---- */

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
    stencil: false,
    // Keeps the drawing buffer readable between frames so screenshots and
    // canvas captures are stable while iterating. Off in production.
    preserveDrawingBuffer: DEBUG,
  });
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.08, 120);
  camera.position.set(0.1, 0.28, 5.9);

  const world = new THREE.Group();
  scene.add(world);

  /* -------------------------------------------------------------- cortex -- */

  const cloud = buildBrain(q.points);

  const brainGeo = new THREE.BufferGeometry();
  brainGeo.setAttribute('position', new THREE.BufferAttribute(cloud.positions, 3));
  brainGeo.setAttribute('normal', new THREE.BufferAttribute(cloud.normals, 3));
  brainGeo.setAttribute('aScatter', new THREE.BufferAttribute(cloud.scatter, 3));
  brainGeo.setAttribute('aSeed', new THREE.BufferAttribute(cloud.seed, 1));
  brainGeo.setAttribute('aFold', new THREE.BufferAttribute(cloud.fold, 1));
  brainGeo.setAttribute('aDepth', new THREE.BufferAttribute(cloud.depth, 1));
  brainGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, -0.2, -0.1), 3.2);

  const brainUniforms = {
    uTime: { value: 0 },
    uAssemble: { value: 0 },
    uDissolve: { value: 0 },
    uSize: { value: 0.0046 },
    uScale: { value: 1000 },
    uOpacity: { value: 1 },
    uExposure: { value: 1.50 },
    uFogNear: { value: 3 },
    uFogFar: { value: 7 },
    uPulses: { value: [new THREE.Vector4(0, 0, 0, -1), new THREE.Vector4(0, 0, 0, -1), new THREE.Vector4(0, 0, 0, -1), new THREE.Vector4(0, 0, 0, -1)] },
    uTouch: { value: new THREE.Vector4(0, 0, 0, 0) },
    uBone: { value: BONE },
    uSignal: { value: SIGNAL },
  };

  const brainPoints = new THREE.Points(
    brainGeo,
    new THREE.ShaderMaterial({
      uniforms: brainUniforms,
      vertexShader: brainVert,
      fragmentShader: brainFrag,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      blending: THREE.NormalBlending,
    }),
  );
  brainPoints.frustumCulled = false;
  world.add(brainPoints);

  /* ------------------------------------------------------ cortical wiring -- */

  const wires = buildConnections(cloud, q.wires);
  const wireGeo = new THREE.BufferGeometry();
  wireGeo.setAttribute('position', new THREE.BufferAttribute(wires.positions, 3));
  wireGeo.setAttribute('aSeed', new THREE.BufferAttribute(wires.seed, 1));
  wireGeo.setAttribute('aAlong', new THREE.BufferAttribute(wires.along, 1));

  const wireUniforms = {
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uBone: { value: BONE },
    uSignal: { value: SIGNAL },
  };
  const wireLines = new THREE.LineSegments(
    wireGeo,
    new THREE.ShaderMaterial({
      uniforms: wireUniforms,
      vertexShader: wireVert,
      fragmentShader: wireFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  wireLines.frustumCulled = false;
  world.add(wireLines);

  /* ---------------------------------------------------------- electrodes -- */

  function makeElectrodes(sites: THREE.Vector3[], color: THREE.Color, size: number) {
    const pos = new Float32Array(sites.length * 3);
    const seed = new Float32Array(sites.length);
    const order = new Float32Array(sites.length);
    sites.forEach((v, i) => {
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
      seed[i] = hash1(i * 13 + 7);
      order[i] = i / Math.max(1, sites.length - 1);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aOrder', new THREE.BufferAttribute(order, 1));
    const u = {
      uTime: { value: 0 },
      uScale: { value: 1000 },
      uSize: { value: size },
      uOpacity: { value: 0 },
      uActive: { value: 0 },
      uColor: { value: color },
    };
    const pts = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: electrodeVert,
        fragmentShader: electrodeFrag,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      }),
    );
    pts.frustumCulled = false;
    world.add(pts);
    return { points: pts, uniforms: u, geometry: g };
  }

  const scalpArray = makeElectrodes(scalpSites(44), BONE, 0.030);
  const earArrayR = makeElectrodes(earSites(1, 10), SIGNAL, 0.036);
  const earArrayL = makeElectrodes(earSites(-1, 10), SIGNAL, 0.036);

  /* -------------------------------------------------------- signal traces -- */

  const TRACE_ORIGIN = new THREE.Vector3(1.20, -0.27, -0.09);
  const TRACE_AXIS = new THREE.Vector3(0.84, 0.10, 0.53).normalize();
  const TRACE_LIFT = new THREE.Vector3(0.0, 1.0, -0.05).normalize();

  function makeTrace(kind: 0 | 1, color: THREE.Color) {
    const n = q.tracePoints;
    const t = new Float32Array(n);
    const seed = new Float32Array(n);
    const pos = new Float32Array(n * 3); // placeholder; real position is computed in the shader
    for (let i = 0; i < n; i++) {
      t[i] = i / (n - 1);
      seed[i] = hash1(i * 19 + kind * 977);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aT', new THREE.BufferAttribute(t, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const u = {
      uTime: { value: 0 },
      uScale: { value: 1000 },
      uSize: { value: 0.0085 },
      uReveal: { value: 0 },
      uSeparate: { value: 0 },
      uAmp: { value: 0.36 },
      uKind: { value: kind },
      uOrigin: { value: TRACE_ORIGIN },
      uAxis: { value: TRACE_AXIS },
      uLift: { value: TRACE_LIFT },
      uLength: { value: 2.45 },
      uColor: { value: color },
      uOpacity: { value: 0 },
    };
    const pts = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: traceVert,
        fragmentShader: traceFrag,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    pts.frustumCulled = false;
    world.add(pts);
    return { points: pts, uniforms: u, geometry: g };
  }

  const traceEEG = makeTrace(0, EEG);
  const traceEMG = makeTrace(1, EMG);

  /* ------------------------------------------------------ decoding lattice -- */

  const lattice = (() => {
    const layers = [10, 16, 16, 10, 4];
    const spanX = 2.4;
    const nodes: { p: THREE.Vector3; layer: number }[] = [];

    layers.forEach((countInLayer, li) => {
      const lx = -spanX / 2 + (spanX * li) / (layers.length - 1);
      const cols = Math.ceil(Math.sqrt(countInLayer));
      const rows = Math.ceil(countInLayer / cols);
      for (let k = 0; k < countInLayer; k++) {
        const cy = k % rows;
        const cz = Math.floor(k / rows);
        const y = (cy - (rows - 1) / 2) * 0.30 + (hash1(li * 91 + k) - 0.5) * 0.05;
        const z = (cz - (cols - 1) / 2) * 0.30 + (hash1(li * 71 + k + 5) - 0.5) * 0.05;
        nodes.push({ p: new THREE.Vector3(lx, y, z), layer: li / (layers.length - 1) });
      }
    });

    const npos = new Float32Array(nodes.length * 3);
    const nlayer = new Float32Array(nodes.length);
    const nseed = new Float32Array(nodes.length);
    nodes.forEach((n, i) => {
      npos[i * 3] = n.p.x; npos[i * 3 + 1] = n.p.y; npos[i * 3 + 2] = n.p.z;
      nlayer[i] = n.layer;
      nseed[i] = hash1(i * 23 + 3);
    });
    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.BufferAttribute(npos, 3));
    ng.setAttribute('aLayer', new THREE.BufferAttribute(nlayer, 1));
    ng.setAttribute('aSeed', new THREE.BufferAttribute(nseed, 1));

    const nodeU = {
      uTime: { value: 0 },
      uScale: { value: 1000 },
      uSize: { value: 0.030 },
      uSweep: { value: 0 },
      uOpacity: { value: 0 },
      uBone: { value: BONE },
      uSignal: { value: SIGNAL },
    };
    const nodePts = new THREE.Points(
      ng,
      new THREE.ShaderMaterial({
        uniforms: nodeU,
        vertexShader: latticeVert,
        fragmentShader: latticeFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    nodePts.frustumCulled = false;
    world.add(nodePts);

    // Edges between consecutive layers, thinned so the lattice stays readable.
    const epos: number[] = [];
    const elayer: number[] = [];
    const eseed: number[] = [];
    const density = tier === 'low' ? 0.22 : tier === 'mid' ? 0.4 : 0.6;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        const step = 1 / (layers.length - 1);
        if (Math.abs(nodes[j].layer - nodes[i].layer - step) > 1e-4) continue;
        if (hash1(i * 7919 + j * 31) > density) continue;
        epos.push(nodes[i].p.x, nodes[i].p.y, nodes[i].p.z, nodes[j].p.x, nodes[j].p.y, nodes[j].p.z);
        elayer.push(nodes[i].layer, nodes[j].layer);
        eseed.push(hash1(i * 131 + j), hash1(i * 131 + j));
      }
    }
    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(epos), 3));
    eg.setAttribute('aLayer', new THREE.BufferAttribute(new Float32Array(elayer), 1));
    eg.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(eseed), 1));

    const edgeU = {
      uTime: { value: 0 },
      uSweep: { value: 0 },
      uOpacity: { value: 0 },
      uBone: { value: BONE },
      uSignal: { value: SIGNAL },
    };
    const edges = new THREE.LineSegments(
      eg,
      new THREE.ShaderMaterial({
        uniforms: edgeU,
        vertexShader: latticeLineVert,
        fragmentShader: latticeLineFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    edges.frustumCulled = false;
    world.add(edges);

    return { nodePts, nodeU, edges, edgeU, ng, eg };
  })();

  /* ------------------------------------------------------------- device ---- */

  /**
   * Concept geometry only — an in-ear bud with sensing contacts on the tip.
   * No prototype has been built; the copy alongside this act says so.
   *
   * Built from three parametric parts so the silhouette is a recognisable
   * earbud rather than an abstract shape: the body that sits in the concha,
   * the tip that enters the canal, and a short stem below it.
   */
  const device = (() => {
    const pos: number[] = [];
    const nrm: number[] = [];
    const scat: number[] = [];
    const seed: number[] = [];
    const node: number[] = [];
    let n = 0;

    const push = (
      x: number, y: number, z: number,
      nx: number, ny: number, nz: number,
      isNode: number,
    ) => {
      pos.push(x, y, z);
      const l = Math.hypot(nx, ny, nz) || 1;
      nrm.push(nx / l, ny / l, nz / l);
      const sd = hash1(n * 37 + 11);
      seed.push(sd);
      node.push(isNode);
      const a = hash1(n * 13 + 5) * Math.PI * 2;
      const rr = 2.0 + hash1(n * 17 + 7) * 2.8;
      scat.push(Math.cos(a) * rr, (hash1(n * 5 + 3) - 0.5) * 3.0, Math.sin(a) * rr);
      n++;
    };

    const dense = tier === 'low' ? 0.42 : tier === 'mid' ? 0.72 : 1;

    // --- body: the mass that seats in the concha ---------------------------
    const BODY = Math.round(4200 * dense);
    const RB = [0.172, 0.138, 0.152];
    for (let i = 0; i < BODY; i++) {
      const yv = 1 - (i / (BODY - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - yv * yv));
      const phi = i * 2.399963229728653;
      const dx = Math.cos(phi) * r, dy = yv, dz = Math.sin(phi) * r;
      // Flatten the medial face where the tip joins, and tuck the underside in.
      const flat = 1 - 0.20 * Math.max(0, -dx);
      const px = dx * RB[0] * flat;
      const py = dy * RB[1] * (1 - 0.14 * Math.max(0, -dy));
      const pz = dz * RB[2] * flat;
      push(px, py, pz, px / RB[0], py / RB[1], pz / RB[2], 0);
    }

    /** Tapered tube with a rounded end, used for the tip and the stem. */
    const tube = (
      p0: [number, number, number], p1: [number, number, number],
      r0: number, r1: number, count: number, cap: boolean,
      nodeAt: number[] = [],
    ) => {
      const ax = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
      const L = Math.hypot(...ax);
      const A = ax.map((v) => v / L);
      // Any vector not parallel to A gives a usable basis.
      const ref: [number, number, number] = Math.abs(A[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
      const U = [
        A[1] * ref[2] - A[2] * ref[1],
        A[2] * ref[0] - A[0] * ref[2],
        A[0] * ref[1] - A[1] * ref[0],
      ];
      const ul = Math.hypot(...U);
      const Un = U.map((v) => v / ul);
      const V = [
        A[1] * Un[2] - A[2] * Un[1],
        A[2] * Un[0] - A[0] * Un[2],
        A[0] * Un[1] - A[1] * Un[0],
      ];

      for (let i = 0; i < count; i++) {
        const t = hash1(i * 7 + 101);
        const a = hash1(i * 7 + 103) * Math.PI * 2;
        const r = r0 + (r1 - r0) * t;
        const cx = p0[0] + ax[0] * t, cy = p0[1] + ax[1] * t, cz = p0[2] + ax[2] * t;
        const nx = Un[0] * Math.cos(a) + V[0] * Math.sin(a);
        const ny = Un[1] * Math.cos(a) + V[1] * Math.sin(a);
        const nz = Un[2] * Math.cos(a) + V[2] * Math.sin(a);
        const isNode = nodeAt.some((c) => Math.abs(t - c) < 0.055) ? 1 : 0;
        push(cx + nx * r, cy + ny * r, cz + nz * r, nx, ny, nz, isNode);
      }

      if (cap) {
        const CAP = Math.round(count * 0.22);
        for (let i = 0; i < CAP; i++) {
          const yv = (i / (CAP - 1)) * 0.98;
          const rr = Math.sqrt(Math.max(0, 1 - yv * yv));
          const phi = i * 2.399963229728653;
          const nx = Un[0] * Math.cos(phi) * rr + V[0] * Math.sin(phi) * rr + A[0] * yv;
          const ny = Un[1] * Math.cos(phi) * rr + V[1] * Math.sin(phi) * rr + A[1] * yv;
          const nz = Un[2] * Math.cos(phi) * rr + V[2] * Math.sin(phi) * rr + A[2] * yv;
          push(p1[0] + nx * r1, p1[1] + ny * r1, p1[2] + nz * r1, nx, ny, nz, 0);
        }
      }
    };

    // --- tip: a short canal nozzle, not a spike ----------------------------
    // Contacts ring it where it meets the canal wall.
    tube([-0.095, 0.015, 0.012], [-0.208, 0.046, 0.040],
         0.084, 0.068, Math.round(2000 * dense), true, [0.40, 0.82]);

    // --- tail: a stub, the length of an ear cuff rather than a stem --------
    tube([0.045, -0.088, 0.012], [0.086, -0.182, 0.024],
         0.058, 0.048, Math.round(1200 * dense), true, [0.88]);

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nrm), 3));
    g.setAttribute('aScatter', new THREE.BufferAttribute(new Float32Array(scat), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(seed), 1));
    g.setAttribute('aNode', new THREE.BufferAttribute(new Float32Array(node), 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, -0.1, 0), 3);

    const u = {
      uTime: { value: 0 },
      uScale: { value: 1000 },
      uSize: { value: 0.0125 },
      uForm: { value: 0 },
      uOpacity: { value: 0 },
      uBone: { value: BONE },
      uSignal: { value: SIGNAL },
    };
    const pts = new THREE.Points(
      g,
      new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: deviceVert,
        fragmentShader: deviceFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    pts.frustumCulled = false;
    pts.scale.setScalar(2.9);
    world.add(pts);
    return { points: pts, uniforms: u, geometry: g };
  })();

  /* ------------------------------------------------------- post-processing -- */

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  let bloomPass: UnrealBloomPass | null = null;
  if (q.bloom) {
    bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.28, 0.55, 0.90);
    composer.addPass(bloomPass);
  }

  composer.addPass(new OutputPass());

  const gradePass = new ShaderPass(gradeShader);
  gradePass.uniforms.uAmount.value = reduced ? 0.55 : 1;
  gradePass.uniforms.uGrain.value = reduced ? 0.008 : 0.018;
  composer.addPass(gradePass);

  /* --------------------------------------------------------------- resize -- */

  let width = 1;
  let height = 1;
  let composeX = COMPOSITION[0][1];
  // Below this the copy runs the full width and the subject must stay centred.
  let aspectNarrow = false;
  /**
   * Extra dolly needed to keep the subject in frame on tall, narrow viewports.
   * The keyframes are composed for a landscape frame; in portrait the
   * horizontal field of view collapses, so part of the correction is absorbed
   * by widening the lens and the rest by backing the camera off.
   */
  let fitBoost = 1;
  /**
   * Resolution scale, adjusted from measured frame time. A fixed device pixel
   * ratio is the usual reason a heavy scene stutters on one machine and not
   * another; this trades sharpness for a steady frame instead.
   */
  let resScale = 1;
  let frameAvg = 16.7;
  const BASE_FOV = 42;
  const FIT_ASPECT = 1.35;
  const MAX_FOV_FACTOR = 1.45;

  function resize() {
    const parent = canvas.parentElement;
    width = Math.max(1, parent?.clientWidth ?? window.innerWidth);
    height = Math.max(1, parent?.clientHeight ?? window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, q.dprCap) * resScale;

    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(dpr);
    composer.setSize(width, height);
    bloomPass?.setSize(width, height);

    camera.aspect = width / height;
    aspectNarrow = width < 900;

    const need = Math.max(1, FIT_ASPECT / camera.aspect);
    const fovFactor = Math.min(need, MAX_FOV_FACTOR);
    fitBoost = need / fovFactor;
    camera.fov = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(BASE_FOV) / 2) * fovFactor),
    );
    camera.updateProjectionMatrix();

    const bufferH = height * dpr;
    const scale = bufferH / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    brainUniforms.uScale.value = scale;
    scalpArray.uniforms.uScale.value = scale;
    earArrayR.uniforms.uScale.value = scale;
    earArrayL.uniforms.uScale.value = scale;
    traceEEG.uniforms.uScale.value = scale;
    traceEMG.uniforms.uScale.value = scale;
    lattice.nodeU.uScale.value = scale;
    device.uniforms.uScale.value = scale;

    gradePass.uniforms.uResolution.value = [width * dpr, height * dpr];
  }

  resize();

  /* ------------------------------------------------------------- the loop -- */

  const camPos = new THREE.Vector3().copy(camera.position);
  const camTgt = new THREE.Vector3(0, -0.04, 0);
  const wantPos = new THREE.Vector3();
  const wantTgt = new THREE.Vector3();
  const pulseOrigin = new THREE.Vector3();
  const SUBJECT_CENTRE = new THREE.Vector3(0, -0.10, 0);
  const _fwd = new THREE.Vector3();
  const _right = new THREE.Vector3();
  const _aim = new THREE.Vector3();
  const _up = new THREE.Vector3();

  /**
   * Cursor-to-cortex. The pointer is cast at a sphere standing in for the
   * cerebrum; where it lands becomes a local activation the shader answers to.
   */
  const raycaster = new THREE.Raycaster();
  const _ndc = new THREE.Vector2();
  const _hit = new THREE.Vector3();
  const TOUCH_SPHERE = new THREE.Sphere(new THREE.Vector3(0, -0.10, 0), 1.40);
  const touchPos = new THREE.Vector3(0, 0, 3);
  const touchAim = new THREE.Vector3(0, 0, 3);
  let touchStrength = 0;

  let targetProgress = 0;
  let progress = 0;
  let assemble = 0;
  let clockT = 0;
  let paused = false;
  let snapCam = false;
  let lastResCheck = 0;
  let pointerX = 0;
  let pointerY = 0;
  let parallaxX = 0;
  let parallaxY = 0;
  const finePointer = typeof window !== 'undefined'
    && window.matchMedia('(pointer: fine)').matches;

  const onPointerMove = (e: PointerEvent) => {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (finePointer && !reduced) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }
  let disposed = false;
  let raf = 0;
  let ready = false;
  const startedAt = performance.now();
  let last = startedAt;

  // Wavefront origins wander over the cortex so activation never repeats.
  const pulseSeeds = [0.0, 0.37, 0.71, 0.13];

  function frame(now: number) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (paused) { last = now; return; }

    const frameMs = now - last;
    const dt = Math.min(0.05, frameMs / 1000);
    last = now;

    // Rolling frame time, with a wide deadband so it never oscillates.
    if (frameMs > 0 && frameMs < 200) frameAvg += (frameMs - frameAvg) * 0.04;
    if (!reduced && now - lastResCheck > 1400) {
      lastResCheck = now;
      const wanted = frameAvg > 26 ? resScale - 0.12
                   : frameAvg < 14 ? resScale + 0.08
                   : resScale;
      const clamped = Math.max(0.62, Math.min(1, wanted));
      if (Math.abs(clamped - resScale) > 0.01) { resScale = clamped; resize(); }
    }
    if (!reduced) clockT += dt;

    if (options.getProgress) targetProgress = Math.min(1, Math.max(0, options.getProgress()));

    // Weighted spring toward the scroll target: the scene has mass.
    progress += (targetProgress - progress) * (reduced ? 1 : Math.min(1, dt * 4.5));

    // Assemble from the scatter field on first load.
    const elapsed = (now - startedAt) / 1000;
    assemble = reduced ? 1 : Math.min(1, Math.max(0, (elapsed - 0.2) / 2.8));
    assemble = assemble * assemble * (3 - 2 * assemble);
    if (!ready && assemble > 0.35) { ready = true; options.onReady?.(); }

    const p = progress;

    /* ---- act weights ---------------------------------------------------- */

    // The cortex holds far longer than it used to, comes apart once as a single
    // set-piece, and starts reassembling while the device is still on screen,
    // so the right side of the frame is never left empty.
    const brainVisible = ramp(p, [
      [0.00, 1], [0.58, 1], [0.645, 0.62], [0.70, 0.24], [0.765, 0.0],
      [0.855, 0.0], [0.885, 0.35], [0.95, 1], [1.00, 1],
    ]);
    const dissolve = ramp(p, [
      [0.575, 0], [0.64, 0.26], [0.72, 0.58], [0.78, 0.72], [0.865, 0.72], [0.955, 0],
    ]);
    const wireVisible = ramp(p, [[0.00, 0.5], [0.15, 1], [0.34, 0.85], [0.50, 0.28], [0.58, 0], [0.88, 0], [0.97, 0.6], [1.00, 0.6]]);
    const scalpVisible = ramp(p, [[0.20, 0], [0.25, 1], [0.32, 1], [0.365, 0]]);
    // Second window at the end: the array back on a reassembled cortex, which
    // is the adoption beat's subject rather than another abstract object.
    const earVisible = Math.max(
      ramp(p, [[0.325, 0], [0.37, 1], [0.545, 1], [0.60, 0]]),
      ramp(p, [[0.925, 0], [0.965, 0.6], [1.00, 0.6]]),
    );
    const traceVisible = ramp(p, [[0.425, 0], [0.47, 1], [0.645, 1], [0.692, 0]]);
    const separate = ramp(p, [[0.545, 0], [0.62, 1]]);
    const latticeVisible = ramp(p, [[0.655, 0], [0.70, 1], [0.78, 1], [0.812, 0]]);
    const deviceVisible = ramp(p, [[0.775, 0], [0.815, 1], [0.885, 1], [0.930, 0]]);

    /* ---- cortex ---------------------------------------------------------- */

    brainUniforms.uTime.value = clockT;
    const subjectDist = camera.position.distanceTo(SUBJECT_CENTRE);
    brainUniforms.uFogNear.value = subjectDist - 0.95;
    brainUniforms.uFogFar.value = subjectDist + 1.95;
    brainUniforms.uAssemble.value = assemble;
    brainUniforms.uOpacity.value = brainVisible;
    brainUniforms.uDissolve.value = dissolve;
    brainPoints.visible = brainVisible > 0.004;

    for (let i = 0; i < 4; i++) {
      const cycle = 3.4;
      const phase = ((clockT * 0.42 + pulseSeeds[i]) % 1);
      // Origin drifts slowly around the cortex between cycles.
      const k = Math.floor(clockT * 0.42 + pulseSeeds[i]);
      const a = hash1(k * 17 + i * 101) * Math.PI * 2;
      const u = hash1(k * 29 + i * 7) * 1.6 - 0.7;
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      pulseOrigin.set(Math.cos(a) * s * 0.95, u * 0.72, Math.sin(a) * s * 1.15);
      const v = brainUniforms.uPulses.value[i] as THREE.Vector4;
      v.set(pulseOrigin.x, pulseOrigin.y, pulseOrigin.z, phase * cycle);
    }

    wireUniforms.uTime.value = clockT;
    wireUniforms.uOpacity.value = wireVisible * brainVisible;
    wireLines.visible = wireVisible * brainVisible > 0.004;

    /* ---- electrodes ------------------------------------------------------ */

    scalpArray.uniforms.uTime.value = clockT;
    scalpArray.uniforms.uOpacity.value = scalpVisible;
    scalpArray.uniforms.uActive.value = span(p, 0.22, 0.30);
    scalpArray.points.visible = scalpVisible > 0.004;

    const earActive = Math.max(span(p, 0.34, 0.42), span(p, 0.93, 0.98));
    for (const arr of [earArrayR, earArrayL]) {
      arr.uniforms.uTime.value = clockT;
      arr.uniforms.uOpacity.value = earVisible;
      arr.uniforms.uActive.value = earActive;
      arr.points.visible = earVisible > 0.004;
    }
    // The far-side array reads as a faint echo, not a duplicate focus.
    earArrayL.uniforms.uOpacity.value = earVisible * 0.22;

    /* ---- traces ---------------------------------------------------------- */

    const reveal = span(p, 0.44, 0.54);
    for (const tr of [traceEEG, traceEMG]) {
      tr.uniforms.uTime.value = clockT;
      tr.uniforms.uReveal.value = reveal;
      tr.uniforms.uSeparate.value = separate;
      tr.uniforms.uOpacity.value = traceVisible * 0.72;
      tr.points.visible = traceVisible > 0.004;
    }
    // Before separation the two overlap as one mixed recording.
    traceEMG.uniforms.uAmp.value = 0.30 * (0.5 + separate * 0.5);

    /* ---- lattice --------------------------------------------------------- */

    lattice.nodeU.uTime.value = clockT;
    lattice.nodeU.uOpacity.value = latticeVisible;
    lattice.edgeU.uOpacity.value = latticeVisible;
    const sweep = reduced ? 0.5 : (clockT * 0.34) % 1;
    lattice.nodeU.uSweep.value = sweep;
    lattice.edgeU.uSweep.value = sweep;
    lattice.nodePts.visible = latticeVisible > 0.004;
    lattice.edges.visible = latticeVisible > 0.004;

    /* ---- device ---------------------------------------------------------- */

    device.uniforms.uTime.value = clockT;
    device.uniforms.uOpacity.value = deviceVisible;
    device.uniforms.uForm.value = ramp(p, [[0.775, 0], [0.83, 1], [0.885, 1], [0.930, 0.3]]);
    device.points.visible = deviceVisible > 0.004;
    device.points.rotation.y = 0.58 + (reduced ? 0 : Math.sin(clockT * 0.26) * 0.30);
    device.points.rotation.x = 0.14 + (reduced ? 0 : Math.sin(clockT * 0.19) * 0.07);
    device.points.rotation.z = -0.22;

    /* ---- world motion ---------------------------------------------------- */

    // The cortex turns slowly through the whole journey, plus a scroll-linked
    // quarter turn so scrolling feels like it is driving the rotation.
    // Oscillating idle rather than a continuous spin: the scene stays alive
    // without drifting away from the angle each act needs.
    world.rotation.y = ramp(p, ROTATION)
      + (reduced ? 0 : Math.sin(clockT * 0.24) * 0.042 + Math.sin(clockT * 0.091) * 0.022);
    world.rotation.x = Math.sin(p * Math.PI) * 0.055;

    // Slide the subject across the frame so it never sits under the copy. On
    // narrow viewports the copy runs full width, so the offset is dropped.
    const composeTarget = aspectNarrow ? 0 : ramp(p, COMPOSITION);
    composeX += (composeTarget - composeX) * (reduced ? 1 : Math.min(1, dt * 3.0));

    /* ---- camera ---------------------------------------------------------- */

    const roll = sampleKeys(p, wantPos, wantTgt);
    if (fitBoost > 1.001) wantPos.multiplyScalar(fitBoost);
    const k = reduced || snapCam ? 1 : Math.min(1, dt * 4.0);
    snapCam = false;
    camPos.lerp(wantPos, k);
    camTgt.lerp(wantTgt, k);
    camera.position.copy(camPos);
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);

    // Compose by aiming off the subject rather than moving it. The subject
    // keeps its true world position, so a camera aimed at the ear still finds
    // the ear.
    _fwd.copy(camTgt).sub(camPos);
    const dist = Math.max(0.2, _fwd.length());
    _fwd.divideScalar(dist);
    _right.crossVectors(_fwd, camera.up).normalize();
    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect * dist;
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * dist;

    // Pointer parallax: the frame drifts against the cursor, which reads as
    // depth rather than as a moving object.
    parallaxX += (pointerX - parallaxX) * (reduced ? 1 : Math.min(1, dt * 2.4));
    parallaxY += (pointerY - parallaxY) * (reduced ? 1 : Math.min(1, dt * 2.4));
    _up.copy(camera.up);
    camera.position.addScaledVector(_right, parallaxX * halfW * 0.075);
    camera.position.addScaledVector(_up, -parallaxY * halfH * 0.055);

    _aim.copy(camTgt).addScaledVector(_right, -composeX * halfW);
    // On narrow viewports the copy stacks above, so drop the subject in frame.
    if (aspectNarrow) _aim.addScaledVector(camera.up, 0.40 * halfH);
    camera.lookAt(_aim);

    // Matrices are current here, so the cursor cast happens after the camera
    // has been placed for this frame.
    let wantTouch = 0;
    if (finePointer && !reduced && brainVisible > 0.25) {
      camera.updateMatrixWorld();
      _ndc.set(pointerX, -pointerY);
      raycaster.setFromCamera(_ndc, camera);
      if (raycaster.ray.intersectSphere(TOUCH_SPHERE, _hit)) {
        world.updateMatrixWorld();
        touchAim.copy(world.worldToLocal(_hit));
        wantTouch = 1;
      }
    }
    touchPos.lerp(touchAim, Math.min(1, dt * 7));
    touchStrength += (wantTouch - touchStrength) * Math.min(1, dt * (wantTouch ? 5 : 3));
    (brainUniforms.uTouch.value as THREE.Vector4)
      .set(touchPos.x, touchPos.y, touchPos.z, touchStrength * brainVisible);

    gradePass.uniforms.uTime.value = clockT;
    if (bloomPass) {
      // Ease off over the traces, which are additive and already near clipping.
      bloomPass.strength = 0.30 - 0.10 * traceVisible;
    }

    if (DEBUG) {
      (window as unknown as Record<string, unknown>).__cerebral = {
        p, tier, composeX,
        // Collapses the easing so a frame can be inspected at an exact point on
        // the timeline. Development only.
        snap: () => { progress = targetProgress; composeX = ramp(targetProgress, COMPOSITION); snapCam = true; },
        fps: 0,
        cam: camera.position.toArray().map((v) => +v.toFixed(2)),
        aim: _aim.toArray().map((v) => +v.toFixed(2)),
        vis: {
          brain: +brainVisible.toFixed(2), scalp: +scalpVisible.toFixed(2),
          ear: +earVisible.toFixed(2), trace: +traceVisible.toFixed(2),
          lattice: +latticeVisible.toFixed(2), device: +deviceVisible.toFixed(2),
          separate: +separate.toFixed(2),
        },
      };
    }
    composer.render();
  }

  raf = requestAnimationFrame(frame);

  /* -------------------------------------------------------------- teardown -- */

  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointerMove);
    for (const obj of [brainPoints, wireLines, scalpArray.points, earArrayR.points,
      earArrayL.points, traceEEG.points, traceEMG.points, lattice.nodePts,
      lattice.edges, device.points]) {
      obj.geometry.dispose();
      const m = obj.material as THREE.Material | THREE.Material[];
      if (Array.isArray(m)) m.forEach((x) => x.dispose()); else m.dispose();
    }
    composer.dispose();
    renderer.dispose();
  }

  return {
    tier,
    setProgress(p: number) { targetProgress = Math.min(1, Math.max(0, p)); },
    resize,
    setPaused(v: boolean) { paused = v; },
    dispose,
  };
}
