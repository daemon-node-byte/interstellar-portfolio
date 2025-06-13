precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 worldViewProjection;
uniform mat4 world;
uniform mat4 lightMatrix;
uniform float time;
uniform vec3 planetPosition;
uniform float planetRadius;

varying vec3 vPlanetPosition;
varying float vPlanetRadius;
varying vec3 vNormal;
varying vec2 vUV;
varying float vTime;
varying vec3 vWorldPos;
varying vec4 vShadowCoord;

void main() {
  vNormal = normalize(mat3(world) * normal);
  vUV = uv;
  vTime = time;
  vPlanetPosition = planetPosition;
  vPlanetRadius = planetRadius;
  vWorldPos = (world * vec4(position, 1.0)).xyz;
  vShadowCoord = lightMatrix * world * vec4(position, 1.0);
  gl_Position = worldViewProjection * vec4(position, 1.0);
}
