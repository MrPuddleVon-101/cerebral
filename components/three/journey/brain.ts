import * as THREE from 'three';
import { hash1, ridged, simplex3 } from './noise';

/**
 * Procedural brain point cloud.
 *
 * Built from maths rather than a downloaded mesh so the geometry stays tiny,
 * loads instantly, and matches the Cerebral mark — which is itself a cluster of
 * particles in the shape of a brain.
 *
 * Coordinate convention: +X right, +Y superior (up), +Z anterior (forward,
 * toward the face). Units are roughly "half a head", i.e. the cerebrum spans
 * about 2.0 x 1.5 x 2.4.
 *
 * This is an illustrative surface, not an anatomical atlas. It is used for
 * orientation and narrative only; no measurement on this site is derived
 * from it.
 */

export type BrainRegion = 0 | 1 | 2; // cerebrum | cerebellum | brainstem

export interface BrainCloud {
  /** xyz triples, length = count * 3 */
  positions: Float32Array;
  /** outward surface normals, length = count * 3 — drives the lighting */
  normals: Float32Array;
  /** scattered start positions used for the assemble-on-load animation */
  scatter: Float32Array;
  /** per-point stable random in [0,1) */
  seed: Float32Array;
  /** surface fold depth in [0,1]; low = deep in a sulcus */
  fold: Float32Array;
  /** 1 for surface points, <1 for interior filler points */
  depth: Float32Array;
  count: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Evenly distributed directions on the unit sphere. */
function fibonacciDir(i: number, n: number, out: THREE.Vector3): THREE.Vector3 {
  const y = 1 - (i / (n - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const phi = i * 2.399963229728653; // golden angle
  return out.set(Math.cos(phi) * r, y, Math.sin(phi) * r);
}

/**
 * Deform a unit-sphere direction into the silhouette of a cerebrum:
 * narrower frontal pole, bulging temporal lobes, flattened inferior surface,
 * and a longitudinal fissure splitting the hemispheres.
 */
function shapeCerebrum(dir: THREE.Vector3, out: THREE.Vector3): void {
  const { x: dx, y: dy, z: dz } = dir;

  let a = 0.98; // lateral half-width
  let b = 0.80; // vertical half-height
  const c = 1.24; // anterior-posterior half-length

  // Frontal pole tapers in and down.
  const front = smoothstep(0.12, 1.0, dz);
  a *= 1 - 0.24 * front;
  b *= 1 - 0.14 * front;

  // Occipital pole tapers slightly too, and comes to more of a point.
  const back = smoothstep(0.18, 1.0, -dz);
  a *= 1 - 0.16 * back;
  b *= 1 - 0.09 * back;

  let px = dx * a;
  let py = dy * b;
  let pz = dz * c;

  // The vertex of the skull sits behind centre: droop both poles a little.
  py -= 0.075 * front;
  py -= 0.045 * back;

  // The base of the brain is close to flat where it sits on the skull floor.
  if (py < 0) {
    const t = smoothstep(0.25, 1.0, -py / 0.8);
    py *= 1 - 0.34 * t;
    if (py < -0.54) py = -0.54 - (py + 0.54) * 0.18;
  }

  // Temporal lobes: low, lateral, reaching forward.
  const temporal =
    smoothstep(0.30, 0.95, Math.abs(dx)) *
    smoothstep(0.12, -0.58, dy) *
    smoothstep(-0.80, 0.25, dz);
  px += Math.sign(px || 1) * 0.13 * temporal;
  py -= 0.075 * temporal;

  // Longitudinal fissure: a groove down the top midline separating hemispheres.
  const onTop = smoothstep(0.02, 0.50, dy);
  const nearMid = 1 - smoothstep(0.015, 0.20, Math.abs(dx));
  const fissure = onTop * nearMid;
  py -= 0.19 * fissure;
  px += Math.sign(dx || 1) * 0.030 * onTop;

  out.set(px, py, pz);
}

/**
 * The lateral (Sylvian) fissure — the deep groove dividing the temporal lobe
 * from the frontal and parietal lobes. It is the single feature that makes a
 * brain read as a brain in profile, so it is carved explicitly rather than
 * left to noise.
 *
 * Returns groove strength in [0,1] for a point already in shaped space.
 */
function sylvianGroove(p: THREE.Vector3, dx: number): number {
  const z = Math.max(-0.55, Math.min(0.75, p.z));
  // Fissure line, sweeping up and back from the anterior-inferior surface.
  const yLine = -0.30 + (0.60 - z) * 0.34;
  const d = (p.y - yLine) / 0.082;
  const along = smoothstep(-0.95, -0.55, p.z) * smoothstep(0.88, 0.52, p.z);
  const lateral = smoothstep(0.42, 0.92, Math.abs(dx));
  return Math.exp(-d * d) * along * lateral;
}

/**
 * The central sulcus — the groove separating the frontal lobe from the
 * parietal lobe. It runs from near the vertex, just behind the midline peak,
 * down and forward across the lateral surface. Together with the Sylvian
 * fissure it gives the cortex its recognisable four-lobe division.
 */
function centralSulcus(p: THREE.Vector3, dir: THREE.Vector3): number {
  // Plane fitted through the superior-medial and inferior-lateral endpoints.
  const d = (0.4375 * p.y + p.z - 0.26) / 1.0915 / 0.060;
  const offMidline = smoothstep(0.05, 0.30, Math.abs(dir.x));
  const aboveSylvian = smoothstep(-0.30, 0.08, p.y);
  return Math.exp(-d * d) * offMidline * aboveSylvian;
}

/** The superior temporal sulcus — runs below and parallel to the Sylvian. */
function temporalSulcus(p: THREE.Vector3, dx: number): number {
  const z = Math.max(-0.45, Math.min(0.65, p.z));
  const yLine = -0.50 + (0.55 - z) * 0.26;
  const d = (p.y - yLine) / 0.070;
  const along = smoothstep(-0.80, -0.45, p.z) * smoothstep(0.72, 0.42, p.z);
  const lateral = smoothstep(0.48, 0.90, Math.abs(dx));
  return Math.exp(-d * d) * along * lateral * 0.72;
}

/**
 * Cortical folding.
 *
 * Plain layered noise gives an isotropic bumpy surface, which reads as static
 * rather than cortex. Real gyri are long meandering ridges, so the noise
 * coordinate is domain-warped before sampling: that bends the ridges into
 * winding bands instead of regular blobs.
 *
 * The result is then raised to a fractional power, which broadens the gyral
 * crowns and narrows the sulci between them — the asymmetry a real cortical
 * surface has, and the thing that makes light read as folds.
 */
function foldAt(p: THREE.Vector3): number {
  // Domain warp. Two channels is enough to break up the ridge lattice and
  // costs a third less than warping all three axes.
  const wx = simplex3(p.x * 1.55 + 11.3, p.y * 1.55, p.z * 1.55);
  const wz = simplex3(p.x * 1.55, p.y * 1.55 - 7.9, p.z * 1.55 + 21.7);
  const qx = p.x + wx * 0.42;
  const qy = p.y + wz * 0.26;
  const qz = p.z + wz * 0.42;

  const big = ridged(qx * 4.6, qy * 4.0, qz * 3.2);
  const mid = ridged(qx * 9.7 + 31.7, qy * 8.8, qz * 7.1 - 12.3);

  const r = clamp01(big * 0.74 + mid * 0.26);
  // Broad crowns, narrow valleys.
  return clamp01(Math.pow(r, 0.55));
}

/**
 * Full cerebral surface: silhouette, Sylvian fissure, then cortical folding
 * displaced along the local radial direction. `foldOut` receives the fold
 * depth so the caller can shade sulci darker.
 */
function cerebralSurface(
  dir: THREE.Vector3,
  out: THREE.Vector3,
  foldOut?: { v: number },
): THREE.Vector3 {
  shapeCerebrum(dir, out);
  const n = _n.copy(out).normalize();

  const syl = sylvianGroove(out, dir.x);
  const cen = centralSulcus(out, dir);
  const tmp = temporalSulcus(out, dir.x);
  const major = Math.min(1, syl + cen * 0.85 + tmp * 0.7);

  out.addScaledVector(n, -0.140 * syl - 0.105 * cen - 0.068 * tmp);

  const f = foldAt(out);
  // Folding flattens out inside the major fissures.
  out.addScaledVector(n, (f - 0.62) * 0.125 * (1 - major * 0.72));

  // Sulci sit in their own shadow; the named fissures sit deepest of all.
  if (foldOut) foldOut.v = clamp01(f * (1 - major * 0.70));
  return out;
}

const _n = new THREE.Vector3();
const _t1 = new THREE.Vector3();
const _t2 = new THREE.Vector3();
const _d1 = new THREE.Vector3();
const _d2 = new THREE.Vector3();
const _p1 = new THREE.Vector3();
const _p2 = new THREE.Vector3();
const _UP = new THREE.Vector3(0, 1, 0);
const _ALT = new THREE.Vector3(1, 0, 0);

/**
 * Outward normal of the cerebral surface, by central difference across two
 * tangent directions. Costs three surface evaluations per point, paid once at
 * build time — it is what lets the shader light the gyri instead of rendering
 * undifferentiated static.
 */
function cerebralNormal(dir: THREE.Vector3, at: THREE.Vector3, out: THREE.Vector3): void {
  const ref = Math.abs(dir.y) > 0.95 ? _ALT : _UP;
  _t1.crossVectors(dir, ref).normalize();
  _t2.crossVectors(dir, _t1).normalize();

  const eps = 0.0075;
  _d1.copy(dir).addScaledVector(_t1, eps).normalize();
  _d2.copy(dir).addScaledVector(_t2, eps).normalize();

  cerebralSurface(_d1, _p1);
  cerebralSurface(_d2, _p2);

  _p1.sub(at);
  _p2.sub(at);
  out.crossVectors(_p1, _p2).normalize();
  if (out.dot(at) < 0) out.negate();
  if (!Number.isFinite(out.x)) out.copy(at).normalize();
}

export function buildBrain(targetCount: number): BrainCloud {
  // Roughly anatomical mass split.
  const nCerebrum = Math.floor(targetCount * 0.845);
  const nCerebellum = Math.floor(targetCount * 0.105);
  const nStem = targetCount - nCerebrum - nCerebellum;
  const count = nCerebrum + nCerebellum + nStem;

  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const fold = new Float32Array(count);
  const depth = new Float32Array(count);

  const dir = new THREE.Vector3();
  const p = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const foldOut = { v: 0 };

  let w = 0;

  // ---- Cerebrum -----------------------------------------------------------
  for (let i = 0; i < nCerebrum; i++) {
    fibonacciDir(i, nCerebrum, dir);
    // Jitter so the fibonacci spiral never reads as a visible pattern.
    dir.x += (hash1(i * 3 + 1) - 0.5) * 0.012;
    dir.y += (hash1(i * 3 + 2) - 0.5) * 0.012;
    dir.z += (hash1(i * 3 + 3) - 0.5) * 0.012;
    dir.normalize();

    cerebralSurface(dir, p, foldOut);
    cerebralNormal(dir, p, nrm);

    // A fifth of the points sit just beneath the surface so the cloud reads as
    // a volume rather than a hollow shell when it rotates.
    let d = 1;
    if (hash1(i * 7 + 11) < 0.13) {
      d = 0.52 + hash1(i * 7 + 13) * 0.20;
      p.multiplyScalar(0.72 + hash1(i * 7 + 17) * 0.20);
    }

    positions[w * 3] = p.x;
    positions[w * 3 + 1] = p.y;
    positions[w * 3 + 2] = p.z;
    normals[w * 3] = nrm.x;
    normals[w * 3 + 1] = nrm.y;
    normals[w * 3 + 2] = nrm.z;
    seed[w] = hash1(i * 31 + 5);
    fold[w] = foldOut.v;
    depth[w] = d;
    w++;
  }

  // ---- Cerebellum ---------------------------------------------------------
  // Tucked beneath the occipital lobe, with fine horizontal folia.
  const cbCenter = new THREE.Vector3(0, -0.50, -0.78);
  for (let i = 0; i < nCerebellum; i++) {
    fibonacciDir(i, nCerebellum, dir);
    dir.x += (hash1(i * 5 + 101) - 0.5) * 0.03;
    dir.y += (hash1(i * 5 + 102) - 0.5) * 0.03;
    dir.z += (hash1(i * 5 + 103) - 0.5) * 0.03;
    dir.normalize();

    p.set(dir.x * 0.43, dir.y * 0.215, dir.z * 0.28);
    // Two lateral lobes with a midline vermis between them.
    p.x *= 1 + 0.20 * smoothstep(0.25, 0.9, Math.abs(dir.x));
    p.y -= 0.055 * smoothstep(0.30, 1.0, Math.abs(dir.x));

    nrm.set(p.x / 0.43, p.y / 0.215, p.z / 0.28).normalize();
    // Folia: noise stretched hard in Y reads as tight horizontal banding.
    const folia = Math.pow(ridged(p.x * 5.5, p.y * 42.0, p.z * 5.5), 0.6);
    p.addScaledVector(nrm, (folia - 0.6) * 0.042);
    p.add(cbCenter);

    let d = 1;
    if (hash1(i * 9 + 211) < 0.12) {
      d = 0.52 + hash1(i * 9 + 213) * 0.2;
      p.sub(cbCenter).multiplyScalar(0.78).add(cbCenter);
    }

    positions[w * 3] = p.x;
    positions[w * 3 + 1] = p.y;
    positions[w * 3 + 2] = p.z;
    normals[w * 3] = nrm.x;
    normals[w * 3 + 1] = nrm.y;
    normals[w * 3 + 2] = nrm.z;
    seed[w] = hash1(i * 37 + 71);
    fold[w] = clamp01(folia * 0.62 + 0.02);
    depth[w] = d;
    w++;
  }

  // ---- Brainstem ----------------------------------------------------------
  // Tapered column dropping from the midbrain down and slightly forward.
  for (let i = 0; i < nStem; i++) {
    const t = i / Math.max(1, nStem - 1);
    const ang = hash1(i * 11 + 401) * Math.PI * 2;
    const rad = (0.175 - 0.070 * t) * (0.74 + hash1(i * 11 + 403) * 0.26);
    const y = -0.36 - t * 0.72;
    const z = -0.48 + t * 0.20;

    p.set(Math.cos(ang) * rad, y, z + Math.sin(ang) * rad * 0.9);
    nrm.set(Math.cos(ang), 0.18, Math.sin(ang)).normalize();

    positions[w * 3] = p.x;
    positions[w * 3 + 1] = p.y;
    positions[w * 3 + 2] = p.z;
    normals[w * 3] = nrm.x;
    normals[w * 3 + 1] = nrm.y;
    normals[w * 3 + 2] = nrm.z;
    seed[w] = hash1(i * 41 + 131);
    fold[w] = 0.50 + hash1(i * 13 + 405) * 0.20;
    depth[w] = 0.94;
    w++;
  }

  // ---- Scatter field ------------------------------------------------------
  // Where each point starts before the brain assembles on first paint.
  for (let i = 0; i < count; i++) {
    const a = hash1(i * 3 + 9001) * Math.PI * 2;
    const u = hash1(i * 3 + 9002) * 2 - 1;
    const r = 5.5 + hash1(i * 3 + 9003) * 9.0;
    const sx = Math.sqrt(Math.max(0, 1 - u * u));
    scatter[i * 3] = Math.cos(a) * sx * r;
    scatter[i * 3 + 1] = u * r * 0.65;
    scatter[i * 3 + 2] = Math.sin(a) * sx * r;
  }

  return { positions, normals, scatter, seed, fold, depth, count };
}

/**
 * Build short connections between nearby surface points — the "wiring" layer.
 * Uses a coarse spatial hash so this stays linear in the point count.
 */
export function buildConnections(
  cloud: BrainCloud,
  maxLines: number,
  maxDist = 0.16,
): { positions: Float32Array; seed: Float32Array; along: Float32Array; count: number } {
  const cell = maxDist;
  const grid = new Map<string, number[]>();
  const key = (x: number, y: number, z: number) =>
    `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;

  // Only surface points (depth === 1) make good-looking connections.
  const candidates: number[] = [];
  for (let i = 0; i < cloud.count; i++) {
    if (cloud.depth[i] > 0.99 && hash1(i * 17 + 3) < 0.35) candidates.push(i);
  }
  for (const i of candidates) {
    const k = key(cloud.positions[i * 3], cloud.positions[i * 3 + 1], cloud.positions[i * 3 + 2]);
    const b = grid.get(k);
    if (b) b.push(i); else grid.set(k, [i]);
  }

  const pos: number[] = [];
  const sd: number[] = [];
  const along: number[] = [];
  const maxDist2 = maxDist * maxDist;

  outer: for (const i of candidates) {
    const ax = cloud.positions[i * 3];
    const ay = cloud.positions[i * 3 + 1];
    const az = cloud.positions[i * 3 + 2];
    const cx = Math.floor(ax / cell), cy = Math.floor(ay / cell), cz = Math.floor(az / cell);

    for (let ox = -1; ox <= 1; ox++)
      for (let oy = -1; oy <= 1; oy++)
        for (let oz = -1; oz <= 1; oz++) {
          const b = grid.get(`${cx + ox},${cy + oy},${cz + oz}`);
          if (!b) continue;
          for (const j of b) {
            if (j <= i) continue;
            const dx = cloud.positions[j * 3] - ax;
            const dy = cloud.positions[j * 3 + 1] - ay;
            const dz = cloud.positions[j * 3 + 2] - az;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 > maxDist2 || d2 < 0.0025) continue;
            if (hash1(i * 7919 + j) > 0.06) continue; // keep it sparse

            const s = hash1(i * 104729 + j * 31);
            pos.push(ax, ay, az, cloud.positions[j * 3], cloud.positions[j * 3 + 1], cloud.positions[j * 3 + 2]);
            sd.push(s, s);
            along.push(0, 1);
            if (pos.length / 6 >= maxLines) break outer;
          }
        }
  }

  return {
    positions: new Float32Array(pos),
    seed: new Float32Array(sd),
    along: new Float32Array(along),
    count: pos.length / 3,
  };
}

/**
 * Electrode site helpers.
 *
 * These are illustrative placements for the scroll narrative — a schematic of
 * "many electrodes across the scalp" versus "a small array behind the ear".
 * They are not the 10-20 system and are not the montage used in any study.
 */

/** A dense scalp montage: the cumbersome full-cap case. */
export function scalpSites(n = 42): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const dir = new THREE.Vector3();
  const p = new THREE.Vector3();
  let i = 0;
  let guard = 0;
  while (out.length < n && guard++ < n * 40) {
    fibonacciDir(i++, n * 3, dir);
    if (dir.y < -0.05) continue; // caps cover the upper head only
    shapeCerebrum(dir, p);
    p.multiplyScalar(1.13); // stand off the cortical surface (scalp, not brain)
    out.push(p.clone());
  }
  return out;
}

/**
 * A small array around one ear — the compact configuration Cerebral is
 * interested in. Laid out as a C opening toward the front, approximating the
 * footprint of an around-ear array.
 */
export function earSites(side: 1 | -1, n = 10): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  // Approximate ear position on this simplified head. It sits on the scalp,
  // clear of the cortical surface — the array is worn on the head, not laid on
  // the brain.
  const cy = -0.28;
  const cz = -0.10;
  const radius = 0.33;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    // Sweep from above the ear, behind it, to below it: a C, not a full ring.
    const ang = THREE.MathUtils.lerp(Math.PI * 0.40, Math.PI * 1.55, t);
    const y = cy + Math.sin(ang) * radius * 0.95;
    const z = cz + Math.cos(ang) * radius * 1.08;
    const x = side * (1.19 - 0.05 * Math.abs(Math.sin(ang)));
    out.push(new THREE.Vector3(x, y, z));
  }
  return out;
}

/** World-space point the camera looks at when it moves in on the ear. */
export function earFocus(side: 1 | -1): THREE.Vector3 {
  return new THREE.Vector3(side * 1.15, -0.28, -0.10);
}
