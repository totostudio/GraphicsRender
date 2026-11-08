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

// Stage 8: Bilateral Depth-Aware Half-Resolution Upsampling
vec3 bilateralUpsampleVolumetric(vec2 fullResUV, sampler2D lowResVolumetric, sampler2D sceneDepthTex) {
    float centerDepth = texture(sceneDepthTex, fullResUV).r;
    vec3 sumColor = vec3(0.0);
    float sumWeight = 0.0;
    
    // Sample 2x2 low-res footprint with depth-aware bilateral weighting
    for (int x = 0; x <= 1; x++) {
        for (int y = 0; y <= 1; y++) {
            vec2 offsetUV = fullResUV + vec2(float(x) - 0.5, float(y) - 0.5) * uLowResTexelSize;
            float tapDepth = texture(sceneDepthTex, offsetUV).r;
            vec3 tapColor = texture(lowResVolumetric, offsetUV).rgb;
            
            float depthWeight = exp(-abs(centerDepth - tapDepth) * 80.0);
            sumColor += tapColor * depthWeight;
            sumWeight += depthWeight;
        }
    }
    return sumColor / max(sumWeight, 1e-4);
}
