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

// Stage 2: Nearest-Depth Motion Vector Dilation
vec2 dilateNearestVelocity(vec2 uv, vec2 lowResTexel, sampler2D depthTex, sampler2D velocityTex) {
    float nearestDepth = 1.0;
    vec2 bestOffset = vec2(0.0);
    
    // Search 3x3 footprint for foreground sample closest to camera
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 offset = vec2(float(x), float(y)) * lowResTexel;
            float d = texture(depthTex, uv + offset).r;
            if (d < nearestDepth) {
                nearestDepth = d;
                bestOffset = offset;
            }
        }
    }
    return texture(velocityTex, uv + bestOffset).xy;
}
