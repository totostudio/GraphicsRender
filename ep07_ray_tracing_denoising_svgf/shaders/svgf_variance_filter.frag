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

// SVGF Stage 6: 3x3 Spatial Box Filter for Variance Map
float filterVariance(vec2 uv) {
    vec2 texelSize = 1.0 / uResolution;
    float sumVar = 0.0;
    float totalWeight = 0.0;

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 tapUV = uv + vec2(float(x), float(y)) * texelSize;
            float rawVar = texture(uRawVarianceTex, tapUV).r;
            float tapDepth = texture(uLinearDepthTex, tapUV).r;

            // Guard against disocclusion depth boundaries
            float wDepth = exp(-abs(tapDepth - texture(uLinearDepthTex, uv).r) * 15.0);
            sumVar += rawVar * wDepth;
            totalWeight += wDepth;
        }
    }
    return sumVar / max(totalWeight, 0.0001);
}
