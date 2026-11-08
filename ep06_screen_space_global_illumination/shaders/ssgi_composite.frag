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

// Stage 6: Physical PBR Composite with Indirect Radiance
vec3 compositeDiffuseLighting(vec3 directLighting, vec3 indirectRadiance, vec3 albedo, float ao) {
    vec3 indirectDiffuse = indirectRadiance * albedo * (1.0 - ao * 0.75);
    vec3 totalIllumination = directLighting + indirectDiffuse;
    vec3 mapped = totalIllumination / (totalIllumination + vec3(1.0));
    return pow(mapped, vec3(1.0 / 2.2));
}
