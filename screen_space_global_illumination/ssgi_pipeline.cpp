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

// Stage 7: Half-Resolution Pipeline Dispatch and Bilateral Upsample
void dispatchHalfResolutionSSGI(CommandList& cmd, Texture& gBufferHalf, Texture& ssgiOut) {
    cmd.bindComputeShader(m_ssgiRaymarchCS);
    cmd.setUniform("u_Resolution", vec2(1920 / 2, 1080 / 2));
    cmd.dispatch((1920 / 2 + 15) / 16, (1080 / 2 + 15) / 16, 1);

    // Depth-Aware Joint Bilateral Upsample to Native 1080p
    cmd.bindComputeShader(m_bilateralUpsampleCS);
    cmd.bindTexture("u_FullDepth", m_sceneDepth);
    cmd.dispatch((1920 + 15) / 16, (1080 + 15) / 16, 1);
}
