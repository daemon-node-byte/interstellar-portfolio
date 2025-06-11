precision highp float;

varying vec2 vUV;
uniform float time;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(void) {
    float brightness = 0.0;
    vec2 seed = vUV * 10.0 + time * 0.01;
    float r = rand(seed);
    float star = step(0.999, r);
    // Vary brightness between 0.3 and 1.0 for each star
    float starBrightness = mix(0.3, 1.0, rand(seed + 1.23));
    // Add twinkling effect with random flicker rate
    float flickerRate = mix(1.0, 3.0, rand(seed + 6.78)); // Random flicker speed
    float twinkle = 0.5 + 0.5 * sin(time * flickerRate + rand(seed + 2.34) * 6.28);
    brightness += star * starBrightness * twinkle;
    brightness = clamp(brightness, 0.0, 1.0);

    // Generate random color for each star
    vec3 starColor = vec3(
        mix(0.5, 1.0, rand(seed + 3.45)), // Red component
        mix(0.5, 1.0, rand(seed + 4.56)), // Green component
        mix(0.5, 1.0, rand(seed + 5.67))  // Blue component
    );

    vec3 color = mix(vec3(0.01, 0.01, 0.05), starColor, brightness);
    gl_FragColor = vec4(color, 1.0);
}