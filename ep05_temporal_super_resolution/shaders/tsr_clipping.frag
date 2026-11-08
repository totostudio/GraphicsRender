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

// Stage 4: YCoCg Statistical Variance Box Clipping
vec3 clipHistoryYCoCg(vec3 historyRGB, vec3 centerRGB, vec3 m1, vec3 m2, float gamma) {
    // Transform color into YCoCg color space
    vec3 histYCoCg = RGBToYCoCg(historyRGB);
    
    // Calculate statistical mean and variance across 3x3 low-res neighborhood
    vec3 mu = m1;
    vec3 sigma = sqrt(max(m2 - m1 * m1, vec3(0.0)));
    
    // Formulate dynamic AABB bounding envelope scaled by gamma
    vec3 boxMin = mu - gamma * sigma;
    vec3 boxMax = mu + gamma * sigma;
    
    // Clamp reprojected historical sample onto bounding box
    return YCoCgToRGB(clamp(histYCoCg, boxMin, boxMax));
}
