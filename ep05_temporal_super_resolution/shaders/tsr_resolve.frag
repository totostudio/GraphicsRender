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

// Stage 6: Adaptive Spatio-Temporal History Blending
vec3 resolveTemporalAccumulation(vec3 currColor, vec3 historyColor, vec2 velocity, float reactivity) {
    // Compute motion magnitude to scale accumulation factor
    float speed = length(velocity * 1000.0);
    float motionAlpha = mix(0.05, 0.25, smoothstep(0.0, 10.0, speed));
    
    // Reactivity mask dynamically overrides history in rapid disocclusion
    float finalAlpha = clamp(max(motionAlpha, reactivity), 0.05, 1.0);
    
    // Exponential moving average accumulation into high-res target FBO
    return mix(historyColor, currColor, finalAlpha);
}
