precision highp float;
varying vec2 vUV;
varying vec3 vWorldPos;
uniform float innerRadius;
uniform float outerRadius;
uniform vec3 color;
uniform vec3 sunPosition;
uniform sampler2D shadowMap;
uniform mat4 lightMatrix;

void main() {
  // vUV goes 0→1 across the torus tube; remap to radius
  float r = mix(innerRadius, outerRadius, vUV.y);
  // ring falloff
  float alpha = smoothstep(innerRadius, innerRadius + 0.01, r)
              * (1.0 - smoothstep(outerRadius - 0.01, outerRadius, r));

  // Lighting: simple lambert, ring normal is up (0,1,0) in local space
  vec3 normal = vec3(0.0, 1.0, 0.0);
  vec3 lightDir = normalize(sunPosition - vWorldPos);
  float light = dot(normal, lightDir) * 0.5 + 0.5;

  // Shadow calculation
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

  gl_FragColor = vec4(color * light * shadow, alpha);
}
