precision highp float;
varying vec2 vUV;
uniform float innerRadius;
uniform float outerRadius;
uniform vec3 color;

void main() {
  // vUV goes 0→1 across the torus tube; remap to radius
  float r = mix(innerRadius, outerRadius, vUV.y);
  // ring falloff
  float alpha = smoothstep(innerRadius, innerRadius + 0.01, r)
              * (1.0 - smoothstep(outerRadius - 0.01, outerRadius, r));
  gl_FragColor = vec4(color, alpha);
}
