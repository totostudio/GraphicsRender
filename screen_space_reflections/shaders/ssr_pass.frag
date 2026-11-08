#version 300 es
/**
 * -----------------------------------------------------------------------------
 * Screen Space Reflections (SSR) — Production Reference Shader
 * Author: @GraphicsRender (https://github.com/totostudio/GraphicsRender)
 * License: MIT
 * -----------------------------------------------------------------------------
 * Modular, physically grounded 4-phase Screen Space Raymarching:
 * 1. reconstructViewPos()        - 3D view-space coordinate reconstruction
 * 2. raymarchScreenSpace()       - Coarse linear step traversal & bounds exit
 * 3. binarySearchRefinement()    - 8-iteration sub-pixel binary bisection
 * 4. compositeSSR()              - Screen border vignette & Schlick Fresnel
 */

precision highp float;

// Uniform inputs from deferred rendering pipeline
uniform sampler2D u_colorMap;            // G-Buffer Scene Color (RGB)
uniform sampler2D u_normalMap;           // G-Buffer View-Space Normal (RGB) + Roughness (A)
uniform sampler2D u_linearDepthMap;      // G-Buffer Linear Scene Depth (R)
uniform mat4      u_projMatrix;          // Camera perspective projection matrix
uniform mat4      u_invProjMatrix;       // Camera inverse projection matrix
uniform vec2      u_resolution;          // Viewport resolution in pixels (e.g. 1920, 1080)
uniform float     u_stepStride;          // Raymarch step stride (default: 0.25)
uniform int       u_maxLinearSteps;      // Max coarse linear steps (default: 48)
uniform int       u_binarySteps;         // Binary search iterations (default: 8)
uniform float     u_thicknessTolerance;  // Geometry depth thickness threshold (default: 0.35)

in vec2 vUV;
out vec4 fragColor;

// =============================================================================
// STAGE 1: Reconstruct 3D View Position from G-Buffer Depth
// =============================================================================
vec3 reconstructViewPos(vec2 uv, float depth) {
    // Map screen UV [0, 1] to Normalized Device Coordinates (NDC) [-1, 1]
    vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    
    // Unproject using camera inverse projection matrix
    vec4 viewPos = u_invProjMatrix * ndc;
    return viewPos.xyz / viewPos.w;
}

// =============================================================================
// STAGE 3: Sub-Pixel Binary Search Refinement
// =============================================================================
vec4 binarySearchRefinement(vec3 hitPos, vec3 rayDir, float stride) {
    vec3 marchPos = hitPos;
    float currentStride = stride;
    vec2 sampleUV = vec2(0.0);
    
    for (int j = 0; j < 8; j++) {
        currentStride *= 0.5;
        vec4 clipPos = u_projMatrix * vec4(marchPos, 1.0);
        sampleUV = (clipPos.xy / clipPos.w) * 0.5 + 0.5;
        float sceneDepth = texture(u_linearDepthMap, sampleUV).r;
        float rayDepth = -marchPos.z;
        
        // Bisect: Step backward if inside geometry, forward if in front
        if (rayDepth > sceneDepth) {
            marchPos -= rayDir * currentStride;
        } else {
            marchPos += rayDir * currentStride;
        }
    }
    return vec4(sampleUV, marchPos.z, 1.0);
}

// =============================================================================
// STAGE 2: Coarse Linear Raymarching in View Space
// =============================================================================
vec4 raymarchScreenSpace(vec3 rayOrigin, vec3 rayDir, float stepStride) {
    vec3 currentRayPos = rayOrigin + rayDir * 0.08; // Small self-intersection bias
    
    for (int i = 0; i < u_maxLinearSteps; i++) {
        currentRayPos += rayDir * stepStride;
        
        // Project current 3D view-space point to 2D Screen UV
        vec4 clipPos = u_projMatrix * vec4(currentRayPos, 1.0);
        vec2 sampleUV = (clipPos.xy / clipPos.w) * 0.5 + 0.5;
        
        // Screen boundary early exit
        if (sampleUV.x < 0.0 || sampleUV.x > 1.0 || sampleUV.y < 0.0 || sampleUV.y > 1.0)
            break;
            
        float sceneDepth = texture(u_linearDepthMap, sampleUV).r;
        float rayDepth = -currentRayPos.z;
        
        // Depth test: Did ray penetrate behind geometry surface within thickness?
        if (rayDepth > sceneDepth && (rayDepth - sceneDepth) < u_thicknessTolerance) {
            return binarySearchRefinement(currentRayPos, rayDir, stepStride);
        }
    }
    return vec4(0.0);
}

// =============================================================================
// STAGE 4: Screen Edge Attenuation & Schlick Fresnel Wet Surface Composition
// =============================================================================
vec3 compositeSSR(vec3 baseColor, vec3 reflectionColor, vec2 hitUV, vec3 N, vec3 V, float roughness) {
    // Vignette falloff to smoothly fade reflections near screen edges
    vec2 edgeDist = min(hitUV, 1.0 - hitUV);
    float edgeFade = smoothstep(0.0, 0.15, min(edgeDist.x, edgeDist.y));
    
    // Schlick Fresnel approximation for dielectric wet surfaces (F0 = 0.04)
    float NdotV = clamp(dot(N, V), 0.0, 1.0);
    float F0 = 0.04;
    float fresnel = F0 + (1.0 - F0) * pow(1.0 - NdotV, 5.0);
    
    // Blend reflection with roughness-dampened wet puddle specular
    float reflectionStrength = edgeFade * fresnel * (1.0 - roughness);
    return mix(baseColor, reflectionColor, reflectionStrength);
}

void main() {
    float sceneDepth = texture(u_linearDepthMap, vUV).r;
    vec4 gNormalData = texture(u_normalMap, vUV);
    vec3 N = normalize(gNormalData.rgb * 2.0 - 1.0);
    float roughness = gNormalData.a;

    // Background sky early return
    if (sceneDepth >= 50.0) {
        fragColor = texture(u_colorMap, vUV);
        return;
    }

    vec3 P = reconstructViewPos(vUV, sceneDepth);
    vec3 V = normalize(-P);
    vec3 R = reflect(-V, N);

    vec4 hitResult = raymarchScreenSpace(P, R, u_stepStride);
    vec4 baseColor = texture(u_colorMap, vUV);

    if (hitResult.w > 0.5) {
        vec2 hitUV = hitResult.xy;
        vec3 reflectionColor = texture(u_colorMap, hitUV).rgb;
        vec3 finalColor = compositeSSR(baseColor.rgb, reflectionColor, hitUV, N, V, roughness);
        fragColor = vec4(finalColor, 1.0);
    } else {
        fragColor = baseColor;
    }
}
