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

// SVGF Stage 5: 5x5 À-Trous Wavelet Stride Filter Pass
vec3 filterAtrousWavelet(vec2 uv, int iteration, float sigmaL) {
    vec3 centerColor = texture(uColorTex, uv).rgb;
    float centerLum = dot(centerColor, vec3(0.2126, 0.7152, 0.0722));
    float centerVar = texture(uVarianceTex, uv).r;
    vec3 centerNorm = texture(uNormalTex, uv).xyz;
    float centerDepth = texture(uDepthTex, uv).r;

    // Exponential stride dilation: step = 1, 2, 4, 8, 16
    int stepSize = 1 << iteration;
    vec2 texelSize = 1.0 / uResolution;

    vec3 sumColor = centerColor * 0.140625;
    float sumWeight = 0.140625;

    for (int dy = -2; dy <= 2; dy++) {
        for (int dx = -2; dx <= 2; dx++) {
            if (dx == 0 && dy == 0) continue;
            vec2 offsetUV = uv + vec2(float(dx * stepSize), float(dy * stepSize)) * texelSize;
            float kernelWeight = kernelBSpline(dx, dy);

            vec3 sampleColor = texture(uColorTex, offsetUV).rgb;
            float sampleLum = dot(sampleColor, vec3(0.2126, 0.7152, 0.0722));
            float sampleDepth = texture(uDepthTex, offsetUV).r;
            vec3 sampleNorm = texture(uNormalTex, offsetUV).xyz;

            // Compute composite edge-stopping weight
            float wGeom = computeGeometricWeight(centerNorm, sampleNorm, centerDepth, sampleDepth, vec2(dx, dy), vec2(0.01));
            float wLum = computeLuminanceWeight(centerLum, sampleLum, centerVar, sigmaL);
            float weight = kernelWeight * wGeom * wLum;

            sumColor += sampleColor * weight;
            sumWeight += weight;
        }
    }
    return sumColor / max(sumWeight, 0.0001);
}
