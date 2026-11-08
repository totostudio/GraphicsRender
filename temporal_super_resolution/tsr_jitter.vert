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

// Stage 1: Halton(2,3) Sub-Pixel Camera Jitter Injection
mat4 applySubpixelJitter(mat4 projMatrix, vec2 jitterOffset, vec2 renderResolution) {
    // Convert sub-pixel offset into normalized device coordinate [-1, 1] range
    vec2 ndcJitter = (jitterOffset * 2.0) / renderResolution;
    
    // Inject jitter into row 2, columns 0 and 1 of projection matrix
    mat4 jitteredProj = projMatrix;
    jitteredProj[2][0] += ndcJitter.x;
    jitteredProj[2][1] += ndcJitter.y;
    
    // Unjittered matrix is strictly preserved for motion vector calculations
    return jitteredProj;
}
