#version 300 es
/**
 * -----------------------------------------------------------------------------
 * Halton(2, 3) Low-Discrepancy Camera Jitter Generator
 * Module: Temporal Anti-Aliasing (TAA) Camera Setup
 * Studio: @GraphicsRender (https://github.com/CreativeWebLab/shader-masterclasses)
 * License: MIT
 * -----------------------------------------------------------------------------
 */

precision highp float;

// Radical inverse function for prime base b
float radicalInverse(int n, int base) {
    float val = 0.0;
    float invBase = 1.0 / float(base);
    float invBi = invBase;
    
    while (n > 0) {
        int d = n % base;
        val += float(d) * invBi;
        n /= base;
        invBi *= invBase;
    }
    return val;
}

// Generates 2D sub-pixel jitter offset in [-0.5, 0.5] pixel bounds
vec2 getHaltonJitter(int frameIndex, vec2 screenResolution) {
    // Halton sequence with coprime bases (2, 3)
    float jx = radicalInverse(frameIndex + 1, 2) - 0.5;
    float jy = radicalInverse(frameIndex + 1, 3) - 0.5;
    
    // Scale offset to NDC space [-1, 1]
    return vec2(jx * (2.0 / screenResolution.x), jy * (2.0 / screenResolution.y));
}

// Perturbs camera projection matrix with sub-pixel jitter
mat4 applyProjectionJitter(mat4 projMatrix, vec2 jitterOffsetNDC) {
    mat4 jitteredProj = projMatrix;
    // Offset the [2][0] and [2][1] entries of the column-major perspective projection matrix
    jitteredProj[2][0] += jitterOffsetNDC.x;
    jitteredProj[2][1] += jitterOffsetNDC.y;
    return jitteredProj;
}
