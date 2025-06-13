#ifdef GL_ES
precision highp float;
#endif



// Varyings
varying vec3 vWorldPos; // <-- Fixed type
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
uniform vec3 sunPosition;
uniform vec3 equatorColor;
uniform vec3 midColor;
uniform vec3 poleColor;
uniform float noiseScale;
uniform float noiseSpeed;
uniform float detailMix;

// Shadow uniforms
uniform sampler2D shadowMap;
uniform mat4 lightMatrix;
uniform sampler2D ringShadowMap;
uniform mat4 ringLightMatrix;

// Eclipse uniforms
#define MAX_MOONS 4
uniform int moonCount;
uniform vec3 moonPositions[MAX_MOONS];
uniform float moonRadii[MAX_MOONS];

// Returns 1.0 if in shadow, 0.0 if not
float moonEclipse(vec3 fragPos, vec3 moonPos, float moonRadius, vec3 sunPos) {
  vec3 sunToFrag = fragPos - sunPos;
  float fragDist = length(sunToFrag);
  vec3 sunToMoon = moonPos - sunPos;
  float proj = dot(sunToMoon, normalize(sunToFrag));
  // Moon must be between sun and fragment
  if (proj < 0.0 || proj > fragDist) return 0.0;
  // Closest approach from moon to sun-fragment line
  vec3 closest = sunPos + normalize(sunToFrag) * proj;
  float dist2 = dot(moonPos - closest, moonPos - closest);
  float r2 = moonRadius * moonRadius;
  return dist2 < r2 ? 1.0 : 0.0;
}

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
  vec3 lightDir = normalize(sunPosition - vWorldPos);
  float light = dot(normalize(vNormal), lightDir) * 0.5 + 0.5;

  // --- Planet shadow ---
  vec4 shadowCoord = lightMatrix * vec4(vWorldPos, 1.0);
  shadowCoord.xyz /= shadowCoord.w;
  float shadow = 1.0;
  if (shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 &&
      shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0 &&
      shadowCoord.z >= 0.0 && shadowCoord.z <= 1.0) {
    float shadowDepth = texture2D(shadowMap, shadowCoord.xy).r;
    float currentDepth = shadowCoord.z - 0.005;
    shadow = currentDepth > shadowDepth ? 0.5 : 1.0;
  }

  // --- Ring shadow ---
  float ringShadow = 1.0;
  vec4 ringShadowCoord = ringLightMatrix * vec4(vWorldPos, 1.0);
  ringShadowCoord.xyz /= ringShadowCoord.w;
  if (ringShadowCoord.x >= 0.0 && ringShadowCoord.x <= 1.0 &&
      ringShadowCoord.y >= 0.0 && ringShadowCoord.y <= 1.0 &&
      ringShadowCoord.z >= 0.0 && ringShadowCoord.z <= 1.0) {
    float ringShadowDepth = texture2D(ringShadowMap, ringShadowCoord.xy).r;
    float ringCurrentDepth = ringShadowCoord.z - 0.005;
    ringShadow = ringCurrentDepth > ringShadowDepth ? 0.5 : 1.0;
  }

  color *= light * shadow * ringShadow;

  // --- Moon eclipse (shadow) ---
  float eclipseShadow = 1.0;
  for (int i = 0; i < MAX_MOONS; i++) {
    if (i >= moonCount) break;
    if (moonEclipse(vWorldPos, moonPositions[i], moonRadii[i], sunPosition) > 0.5) {
      eclipseShadow = 0.2; // darken, not discard
      break;
    }
  }
  color *= eclipseShadow;

  gl_FragColor = vec4(color, 1.0);
}