'use client';

import { useEffect, useRef } from 'react';

/**
 * A quiet particle field behind the inner pages: the same substance as the
 * homepage cortex, at a fraction of the cost and brightness. Purely decorative,
 * and skipped entirely for reduced motion or when WebGL is unavailable.
 */
export function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    import('three').then((THREE) => {
      if (disposed) return;

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
      } catch {
        return;
      }

      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const COUNT = coarse || window.innerWidth < 800 ? 1600 : 4200;

      renderer.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 60);
      camera.position.set(0, 0, 7);

      const pos = new Float32Array(COUNT * 3);
      const seed = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        // A hollow shell reads as depth; a solid ball reads as fog.
        const a = Math.random() * Math.PI * 2;
        const u = Math.random() * 2 - 1;
        const r = 3.4 + Math.random() * 3.6;
        const s = Math.sqrt(Math.max(0, 1 - u * u));
        pos[i * 3] = Math.cos(a) * s * r * 1.5;
        pos[i * 3 + 1] = u * r * 0.85;
        pos[i * 3 + 2] = Math.sin(a) * s * r;
        seed[i] = Math.random();
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

      const uniforms = {
        uTime: { value: 0 },
        uScale: { value: 900 },
        uColor: { value: new THREE.Color('#EDE9E1') },
      };

      const points = new THREE.Points(
        geo,
        new THREE.ShaderMaterial({
          uniforms,
          vertexShader: /* glsl */ `
            uniform float uTime; uniform float uScale;
            attribute float aSeed;
            varying float vI;
            void main() {
              vec3 p = position;
              p.y += sin(uTime * 0.18 + aSeed * 22.0) * 0.32;
              p.x += cos(uTime * 0.13 + aSeed * 17.0) * 0.26;
              vI = 0.16 + 0.5 * pow(0.5 + 0.5 * sin(uTime * 0.5 + aSeed * 40.0), 3.0);
              vec4 mv = modelViewMatrix * vec4(p, 1.0);
              gl_Position = projectionMatrix * mv;
              gl_PointSize = clamp((0.010 + aSeed * 0.012) * uScale / max(0.2, -mv.z), 0.0, 5.0);
            }
          `,
          fragmentShader: /* glsl */ `
            uniform vec3 uColor;
            varying float vI;
            void main() {
              vec2 c = gl_PointCoord - 0.5;
              float d2 = dot(c, c);
              if (d2 > 0.25) discard;
              float a = smoothstep(0.25, 0.02, d2) * vI * 0.5;
              if (a < 0.008) discard;
              gl_FragColor = vec4(uColor, a);
            }
          `,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      points.frustumCulled = false;
      scene.add(points);

      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        uniforms.uScale.value = (h * dpr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
      };
      resize();
      window.addEventListener('resize', resize, { passive: true });

      let raf = 0;
      const start = performance.now();
      const loop = () => {
        raf = requestAnimationFrame(loop);
        uniforms.uTime.value = (performance.now() - start) / 1000;
        scene.rotation.y = uniforms.uTime.value * 0.012;
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        geo.dispose();
        (points.material as import('three').Material).dispose();
        renderer.dispose();
      };
    }).catch(() => undefined);

    return () => { disposed = true; cleanup?.(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.5,
      }}
    />
  );
}
