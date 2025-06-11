// src/lib/babylon/shaders/planet.vertex.fx
precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform float time;

// Varyings
varying vec3 vNormal;
varying vec2 vUV;
varying float vTime;

void main() {
  vNormal = normalize(normal);
  vUV     = uv;
  vTime   = time;
  gl_Position = worldViewProjection * vec4(position, 1.0);
}
