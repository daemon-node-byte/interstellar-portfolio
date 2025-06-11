precision highp float;
attribute vec3 position;
uniform mat4 worldViewProjection;
varying vec3 vNormal;
void main() {
  vNormal = normalize(position);
  gl_Position = worldViewProjection * vec4(position, 1.0);
}
