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

// Stage 7: Deferred Scene Composition with Atmospheric Light
vec3 compositeVolumetricFog(vec3 sceneColor, vec3 inScatteredLight, vec3 transmittance) {
    // Attenuate background geometry color by optical transmittance
    vec3 attenuatedScene = sceneColor * transmittance;
    
    // Add physical in-scattered sunlight from participating media
    vec3 finalComposite = attenuatedScene + inScatteredLight;
    
    // ACES Filmic Tone Mapping handles dynamic sunbeam intensity
    return ACESFilmicToneMapping(finalComposite);
}
