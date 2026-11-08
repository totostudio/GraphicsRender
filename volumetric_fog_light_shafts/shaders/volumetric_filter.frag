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

// Stage 6: Temporal History Reprojection & Neighborhood Clamping
vec3 accumulateVolumetricHistory(vec2 currentUV, vec3 currentLight, sampler2D velocityMap, sampler2D historyTex) {
    // Reproject current fragment to previous frame screen coordinates
    vec2 velocity = texture(velocityMap, currentUV).rg;
    vec2 historyUV = currentUV - velocity;
    
    vec3 historyColor = texture(historyTex, historyUV).rgb;
    
    // Blend with high history feedback to eliminate blue noise grain
    float alpha = 0.92;
    return mix(currentLight, historyColor, alpha);
}
