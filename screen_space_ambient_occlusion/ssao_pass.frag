// ==============================================================================
// Screen Space Ambient Occlusion (SSAO) — Production Reference Shader
// Language: GLSL 3.0 ES / WebGL2
// License: MIT
// Author: CreativeWebLab (https://github.com/CreativeWebLab/shader-masterclasses)
// ==============================================================================

precision highp float;

// Uniform inputs from deferred rendering pipeline
uniform sampler2D u_normalMap;        // View-space surface normal vector buffer (RGB)
uniform sampler2D u_linearDepthMap;   // Linear scene depth buffer [0, 1] (R)
uniform sampler2D u_noiseTexture;     // 4x4 tiling random rotation vector noise (RGB)
uniform mat4      u_projMatrix;       // Camera perspective projection matrix
uniform mat4      u_invProjMatrix;    // Inverted camera projection matrix
uniform vec2      u_viewportSize;     // Viewport resolution (e.g. 1920, 1080)
uniform float     u_sampleRadius;     // Maximum occlusion search radius in view units (e.g. 0.75)
uniform float     u_bias;             // Surface depth bias to eliminate acne (e.g. 0.025)
uniform int       u_kernelSize;       // Number of hemisphere samples (e.g. 64)
uniform vec3      u_samples[64];      // Pre-computed tangent-space sample kernel

varying vec2 v_uv;
out vec4 fragColor;

// ------------------------------------------------------------------------------
// STAGE 1: Reconstruct 3D View-Space Position from G-Buffer Depth
// ------------------------------------------------------------------------------
vec3 reconstructViewPos(vec2 uv, float depth) {
    // Map screen UV [0, 1] to Normalized Device Coordinates (NDC) [-1, 1]
    vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    
    // Unproject using camera inverse projection matrix
    vec4 viewPos = u_invProjMatrix * ndc;
    return viewPos.xyz / viewPos.w;
}

// ------------------------------------------------------------------------------
// STAGE 2: Construct Orthonormal Tangent-Bitangent-Normal (TBN) Basis
// ------------------------------------------------------------------------------
mat3 constructTBN(vec3 normal, vec2 uv) {
    // Tile 4x4 random rotation vector across the screen
    vec2 noiseScale = u_viewportSize / 4.0;
    vec3 randomVec = texture(u_noiseTexture, uv * noiseScale).xyz * 2.0 - 1.0;
    
    // Gram-Schmidt orthogonalization: ensure tangent is perpendicular to normal
    vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
    vec3 bitangent = cross(normal, tangent);
    
    return mat3(tangent, bitangent, normal);
}

// ------------------------------------------------------------------------------
// STAGE 3: Tangent-Space Hemisphere Sampling Loop
// ------------------------------------------------------------------------------
float computeSSAO(vec2 uv) {
    float centerDepth = texture(u_linearDepthMap, uv).r;
    if (centerDepth >= 1.0) return 1.0; // Early exit for unoccluded background sky
    
    vec3 fragPos = reconstructViewPos(uv, centerDepth);
    vec3 normal = normalize(texture(u_normalMap, uv).xyz * 2.0 - 1.0);
    mat3 tbn = constructTBN(normal, uv);
    
    float occlusion = 0.0;
    
    for (int i = 0; i < 64; i++) {
        if (i >= u_kernelSize) break;
        
        // Stage 3: Rotate hemisphere sample offset from Tangent Space into View Space
        vec3 sampleOffset = tbn * u_samples[i];
        vec3 samplePos = fragPos + sampleOffset * u_sampleRadius;
        
        // Stage 4: Project 3D View-Space sample point into Screen UV Coordinates
        vec4 offset = u_projMatrix * vec4(samplePos, 1.0);
        vec2 sampleUV = (offset.xy / offset.w) * 0.5 + 0.5;
        
        // Screen boundary clipping guard
        if (sampleUV.x < 0.0 || sampleUV.x > 1.0 || sampleUV.y < 0.0 || sampleUV.y > 1.0)
            continue;
            
        // Stage 5: Depth Horizon Occlusion Test (with normal bias)
        float sceneDepth = texture(u_linearDepthMap, sampleUV).r;
        float sampleDepth = -samplePos.z;
        float isOccluded = (sceneDepth <= sampleDepth - u_bias) ? 1.0 : 0.0;
        
        // Stage 6: Smoothstep Distance Attenuation Range Check
        float depthDiff = abs(-fragPos.z - sceneDepth);
        float rangeCheck = 1.0 - smoothstep(0.0, u_sampleRadius, depthDiff);
        
        occlusion += isOccluded * rangeCheck;
    }
    
    // Stage 6 (Final): Normalize occlusion factor across all hemisphere samples
    return 1.0 - (occlusion / float(u_kernelSize));
}

void main() {
    float ao = computeSSAO(v_uv);
    fragColor = vec4(vec3(ao), 1.0);
}
