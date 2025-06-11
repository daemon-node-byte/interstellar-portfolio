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

// fbm for richer noise
float fbm(vec2 p) {
  float f = 0.0;
  f += 0.5000 * noise(p);
  f += 0.2500 * noise(p * 2.0);
  f += 0.1250 * noise(p * 4.0);
  f += 0.0625 * noise(p * 8.0);
  return f;
}

// Helper to wrap angle for seamless effect
float wrap(float x, float max) {
  return mod(x + max, max);
}

void main() {
  // radial coords centered at .5,.5
  vec2 uv = vUV - 0.5;
  float r = length(uv) * 2.0;
  float angle = atan(uv.y, uv.x);

  // --- Seamless plasma: wrap angle and scatter start ---
  // Scatter the starting point for each fragment using a random offset based on vUV
  float scatter = hash(vUV * 100.0) * 6.2831853; // random angle offset in [0, 2pi]
  float wrappedAngle = wrap(angle + scatter, 6.2831853); // wrap to [0, 2pi]

  // Swirl the plasma with time and angle (using wrapped angle)
  float swirl = wrappedAngle + time * 0.7 + sin(time + r * 4.0) * 0.2;

  // Dynamic fbm noise for plasma, using wrapped angle for seamlessness
  vec2 noiseUV = uv * 3.0 + vec2(cos(swirl), sin(swirl)) * (0.5 + 0.5 * sin(time * 0.7));
  noiseUV.x = wrap(noiseUV.x, 2.0); // wrap x for seamlessness
  float n = fbm(noiseUV)
          + 0.5 * fbm(uv * 8.0 - time * 0.7)
          + 0.25 * fbm(uv * 16.0 + time * 1.3);

  // Animate color cycling (solar wind)
  float colorShift = 0.5 + 0.5 * sin(time + r * 2.0 + wrappedAngle * 3.0);
  vec3 colorA = vec3(1.0, 0.9, 0.4); // yellow
  vec3 colorB = vec3(1.0, 0.4, 0.1); // orange
  vec3 colorC = vec3(0.9, 0.2, 0.1); // reddish
  vec3 color = mix(mix(colorA, colorB, r), colorC, colorShift * 0.5);

  // More dynamic flare spikes (using wrapped angle)
  float spikes = pow(1.0 - abs(sin(wrappedAngle * 12.0 + time * 3.0)) * r, 16.0)
               + 0.5 * pow(1.0 - abs(cos(wrappedAngle * 8.0 - time * 2.0)) * r, 10.0);

  // Remove radial fade so plasma covers the whole sphere
  float intensity = (n + spikes);

  // Outer corona fade (optional, for soft edge)
  float corona = smoothstep(1.0, 0.8, r) * 0.5 * (0.7 + 0.3 * sin(time + r * 8.0 + wrappedAngle * 2.0));

  // Final color and alpha, clamp alpha for soft edge
  float alpha = clamp(intensity + corona, 0.0, 1.0);
  gl_FragColor = vec4(color * (intensity + corona), alpha);
}
