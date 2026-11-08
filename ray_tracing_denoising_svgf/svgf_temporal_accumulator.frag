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

// SVGF Stage 2: History Bilateral Consistency Check
bool validateHistory(vec2 prevUV, float currDepth, vec3 currNormal) {
    if (any(lessThan(prevUV, vec2(0.0))) || any(greaterThan(prevUV, vec2(1.0)))) {
        return false;
    }

    float prevDepth = texture(uPrevLinearDepth, prevUV).r;
    vec3 prevNormal = texture(uPrevNormalBuffer, prevUV).xyz;

    // Normal alignment tolerance test
    float normalDot = dot(currNormal, prevNormal);
    if (normalDot < 0.90) return false;

    // Relative depth gradient discrepancy test
    float depthDelta = abs(currDepth - prevDepth) / max(currDepth, 0.001);
    if (depthDelta > 0.08) return false;

    return true;
}
