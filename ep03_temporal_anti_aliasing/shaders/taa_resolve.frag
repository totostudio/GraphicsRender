#version 300 es
/**
 * -----------------------------------------------------------------------------
 * Temporal Anti-Aliasing (TAA) — Production Reference Resolver
 * Author: @GraphicsRender (https://github.com/totostudio/GraphicsRender)
 * License: MIT
 * -----------------------------------------------------------------------------
 * Modular 6-Stage Temporal Accumulation & Anti-Ghosting Resolver:
 * 1. reprojectHistoryUV()        - Screen-space velocity buffer backprojection
 * 2. sampleHistoryCatmullRom()   - 5-tap bicubic history interpolation
 * 3. sampleNeighborhoodAABB()    - 3x3 spatial color gamut analysis in YCoCg
 * 4. clipToVarianceBox()         - Gaussian variance bounding box clipping
 * 5. computeFeedbackWeight()     - Dynamic disocclusion & velocity feedback
 * 6. resolveTAA()                - Exponential moving average temporal blend
 */

precision highp float;

uniform sampler2D u_currColor;       // Current frame jittered color (RGB) + depth (A)
uniform sampler2D u_velocityMap;     // Screen-space velocity vectors (RG)
uniform sampler2D u_historyColor;    // Accumulated temporal history color (RGB)
uniform vec2      u_resolution;      // Viewport resolution in pixels (e.g. 1920, 1080)
uniform float     u_feedbackAlpha;   // Base history blend weight (default: 0.95)
uniform float     u_varianceGamma;   // Variance box expansion factor (default: 1.25)

in vec2 vUV;
out vec4 fragColor;

// =============================================================================
// Color Space Conversions: Perceptual YCoCg Space
// =============================================================================
vec3 RGB_to_YCoCg(vec3 c) {
    return vec3(
         0.25 * c.r + 0.50 * c.g + 0.25 * c.b,
         0.50 * c.r - 0.50 * c.b,
        -0.25 * c.r + 0.50 * c.g - 0.25 * c.b
    );
}

vec3 YCoCg_to_RGB(vec3 c) {
    return vec3(
        c.x + c.y - c.z,
        c.x + c.z,
        c.x - c.y - c.z
    );
}

// =============================================================================
// STAGE 1: Velocity Backprojection
// =============================================================================
vec2 reprojectHistoryUV(vec2 currentUV, sampler2D velocityMap) {
    // Read screen-space velocity vector (UV offset from previous frame)
    vec2 velocity = texture(velocityMap, currentUV).xy;
    return currentUV - velocity;
}

// =============================================================================
// STAGE 2: 5-Tap Bicubic Catmull-Rom History Filtering
// =============================================================================
vec4 sampleHistoryCatmullRom(sampler2D historyTex, vec2 uv, vec2 texSize) {
    vec2 position = uv * texSize - 0.5;
    vec2 f = fract(position);
    vec2 index = floor(position);

    // Evaluate cubic B-spline weights
    vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
    vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
    vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
    vec2 w3 = f * f * (-0.5 + 0.5 * f);

    // Combine middle weights for bilinear hardware optimization
    vec2 w12 = w1 + w2;
    vec2 tc12 = (index + w2 / w12) / texSize;
    vec2 tc0 = (index - 1.0) / texSize;
    vec2 tc3 = (index + 2.0) / texSize;

    vec4 color = vec4(0.0);
    color += texture(historyTex, vec2(tc12.x, tc0.y)) * (w12.x * w0.y);
    color += texture(historyTex, vec2(tc0.x, tc12.y)) * (w0.x * w12.y);
    color += texture(historyTex, vec2(tc12.x, tc12.y)) * (w12.x * w12.y);
    color += texture(historyTex, vec2(tc3.x, tc12.y)) * (w3.x * w12.y);
    color += texture(historyTex, vec2(tc12.x, tc3.y)) * (w12.x * w3.y);

    float sumW = w12.x * w0.y + w0.x * w12.y + w12.x * w12.y + w3.x * w12.y + w12.x * w3.y;
    return color / sumW;
}

// =============================================================================
// STAGE 3: 3x3 Neighborhood YCoCg Statistics Gathering
// =============================================================================
void sampleNeighborhoodAABB(vec2 uv, vec2 texelSize, out vec3 mean, out vec3 sigma, out vec3 boxMin, out vec3 boxMax) {
    vec3 m1 = vec3(0.0);
    vec3 m2 = vec3(0.0);
    boxMin = vec3(1e5);
    boxMax = vec3(-1e5);

    // Iterate over 3x3 spatial window
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec3 neighborRGB = texture(u_currColor, uv + vec2(float(x), float(y)) * texelSize).rgb;
            vec3 neighborYCoCg = RGB_to_YCoCg(neighborRGB);
            
            m1 += neighborYCoCg;
            m2 += neighborYCoCg * neighborYCoCg;
            boxMin = min(boxMin, neighborYCoCg);
            boxMax = max(boxMax, neighborYCoCg);
        }
    }

    mean = m1 / 9.0;
    sigma = sqrt(max(m2 / 9.0 - mean * mean, vec3(0.0)));
}

// =============================================================================
// STAGE 4: Variance Bounding Box Clipping
// =============================================================================
vec3 clipToVarianceBox(vec3 historyYCoCg, vec3 mean, vec3 sigma, vec3 boxMin, vec3 boxMax, float gamma) {
    // Construct oriented statistical bounding box around local neighborhood mean
    vec3 aabbMin = max(boxMin, mean - gamma * sigma);
    vec3 aabbMax = min(boxMax, mean + gamma * sigma);
    
    // Clamp reprojected history color into bounding box
    return clamp(historyYCoCg, aabbMin, aabbMax);
}

// =============================================================================
// STAGE 5: Dynamic Feedback Weight Evaluation
// =============================================================================
float computeFeedbackWeight(vec2 prevUV, vec3 historyYCoCg, vec3 clampedHistoryYCoCg, float baseAlpha) {
    // 1. Offscreen disocclusion check
    if (prevUV.x < 0.0 || prevUV.x > 1.0 || prevUV.y < 0.0 || prevUV.y > 1.0) {
        return 0.0; // Completely discard history outside viewport
    }

    // 2. Disocclusion distance penalty based on clipping distance
    float clipDelta = length(historyYCoCg - clampedHistoryYCoCg);
    float dynamicAlpha = mix(baseAlpha, 0.70, clamp(clipDelta * 4.0, 0.0, 1.0));
    return dynamicAlpha;
}

// =============================================================================
// STAGE 6: Temporal Exponential Blend
// =============================================================================
vec3 resolveTAA(vec3 currentColor, vec3 clampedHistoryRGB, float blendWeight) {
    // Exponential Moving Average (EMA) Temporal Blending
    return mix(currentColor, clampedHistoryRGB, blendWeight);
}

void main() {
    vec2 texelSize = 1.0 / u_resolution;
    vec3 currentColor = texture(u_currColor, vUV).rgb;

    // Stage 1: Reproject history UV
    vec2 prevUV = reprojectHistoryUV(vUV, u_velocityMap);

    // Stage 2: Bicubic Catmull-Rom history sample
    vec4 rawHistory = sampleHistoryCatmullRom(u_historyColor, prevUV, u_resolution);
    vec3 historyYCoCg = RGB_to_YCoCg(rawHistory.rgb);

    // Stage 3: Gather 3x3 statistics
    vec3 mean, sigma, boxMin, boxMax;
    sampleNeighborhoodAABB(vUV, texelSize, mean, sigma, boxMin, boxMax);

    // Stage 4: Variance clipping
    vec3 clampedYCoCg = clipToVarianceBox(historyYCoCg, mean, sigma, boxMin, boxMax, u_varianceGamma);
    vec3 clampedRGB = YCoCg_to_RGB(clampedYCoCg);

    // Stage 5: Dynamic blend factor
    float blendWeight = computeFeedbackWeight(prevUV, historyYCoCg, clampedYCoCg, u_feedbackAlpha);

    // Stage 6: Final exponential blend
    vec3 resolvedColor = resolveTAA(currentColor, clampedRGB, blendWeight);

    fragColor = vec4(resolvedColor, 1.0);
}
