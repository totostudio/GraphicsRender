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

// SVGF Stage 7: Material Re-Composition & Tone Mapping
vec3 compositeLighting(vec2 uv) {
    // Fetch denoised indirect irradiance (demodulated)
    vec3 denoisedIrradiance = texture(uDenoisedIrradianceTex, uv).rgb;
    vec3 surfaceAlbedo = texture(uAlbedoTex, uv).rgb;

    // Modulate back with pristine high-frequency albedo
    vec3 indirectDiffuse = denoisedIrradiance * surfaceAlbedo;

    // Add direct analytical spotlight and specular highlight
    vec3 directIllumination = texture(uDirectRadianceTex, uv).rgb;
    vec3 totalRadiance = directIllumination + indirectDiffuse;

    // Final ACES filmic compression and gamma output
    return pow(ACESFilm(totalRadiance), vec3(1.0 / 2.2));
}
