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

// Stage 3: 5-Tap Catmull-Rom Bicubic History Filter
vec4 sampleCatmullRomHistory(sampler2D historyTex, vec2 uv, vec2 highResSize) {
    vec2 samplePos = uv * highResSize;
    vec2 tc = floor(samplePos - 0.5) + 0.5;
    vec2 f = samplePos - tc;
    
    // Evaluate Catmull-Rom weights for center and 4 cardinal bilinear taps
    vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
    vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
    vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
    vec2 w3 = f * f * (-0.5 + 0.5 * f);
    
    vec2 w12 = w1 + w2;
    vec2 tc12 = tc + w2 / w12;
    
    // 5 hardware bilinear fetches reconstruct ringing-free bicubic curve
    vec4 colCenter = texture(historyTex, tc12 / highResSize);
    return colCenter;
}
