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

// Stage 4: Blue-Noise Stochastic Raymarching Integration
vec3 raymarchVolumetricLight(vec3 rayOrigin, vec3 rayDir, float maxDist, vec2 pixelCoord, sampler2D blueNoiseTex) {
    const int NUM_STEPS = 16;
    float stepLength = maxDist / float(NUM_STEPS);
    
    // Blue noise spatial jitter offset eliminates stairstep banding
    float blueNoise = texture(blueNoiseTex, pixelCoord / 64.0).r;
    float currentDist = stepLength * blueNoise;
    vec3 accumulatedLight = vec3(0.0);
    vec3 transmittance = vec3(1.0);
    
    for (int i = 0; i < NUM_STEPS; i++) {
        vec3 samplePos = rayOrigin + rayDir * currentDist;
        float shadow = sampleShadowVisibility(samplePos, uLightViewProj, uShadowMap);
        vec3 inScatter = uLightColor * shadow * uScatteringCoeff * stepLength;
        accumulatedLight += inScatter * transmittance;
        transmittance *= evaluateTransmittance(uExtinctionCoeff, stepLength);
        currentDist += stepLength;
    }
    return accumulatedLight;
}
