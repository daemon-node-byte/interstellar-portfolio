#ifdef GL_ES
precision highp float;
#endif

varying vec2 vUV;
uniform float time;

//  Simple 2D noise (IQ’s hash + noise):
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(in vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  // four corners
  float a = hash(i);
  float b = hash(i + vec2(1,0));
  float c = hash(i + vec2(0,1));
  float d = hash(i + vec2(1,1));
  // smooth interp
  vec2 u = f*f*(3.0 - 2.0*f);
  return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b)* u.x * u.y;
}

void main() {
  // radial coords centered at .5,.5
  vec2 uv = vUV - 0.5;
  float r = length(uv) * 2.0;

  // layered noise pulses
  float n = 0.0;
  n += noise(uv * 3.0 + time * 0.5) * 0.5;
  n += noise(uv * 10.0 - time) * 0.3;
  n += noise(uv * 20.0 + time * 2.0) * 0.2;

  // flare spikes
  float spikes = pow(1.0 - abs(sin(uv.x * 20.0 + time * 5.0)) * r, 10.0);

  // combine
  float intensity = smoothstep(0.2, 0.0, r) * (n + spikes);

  // final color (yellow→orange)
  vec3 color = mix(vec3(1.0, 0.9, 0.4), vec3(1.0, 0.4, 0.1), r);
  gl_FragColor = vec4(color * intensity, intensity);
}
