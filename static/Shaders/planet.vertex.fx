precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform mat4 world; // <-- Added
uniform float time;

// Varyings
varying vec3 vNormal;
varying vec2 vUV;
varying float vTime;
varying vec3 vWorldPos;

void main() {
  vNormal = normalize(normal);
  vUV     = uv;
  vTime   = time;
  vWorldPos = (world * vec4(position, 1.0)).xyz; // <-- Added missing semicolon
  gl_Position = worldViewProjection * vec4(position, 1.0);
}
