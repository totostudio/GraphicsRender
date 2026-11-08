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

// Stage 5: Dynamic Reactivity & Disocclusion Mask
float computeReactivityMask(vec3 currColor, vec3 histColor, float depthDelta, float maxDepthDelta) {
    // Detect geometric disocclusion where depth disparity exceeds threshold
    float disocclusion = smoothstep(0.0, maxDepthDelta, depthDelta);
    
    // Detect high-frequency luminance divergence (particles, specular glints)
    float currLuma = dot(currColor, vec3(0.2126, 0.7152, 0.0722));
    float histLuma = dot(histColor, vec3(0.2126, 0.7152, 0.0722));
    float lumaDiff = abs(currLuma - histLuma) / max(currLuma, max(histLuma, 0.1));
    
    // Combine disocclusion and luminance divergence into reactivity factor
    return clamp(max(disocclusion, lumaDiff * 0.8), 0.0, 1.0);
}
