/**
 * GLSL for the Cerebral scroll journey.
 *
 * Every object in the scene — cortex, electrodes, signal traces, the decoding
 * lattice, the device — is drawn as points from the same material family, so
 * the whole experience is made of one substance: the particle cluster in the
 * Cerebral mark.
 */

/** Shared helpers injected into several shaders. */
const COMMON = /* glsl */ `
  float sstep(float a, float b, float x) { return smoothstep(a, b, x); }
`;

/* ------------------------------------------------------------------ cortex */

export const brainVert = /* glsl */ `
  ${COMMON}

  uniform float uTime;
  uniform float uAssemble;   // 0 = scattered in the void, 1 = brain
  uniform float uDissolve;   // pushes points outward along the normal
  uniform float uSize;
  uniform float uScale;      // drawingBufferHeight / (2 * tan(fov/2))
  uniform float uOpacity;
  uniform float uExposure;
  uniform float uFogNear;    // view depth where the fade begins
  uniform float uFogFar;     // view depth where the fade bottoms out
  uniform vec4  uPulses[4];  // xyz = origin on the cortex, w = shell radius
  uniform vec4  uTouch;      // xyz = cursor point on the cortex, w = strength

  attribute vec3  aScatter;
  attribute float aSeed;
  attribute float aFold;
  attribute float aDepth;

  varying float vShade;
  varying float vGlow;
  varying float vAlpha;

  void main() {
    vec3 home = position;
    vec3 pos  = mix(aScatter, home, uAssemble);

    // Slow idle breathing so the cortex never looks frozen.
    pos += normal * (sin(uTime * 0.6 + aSeed * 43.0) * 0.0055);

    // Dissolve outward when an act hands the stage to another object. The
    // per-point offset makes it break up as a travelling wave.
    float dis = clamp(uDissolve * 1.38 - aSeed * 0.36, 0.0, 1.0);
    dis = dis * dis * (3.0 - 2.0 * dis);
    pos += normal * dis * (0.30 + aSeed * 1.75);

    float touchLift = (1.0 - sstep(0.0, 0.58, distance(home, uTouch.xyz))) * uTouch.w;
    pos += normal * touchLift * 0.048;

    // Travelling activation wavefronts — expanding shells from a few origins.
    float glow = 0.0;
    for (int i = 0; i < 4; i++) {
      float r = uPulses[i].w;
      if (r < 0.0) continue;
      float d = distance(home, uPulses[i].xyz);
      glow += (1.0 - sstep(0.0, 0.17, abs(d - r))) * (1.0 - sstep(0.5, 2.4, r));
    }
    // The cortex answers the cursor: a local bloom, and the surface lifts
    // very slightly toward it.
    float touch = (1.0 - sstep(0.0, 0.58, distance(home, uTouch.xyz))) * uTouch.w;
    glow += touch * 1.35;
    glow = min(glow, 2.3);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    vec3 nrmView = normalize(normalMatrix * normal);
    vec3 viewDir = normalize(-mv.xyz);

    // The rig travels with the camera. A world-fixed key would backlight the
    // cortex for half the journey as the camera orbits it.
    const vec3 KEY  = vec3(-0.4226, 0.5836, 0.6923);
    const vec3 FILL = vec3( 0.7902, -0.1317, 0.5985);

    float lam  = max(dot(nrmView, KEY), 0.0);
    float fill = max(dot(nrmView, FILL), 0.0);
    float rim  = pow(1.0 - max(dot(nrmView, viewDir), 0.0), 2.1);
    float ao   = pow(aFold, 2.10);           // sulci sit in their own shadow

    // Depth fade: without it the far surface is as bright as the near one and
    // the cortex reads as a translucent cloud instead of a solid object.
    float fog = 1.0 - smoothstep(uFogNear, uFogFar, -mv.z) * 0.78;

    vShade = ((0.085 + 1.22 * lam + 0.30 * fill) * (0.17 + 0.83 * ao)
              + 0.30 * rim * ao) * aDepth * fog * uExposure;
    vGlow  = glow * aDepth * mix(0.35, 1.0, fog);
    vAlpha = uOpacity * mix(0.45, 1.0, aDepth) * clamp(uAssemble * 1.4, 0.0, 1.0)
             * mix(0.55, 1.0, fog);

    gl_Position  = projectionMatrix * mv;
    float size   = uSize * (0.74 + aSeed * 0.40) * (1.0 + glow * 1.5);
    gl_PointSize = clamp(size * uScale / max(0.12, -mv.z), 0.0, 11.0);
  }
`;

export const brainFrag = /* glsl */ `
  uniform vec3 uBone;
  uniform vec3 uSignal;

  varying float vShade;
  varying float vGlow;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;

    float a = smoothstep(0.25, 0.015, d2);
    float alpha = a * vAlpha;
    if (alpha < 0.012) discard;

    vec3 col = uBone * vShade;
    col = mix(col, uSignal, clamp(vGlow, 0.0, 1.0) * 0.8);
    col += uSignal * vGlow * 0.55;

    gl_FragColor = vec4(col, alpha);
  }
`;

/* ----------------------------------------------------------- cortical wiring */

export const wireVert = /* glsl */ `
  uniform float uTime;
  attribute float aSeed;
  attribute float aAlong;   // 0 at one end of the segment, 1 at the other
  varying float vI;

  void main() {
    float phase = fract(uTime * 0.10 + aSeed);
    float head  = phase * 1.3 - 0.15;
    vI = (1.0 - smoothstep(0.0, 0.5, abs(aAlong - head))) * step(phase, 0.86);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const wireFrag = /* glsl */ `
  uniform vec3  uBone;
  uniform vec3  uSignal;
  uniform float uOpacity;
  varying float vI;

  void main() {
    vec3 col = mix(uBone * 0.30, uSignal, vI);
    float a = (0.030 + vI * 0.55) * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(col * (0.4 + vI), a);
  }
`;

/* ------------------------------------------------------------- signal traces */

/**
 * EEG and EMG are synthesised, not recorded. They are shaped to carry the
 * distinction the site is teaching — EEG as a slow, low-amplitude rhythm,
 * EMG as short high-frequency bursts — and are labelled as illustrative in the
 * surrounding copy.
 */
export const traceVert = /* glsl */ `
  ${COMMON}

  uniform float uTime;
  uniform float uScale;
  uniform float uSize;
  uniform float uReveal;     // 0..1 wipe from the electrode outward
  uniform float uSeparate;   // 0 = mixed on one axis, 1 = pulled apart
  uniform float uAmp;
  uniform float uKind;       // 0 = EEG, 1 = EMG
  uniform vec3  uOrigin;     // where the trace leaves the head
  uniform vec3  uAxis;       // direction it streams away in
  uniform vec3  uLift;       // axis the waveform deflects along
  uniform float uLength;

  attribute float aT;        // 0..1 along the trace
  attribute float aSeed;

  varying float vI;
  varying float vHead;

  float eegWave(float x, float t) {
    return ( sin(x *  7.0 - t * 2.10) * 0.46
           + sin(x * 16.7 - t * 3.70) * 0.19
           + sin(x *  3.1 - t * 1.05) * 0.31
           + sin(x * 39.0 - t * 7.30) * 0.07 ) * 0.5;
  }

  float emgWave(float x, float t) {
    float burst   = smoothstep(0.58, 1.0, sin(x * 1.7 - t * 1.25) * 0.5 + 0.5);
    float carrier = sin(x * 92.0 - t * 21.0) + sin(x * 127.0 + t * 16.0) * 0.7;
    return carrier * 0.30 * (0.05 + burst);
  }

  void main() {
    float x = aT * uLength;
    float w = mix(eegWave(aT * 6.0, uTime), emgWave(aT * 6.0, uTime), uKind);

    // Amplitude swells as the trace leaves the head, then settles.
    float env = smoothstep(0.0, 0.10, aT) * (1.0 - smoothstep(0.86, 1.0, aT));

    vec3 pos = uOrigin + uAxis * x + uLift * (w * uAmp * env);

    // When separated, EEG rides above the axis and EMG below.
    pos += uLift * uSeparate * mix(0.52, -0.52, uKind) * env;

    // Reveal wipes along the trace so it appears to stream out of the sensor.
    float rev = smoothstep(uReveal - 0.16, uReveal, 1.0 - aT);
    vI = env * (1.0 - rev);
    if (vI < 0.003) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // cull off-screen
      gl_PointSize = 0.0;
      return;
    }

    // A brighter packet runs along the trace.
    float packet = fract(uTime * 0.22 - aT * 0.9 + aSeed * 0.02);
    vHead = pow(1.0 - min(packet, 1.0 - packet) * 2.0, 6.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * (0.8 + vHead * 1.9) * uScale / max(0.12, -mv.z), 0.0, 9.0);
  }
`;

export const traceFrag = /* glsl */ `
  uniform vec3  uColor;
  uniform float uOpacity;
  varying float vI;
  varying float vHead;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;
    float a = smoothstep(0.25, 0.02, d2) * vI * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor * (0.42 + vHead * 1.35), a);
  }
`;

/* ------------------------------------------------------------ decoding lattice */

export const latticeVert = /* glsl */ `
  ${COMMON}

  uniform float uTime;
  uniform float uScale;
  uniform float uSize;
  uniform float uSweep;      // 0..1 activation front travelling through layers
  uniform float uOpacity;

  attribute float aLayer;    // normalised layer index 0..1
  attribute float aSeed;

  varying float vAct;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.8 + aSeed * 30.0) * 0.012;

    float front = uSweep * 1.35 - 0.18;
    vAct = (1.0 - sstep(0.0, 0.26, abs(aLayer - front))) * step(0.001, uSweep);
    vAlpha = uOpacity;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * (1.0 + vAct * 2.4) * uScale / max(0.12, -mv.z), 0.0, 20.0);
  }
`;

export const latticeFrag = /* glsl */ `
  uniform vec3 uBone;
  uniform vec3 uSignal;
  varying float vAct;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;
    float a = smoothstep(0.25, 0.02, d2) * vAlpha * (0.32 + vAct * 0.9);
    if (a < 0.01) discard;
    vec3 col = mix(uBone * 0.62, uSignal, vAct);
    gl_FragColor = vec4(col * (0.7 + vAct * 1.8), a);
  }
`;

export const latticeLineVert = /* glsl */ `
  uniform float uTime;
  uniform float uSweep;
  attribute float aLayer;
  attribute float aSeed;
  varying float vAct;

  void main() {
    float front = uSweep * 1.35 - 0.18;
    vAct = (1.0 - smoothstep(0.0, 0.30, abs(aLayer - front))) * step(0.001, uSweep);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const latticeLineFrag = /* glsl */ `
  uniform vec3  uBone;
  uniform vec3  uSignal;
  uniform float uOpacity;
  varying float vAct;

  void main() {
    float a = (0.035 + vAct * 0.42) * uOpacity;
    if (a < 0.005) discard;
    gl_FragColor = vec4(mix(uBone * 0.28, uSignal, vAct) * (0.5 + vAct), a);
  }
`;

/* --------------------------------------------------------------- device form */

export const deviceVert = /* glsl */ `
  ${COMMON}

  uniform float uTime;
  uniform float uScale;
  uniform float uSize;
  uniform float uForm;       // 0 = dispersed cloud, 1 = resolved device
  uniform float uOpacity;

  attribute vec3  aScatter;
  attribute float aSeed;
  attribute float aNode;     // 1 on an electrode site, 0 on the shell

  varying float vNode;
  varying float vAlpha;

  void main() {
    vec3 pos = mix(aScatter, position, uForm);
    pos += normal * sin(uTime * 1.1 + aSeed * 27.0) * 0.004;

    // Electrode sites breathe on their own slower cycle.
    float beat = 0.5 + 0.5 * sin(uTime * 1.9 + aSeed * 6.283);
    vNode  = aNode * beat;
    vAlpha = uOpacity * uForm;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * (0.7 + aSeed * 0.5 + aNode * (0.55 + beat * 0.45))
                 * uScale / max(0.12, -mv.z), 0.0, 11.0);
  }
`;

export const deviceFrag = /* glsl */ `
  uniform vec3 uBone;
  uniform vec3 uSignal;
  varying float vNode;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;
    float a = smoothstep(0.25, 0.02, d2) * vAlpha * (0.40 + vNode * 0.32);
    if (a < 0.01) discard;
    gl_FragColor = vec4(mix(uBone * 0.72, uSignal, vNode * 0.8) * (0.62 + vNode * 0.45), a);
  }
`;

/* ------------------------------------------------------------------ electrodes */

export const electrodeVert = /* glsl */ `
  uniform float uTime;
  uniform float uScale;
  uniform float uSize;
  uniform float uOpacity;
  uniform float uActive;     // staggered appearance of the array

  attribute float aSeed;
  attribute float aOrder;    // 0..1 position in the reveal sequence

  varying float vPulse;
  varying float vAlpha;

  void main() {
    float on = smoothstep(aOrder - 0.05, aOrder + 0.18, uActive);
    vPulse = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 2.4 - aOrder * 4.0), 2.0);
    vAlpha = uOpacity * on;

    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * on * (0.85 + vPulse * 0.9) * uScale / max(0.12, -mv.z), 0.0, 42.0);
  }
`;

export const electrodeFrag = /* glsl */ `
  uniform vec3 uColor;
  varying float vPulse;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    // Ring, not a disc — reads as a sensor contact rather than another particle.
    float ring = smoothstep(0.50, 0.40, d) * smoothstep(0.20, 0.30, d);
    float core = smoothstep(0.16, 0.0, d);
    float a = (ring * 0.95 + core * 0.55) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor * (0.7 + vPulse * 1.5), a);
  }
`;

/* --------------------------------------------------------------- final grade */

/**
 * Film grade applied after bloom: vignette, a faint horizontal scan, animated
 * grain and a touch of edge chromatic aberration. Keeps the render feeling like
 * an instrument readout rather than a clean CG render.
 */
export const gradeShader = {
  uniforms: {
    tDiffuse: { value: null as unknown },
    uTime: { value: 0 },
    uAmount: { value: 1 },
    uAberration: { value: 0.0006 },
    uGrain: { value: 0.006 },
    uResolution: { value: [1, 1] },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAmount;
    uniform float uAberration;
    uniform float uGrain;
    uniform vec2  uResolution;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      vec2 fromCentre = uv - 0.5;
      float r2 = dot(fromCentre, fromCentre);

      // Chromatic aberration grows toward the edge of the frame.
      float ab = uAberration * uAmount * r2 * 4.0;
      vec3 col;
      col.r = texture2D(tDiffuse, uv + fromCentre * ab).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - fromCentre * ab).b;

      // Vignette.
      col *= 1.0 - uAmount * smoothstep(0.20, 1.05, r2) * 0.44;

      // Animated grain, stronger in the shadows where banding would show.
      float g = hash(uv * uResolution + fract(uTime) * 91.7) - 0.5;
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col += g * uGrain * uAmount * (1.0 - smoothstep(0.0, 0.55, lum));

      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }
  `,
};
