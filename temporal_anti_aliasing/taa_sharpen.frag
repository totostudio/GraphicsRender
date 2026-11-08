#version 300 es
/**
 * -----------------------------------------------------------------------------
 * Contrast-Adaptive Sharpening (CAS) Filter
 * Module: Temporal Anti-Aliasing (TAA) High-Frequency Detail Recovery
 * Studio: @GraphicsRender (https://github.com/CreativeWebLab/shader-masterclasses)
 * License: MIT
 * -----------------------------------------------------------------------------
 */

precision highp float;

uniform sampler2D u_resolvedColor;   // TAA resolved color buffer
uniform vec2      u_resolution;      // Viewport resolution in pixels
uniform float     u_sharpenIntensity;// Sharpening strength (default: 0.25)

in vec2 vUV;
out vec4 fragColor;

void main() {
    vec2 texel = 1.0 / u_resolution;

    // 5-Tap Cross Kernel
    vec3 c = texture(u_resolvedColor, vUV).rgb;
    vec3 n = texture(u_resolvedColor, vUV + vec2(0.0, texel.y)).rgb;
    vec3 s = texture(u_resolvedColor, vUV - vec2(0.0, texel.y)).rgb;
    vec3 w = texture(u_resolvedColor, vUV - vec2(texel.x, 0.0)).rgb;
    vec3 e = texture(u_resolvedColor, vUV + vec2(texel.x, 0.0)).rgb;

    // Local Min/Max contrast bounds
    vec3 minCol = min(c, min(min(n, s), min(w, e)));
    vec3 maxCol = max(c, max(max(n, s), max(w, e)));

    // Contrast-adaptive sharpening weight
    vec3 contrast = min(minCol, 2.0 - maxCol);
    vec3 weight = sqrt(max(contrast / (maxCol + 1e-4), vec3(0.0))) * (-u_sharpenIntensity);

    // Filter convolution
    vec3 sharpened = (c + (n + s + w + e) * weight) / (1.0 + 4.0 * weight);

    fragColor = vec4(clamp(sharpened, 0.0, 1.0), 1.0);
}
