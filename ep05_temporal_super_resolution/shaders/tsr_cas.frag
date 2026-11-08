#version 300 es
/**
 * -----------------------------------------------------------------------------
 * Author: @GraphicsRender (https://github.com/totostudio/GraphicsRender)
 * Series: Real-Time 3D Graphics Pipeline Studio
 * YouTube: https://www.youtube.com/@GraphicsRender
 * License: MIT
 * -----------------------------------------------------------------------------
 */

precision highp float;

// Stage 7: AMD FidelityFX Contrast-Adaptive Sharpening (CAS)
vec3 contrastAdaptiveSharpen(vec2 uv, vec2 texelSize, sampler2D inputTex, float sharpness) {
    // Sample cross footprint: center, top, bottom, left, right
    vec3 c = texture(inputTex, uv).rgb;
    vec3 t = texture(inputTex, uv - vec2(0.0, texelSize.y)).rgb;
    vec3 b = texture(inputTex, uv + vec2(0.0, texelSize.y)).rgb;
    vec3 l = texture(inputTex, uv - vec2(texelSize.x, 0.0)).rgb;
    vec3 r = texture(inputTex, uv + vec2(texelSize.x, 0.0)).rgb;
    
    // Evaluate local min and max luminance across cross neighborhood
    float minLuma = min(c.g, min(min(t.g, b.g), min(l.g, r.g)));
    float maxLuma = max(c.g, max(max(t.g, b.g), max(l.g, r.g)));
    
    // Contrast-adaptive weight calculation prevents halo ringing on high edges
    float weight = -0.25 * sqrt(min(minLuma, 1.0 - maxLuma) / max(maxLuma, 1e-4)) * sharpness;
    return (c + (t + b + l + r) * weight) / (1.0 + 4.0 * weight);
}
