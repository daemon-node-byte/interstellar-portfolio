#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;
varying vec2 vUV;
varying float vTime;
varying vec3 vWorldPos;
varying vec4 vShadowCoord;
varying vec3 vPlanetPosition;
varying float vPlanetRadius;

uniform sampler2D shadowMap;
uniform vec3 sunDir;
uniform vec3 sunPosition;

// Classic 2D noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float craterField(vec2 uv) {
  float craters = 0.0;
  uv *= 10.0;
  for (int i = 0; i < 3; i++) {
    float n = noise(uv + float(i) * 10.0 + vTime * 0.1);
    craters += pow(n, 3.0);
    uv *= 1.5;
  }
  return craters;
}

float getShadow(vec4 shadowCoord) {
  // Perspective divide
  vec3 projCoords = shadowCoord.xyz / shadowCoord.w;
  // Transform from [-1,1] to [0,1]
  projCoords = projCoords * 0.5 + 0.5;
  // Simple shadow map lookup (PCF can be added)
  float shadow = 1.0;
  if (projCoords.x >= 0.0 && projCoords.x <= 1.0 &&
      projCoords.y >= 0.0 && projCoords.y <= 1.0 &&
      projCoords.z >= 0.0 && projCoords.z <= 1.0) {
    float depth = texture2D(shadowMap, projCoords.xy).r;
    float bias = 0.002;
    shadow = projCoords.z - bias > depth ? 0.5 : 1.0;
  }
  return shadow;
}

// Returns 1.0 if in shadow, 0.0 if not
float planetEclipse(vec3 fragPos, vec3 planetPos, float planetRadius, vec3 sunPos) {
  vec3 sunToFrag = fragPos - sunPos;
  float fragDist = length(sunToFrag);
  vec3 sunToPlanet = planetPos - sunPos;
  float proj = dot(sunToPlanet, normalize(sunToFrag));
  if (proj < 0.0 || proj > fragDist) return 0.0;
  vec3 closest = sunPos + normalize(sunToFrag) * proj;
  float dist2 = dot(planetPos - closest, planetPos - closest);
  float r2 = planetRadius * planetRadius;
  return dist2 < r2 ? 1.0 : 0.0;
}

void main() {
  vec3 baseColor = vec3(0.4, 0.4, 0.4); // rocky gray

  // crater intensity
  float crater = craterField(vUV);
  baseColor *= mix(0.8, 1.2, crater);

  // lighting
  vec3 n = normalize(vNormal);
  vec3 l = normalize(sunDir);
  float light = max(dot(n, l), 0.0);
  baseColor *= 0.5 + 0.5 * light;

  // shadow
  float shadow = getShadow(vShadowCoord);
  baseColor *= shadow;

  float eclipse = planetEclipse(vWorldPos, vPlanetPosition, vPlanetRadius, sunPosition);
  if (eclipse > 0.5) baseColor *= 0.2; // darken instead of discard

  gl_FragColor = vec4(baseColor, 1.0);
}
