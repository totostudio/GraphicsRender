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

// Stage 5: Edge-Preserving Cross-Bilateral Spatial Denoising
vec3 crossBilateralFilter(vec2 uv, vec3 centerNormal, float centerDepth) {
    vec3 sumColor = vec3(0.0);
    float sumWeight = 0.0;
    for (int y = -2; y <= 2; y++) {
        for (int x = -2; x <= 2; x++) {
            vec2 offsetUV = uv + vec2(float(x), float(y)) * u_texelSize;
            vec3 sampleNormal = decodeNormal(texture(u_normalTexture, offsetUV).xy);
            float sampleDepth = linearizeDepth(texture(u_depthTexture, offsetUV).r);
            float normalWeight = pow(max(dot(centerNormal, sampleNormal), 0.0), 16.0);
            float depthWeight = exp(-abs(centerDepth - sampleDepth) * 12.0);
            float weight = normalWeight * depthWeight;
            sumColor += texture(u_rawGITexture, offsetUV).rgb * weight;
            sumWeight += weight;
        }
    }
    return sumColor / max(sumWeight, 1e-4);
}
