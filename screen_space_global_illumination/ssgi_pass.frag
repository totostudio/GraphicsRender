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

// Stage 4: Temporal Reprojection and Variance Clipping
vec3 accumulateIndirectHistory(vec2 uv, vec3 currentGI, vec2 velocity) {
    vec2 prevUV = uv - velocity;
    vec3 histGI = texture(u_historyGI, prevUV).rgb;
    vec3 currentYCoCg = RGB_to_YCoCg(currentGI);
    vec3 histYCoCg = RGB_to_YCoCg(histGI);

    vec3 mean, sigma;
    computeNeighborhoodStats(uv, mean, sigma);
    vec3 aabbMin = mean - 1.5 * sigma;
    vec3 aabbMax = mean + 1.5 * sigma;
    vec3 clampedYCoCg = clamp(histYCoCg, aabbMin, aabbMax);

    float alpha = checkDisocclusion(prevUV) ? 1.0 : 0.08;
    return mix(YCoCg_to_RGB(clampedYCoCg), currentGI, alpha);
}
