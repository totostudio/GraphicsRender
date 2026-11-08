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

// Stage 5: 3D Frustum-Aligned Voxel (Froxel) Grid Sampling
vec4 sampleFroxelGrid(vec2 screenUV, float linearDepth, sampler3D froxelGridTex) {
    // Exponential Z distribution allocates high voxel density near camera
    float froxelZ = log(linearDepth / uNearPlane) / log(uFarPlane / uNearPlane);
    vec3 froxelUVW = vec3(screenUV, clamp(froxelZ, 0.0, 1.0));
    
    // Hardware trilinear interpolation across 160x90x64 voxel volume
    vec4 scatteringTransmittance = texture(froxelGridTex, froxelUVW);
    return scatteringTransmittance;
}
