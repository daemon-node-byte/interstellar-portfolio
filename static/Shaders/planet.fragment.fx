// src/lib/babylon/shaders/planet.fragment.fx
#ifdef GL_ES
precision highp float;
#endif

// Varyings
varying vec3 vNormal;
varying vec2 vUV;
varying float vTime;

// Classic 2D noise from IQ
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // four corners
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  // smooth interp
  vec2 u = f*f*(3.0 - 2.0*f);
  return mix(a, b, u.x) +
         (c - a)* u.y * (1.0 - u.x) +
         (d - b)* u.x * u.y;
}

// Fractal Brownian Motion
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 m = mat2(1.6,  1.2, -1.2,  1.6);
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = m * p;
    amp *= 0.5;
  }
  return v;
}

// Uniforms for per-planet appearance
uniform vec3 equatorColor;
uniform vec3 midColor;
uniform vec3 poleColor;
uniform float noiseScale;
uniform float noiseSpeed;
uniform float detailMix;

void main() {
  // Base color zones via uv.y (latitude)
  float lat = abs(vUV.y - 0.5) * 2.0;
  vec3 base = mix(equatorColor, poleColor, lat);

  // Dynamic surface detail
  float n1 = fbm(vUV * noiseScale + vTime * noiseSpeed);
  float n2 = fbm((vUV + 10.0) * (noiseScale * 4.0) - vTime * (noiseSpeed * 2.0));
  float detail = mix(n1, n2, detailMix);

  // Combine base + detail
  vec3 color = mix(base * 0.8, base * 1.2, detail);

  // Simple lighting: lambert
  float light = dot(normalize(vNormal), normalize(vec3(0.5,0.8,0.3))) * 0.5 + 0.5;
  color *= light;

  gl_FragColor = vec4(color, 1.0);
}