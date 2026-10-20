'use client';

import { useEffect, useRef, useState } from 'react';

import { asset } from '@/lib/asset';

/**
 * Author portrait: the photograph itself, graded to the site's two values, with
 * a live particle outline traced around its silhouette.
 *
 * Two assets, both produced offline:
 *   author-cutout.webp     the graded photograph with its alpha, where the
 *                          alpha is pulled slightly INSIDE the true silhouette
 *                          so the image dissolves before its own edge
 *   author-silhouette.png  the clean binary mask, which the outline is traced
 *                          from — tracing the photo's own alpha picked up
 *                          interior soft regions and scattered particles
 *                          across the face
 *
 * The subject was separated from the wall on two cues that agree: the granite
 * is warm and mid-bright, while the leather jacket is neutral and darker than
 * it. Shadowed skin reads like the wall on both, so the residual-wall cleanup
 * is confined to a band around the mask boundary and never touches the face.
 */
export function AuthorPortrait({ alt }: { alt: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    Promise.all([
      import('three'),
      new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = asset('/brand/author-silhouette.png');
      }),
    ])
      .then(([THREE, img]) => {
        if (disposed) return;
        setLoaded(true);

        const IW = img.width;
        const IH = img.height;
        const off = document.createElement('canvas');
        off.width = IW;
        off.height = IH;
        const ctx = off.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('no 2d context');
        ctx.drawImage(img, 0, 0);
        const px = ctx.getImageData(0, 0, IW, IH).data;

        // Greyscale silhouette: coverage is in the red channel.
        const alphaAt = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= IW || y >= IH) return 0;
          return px[(y * IW + x) * 4] / 255;
        };

        // Walk the alpha channel for the 0.5 crossing: that is the silhouette.
        const edge: { x: number; y: number; nx: number; ny: number }[] = [];
        const STEP = 1;
        for (let y = 1; y < IH - 1; y += STEP) {
          for (let x = 1; x < IW - 1; x += STEP) {
            const a = alphaAt(x, y);
            if (a < 0.42 || a > 0.995) continue;
            const gx = alphaAt(x + 1, y) - alphaAt(x - 1, y);
            const gy = alphaAt(x, y + 1) - alphaAt(x, y - 1);
            const g = Math.hypot(gx, gy);
            if (g < 0.04) continue;
            edge.push({ x, y, nx: -gx / g, ny: -gy / g }); // outward
          }
        }
        if (edge.length === 0) return;

        const coarse = window.matchMedia('(pointer: coarse)').matches;
        const WANT = coarse || window.innerWidth < 800 ? 3200 : 9000;

        let s = 0x51ab37 >>> 0;
        const rnd = () => {
          s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
          return s / 4294967296;
        };

        const COUNT = Math.min(WANT, edge.length * 3);
        const pos = new Float32Array(COUNT * 3);
        const nrm = new Float32Array(COUNT * 2);
        const seed = new Float32Array(COUNT);
        const drift = new Float32Array(COUNT);

        // Portrait plane spans 2 x 2*(IH/IW) world units, centred on origin.
        const SX = 2.0;
        const SY = SX * (IH / IW);

        for (let k = 0; k < COUNT; k++) {
          const e = edge[(rnd() * edge.length) | 0];
          const jitter = rnd() * 2.2;   // outward only
          const u = (e.x + e.nx * jitter) / IW;
          const v = (e.y + e.ny * jitter) / IH;
          pos[k * 3] = (u - 0.5) * SX;
          pos[k * 3 + 1] = (0.5 - v) * SY;
          pos[k * 3 + 2] = (rnd() - 0.5) * 0.02;
          nrm[k * 2] = e.nx;
          nrm[k * 2 + 1] = -e.ny;
          seed[k] = rnd();
          // A fifth of them wander well clear of the edge, as embers.
          drift[k] = rnd() < 0.26 ? 0.34 + rnd() * 1.15 : 0.02 + rnd() * 0.12;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('aNormal', new THREE.BufferAttribute(nrm, 2));
        geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
        geo.setAttribute('aDrift', new THREE.BufferAttribute(drift, 1));
        geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 4);

        const uniforms = {
          uTime: { value: 0 },
          uScale: { value: 900 },
          uForm: { value: 0 },
          uSweep: { value: -2 },
          uPointer: { value: new THREE.Vector2(99, 99) },
          uHalf: { value: new THREE.Vector2(1, 1) },
          uBone: { value: new THREE.Color('#EDE9E1') },
          uSignal: { value: new THREE.Color('#BFE4FF') },
        };

        const material = new THREE.ShaderMaterial({
          uniforms,
          transparent: true,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
          vertexShader: /* glsl */ `
            uniform float uTime, uScale, uForm, uSweep;
            uniform vec2 uPointer;
            uniform vec2 uHalf;
            attribute vec2 aNormal;
            attribute float aSeed, aDrift;
            varying float vI;

            void main() {
              vec3 p = position;
              float ph = uTime * (0.20 + aSeed * 0.35) + aSeed * 6.2831;

              // Embers breathe outward along the silhouette normal.
              float out1 = (sin(ph) * 0.5 + 0.5) * aDrift;
              p.xy += aNormal * out1;
              p.x += sin(uTime * 0.6 + aSeed * 19.0) * 0.012 * (0.3 + aDrift);
              p.y += cos(uTime * 0.5 + aSeed * 23.0) * 0.012 * (0.3 + aDrift);

              // Cursor pushes the nearest stretch of outline outward and lights it.
              float d = distance(p.xy, uPointer);
              float near = 1.0 - smoothstep(0.0, 0.62, d);
              p.xy += aNormal * near * 0.13;

              // A band of light travelling up the silhouette.
              float band = 1.0 - smoothstep(0.0, 0.34, abs(position.y - uSweep));

              float fade = 1.0 - smoothstep(0.12, 1.0, out1);

              // Fade out well before the canvas boundary so nothing is ever
              // cut off by a straight edge.
              vec2 q = abs(p.xy) / uHalf;
              float room = 1.0 - smoothstep(0.58, 0.95, max(q.x, q.y));

              vI = (0.46 + band * 0.95 + near * 1.35) * fade * room * uForm;

              vec4 mv = modelViewMatrix * vec4(p, 1.0);
              gl_Position = projectionMatrix * mv;
              gl_PointSize = clamp(
                (0.0062 + aSeed * 0.0045 + near * 0.009) * uScale / max(0.2, -mv.z),
                0.0, 8.0);
            }
          `,
          fragmentShader: /* glsl */ `
            uniform vec3 uBone, uSignal;
            varying float vI;
            void main() {
              vec2 c = gl_PointCoord - 0.5;
              float d2 = dot(c, c);
              if (d2 > 0.25) discard;
              float a = smoothstep(0.25, 0.01, d2) * clamp(vI, 0.0, 1.5) * 0.80;
              if (a < 0.006) discard;
              gl_FragColor = vec4(mix(uBone, uSignal, 0.35) * (0.7 + vI), a);
            }
          `,
        });

        const points = new THREE.Points(geo, material);
        points.frustumCulled = false;
        const scene = new THREE.Scene();
        scene.add(points);

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 3;

        let renderer: import('three').WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
        } catch {
          return;
        }
        renderer.setClearColor(0x000000, 0);

        const resize = () => {
          const hostW = Math.max(1, host.clientWidth);
          const cw = Math.max(1, canvas.clientWidth);
          const ch = Math.max(1, canvas.clientHeight);
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          renderer.setPixelRatio(dpr);
          renderer.setSize(cw, ch, false);

          // The canvas overhangs the photograph. Widening the frustum by the
          // same ratio keeps world units mapping to the same screen size, so
          // the outline still sits exactly on the silhouette.
          const halfX = (SX / 2) * (cw / hostW);
          const halfY = halfX * (ch / cw);
          camera.left = -halfX; camera.right = halfX;
          camera.top = halfY; camera.bottom = -halfY;
          camera.updateProjectionMatrix();
          uniforms.uScale.value = (ch * dpr) / (2 * halfY);
          uniforms.uHalf.value.set(halfX, halfY);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        let inView = false;
        const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { rootMargin: '15% 0px' });
        io.observe(host);

        const onMove = (e: PointerEvent) => {
          const r = host.getBoundingClientRect();
          const u = (e.clientX - r.left) / r.width;
          const v = (e.clientY - r.top) / r.height;
          const halfY = (SX / 2) * (r.height / r.width);
          uniforms.uPointer.value.set((u - 0.5) * SX, (0.5 - v) * halfY * 2);
        };
        const onLeave = () => uniforms.uPointer.value.set(99, 99);
        if (!reduced) {
          window.addEventListener('pointermove', onMove, { passive: true });
          window.addEventListener('blur', onLeave);
        }

        let raf = 0;
        let formT = reduced ? 2 : 0;
        const start = performance.now();
        let last = start;
        const loop = () => {
          raf = requestAnimationFrame(loop);
          const now = performance.now();
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          if (!inView) return;

          const t = (now - start) / 1000;
          uniforms.uTime.value = reduced ? 0 : t;
          formT = Math.min(2, formT + dt / 1.2);
          const f = Math.min(1, formT);
          uniforms.uForm.value = f * f * (3 - 2 * f);
          const halfY = SX / 2 * (host.clientHeight / Math.max(1, host.clientWidth));
          uniforms.uSweep.value = reduced ? 0 : ((t * 0.22) % 2.2) * (halfY * 2.4) - halfY * 1.6;

          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(loop);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          io.disconnect();
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('blur', onLeave);
          geo.dispose();
          material.dispose();
          renderer.dispose();
        };
      })
      .catch(() => undefined);

    return () => { disposed = true; cleanup?.(); };
  }, []);

  return (
    <div className="portrait-stage" ref={hostRef} data-loaded={loaded}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="portrait-photo" src={asset("/brand/author-cutout.webp")} alt={alt} width={582} height={704} />
      <canvas className="portrait-outline" ref={canvasRef} aria-hidden />
    </div>
  );
}
