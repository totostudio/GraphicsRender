// ==============================================================================
// Screen Space Ambient Occlusion (SSAO) — Pass 2: Bilateral Blur Filter
// Language: GLSL 3.0 ES / WebGL2
// License: MIT
// Author: CreativeWebLab (https://github.com/CreativeWebLab/shader-masterclasses)
// ==============================================================================

precision highp float;

// ------------------------------------------------------------------------------
// STAGE 7: Depth-Aware Edge-Preserving Bilateral Blur
// ------------------------------------------------------------------------------
uniform sampler2D u_ssaoRaw;          // Raw SSAO texture with 4x4 dither noise (R)
uniform sampler2D u_linearDepthMap;   // Linear scene depth buffer for edge detection (R)
uniform vec2      u_texelSize;        // 1.0 / resolution (e.g. 1.0 / 1920.0, 1.0 / 1080.0)
uniform float     u_depthSharpness;   // Edge sensitivity coefficient (e.g. 40.0)

varying vec2 v_uv;
out vec4 fragColor;

float bilateralBlur(vec2 uv) {
    float centerDepth = texture(u_linearDepthMap, uv).r;
    float centerAO = texture(u_ssaoRaw, uv).r;
    
    // Background sky geometry early pass
    if (centerDepth >= 1.0) return 1.0;

    float totalAO = 0.0;
    float totalWeight = 0.0;

    // 4x4 kernel sampling matching the 4x4 rotation dither texture size
    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            vec2 offset = vec2(float(x), float(y)) * u_texelSize;
            float neighborDepth = texture(u_linearDepthMap, uv + offset).r;
            float neighborAO = texture(u_ssaoRaw, uv + offset).r;

            // Bilateral spatial Gaussian weight
            float spatialDist2 = float(x * x + y * y);
            float spatialWeight = exp(-spatialDist2 * 0.125);

            // Bilateral range weight: penalize depth discontinuities (silhouette edges)
            float depthDiff = abs(centerDepth - neighborDepth);
            float rangeWeight = exp(-depthDiff * u_depthSharpness);

            float weight = spatialWeight * rangeWeight;

            totalAO += neighborAO * weight;
            totalWeight += weight;
        }
    }

    return (totalWeight > 0.0001) ? (totalAO / totalWeight) : centerAO;
}

void main() {
    float blurredAO = bilateralBlur(v_uv);
    fragColor = vec4(vec3(blurredAO), 1.0);
}
