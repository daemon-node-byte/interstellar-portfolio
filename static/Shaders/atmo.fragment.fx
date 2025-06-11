precision highp float;
varying vec3 vNormal;
uniform vec3 cameraPosition;
uniform vec3 atmoColor;
uniform float coef;   // Fresnel coefficient
uniform float power;  // Fresnel power

void main() {
  // Fresnel term
  vec3 viewDir = normalize(cameraPosition);
  float fresnel = coef + (1.0 - coef) * pow(1.0 - dot(vNormal, viewDir), power);
  gl_FragColor = vec4(atmoColor * fresnel, fresnel * 0.5);
}
