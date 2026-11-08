# GraphicsRender — Real-Time 3D Graphics Pipeline Shader Reference

> **Author**: [@GraphicsRender](https://www.youtube.com/@GraphicsRender)

Production reference GLSL shaders and algorithmic implementations for the **Real-Time 3D Graphics Pipeline** masterclass series on YouTube.

---

## 📁 Pipeline Modules & Reference Shaders

| Module | Source Code | Pipeline Technique | Walkthrough |
| :---: | :--- | :--- | :---: |
| **01** | [`screen_space_reflections`](./screen_space_reflections) | View-space linear raymarch & binary search | [Video](https://www.youtube.com/@GraphicsRender) |
| **02** | [`screen_space_ambient_occlusion`](./screen_space_ambient_occlusion) | Tangent-space hemisphere cosine sampling | [Video](https://www.youtube.com/@GraphicsRender) |
| **03** | [`temporal_anti_aliasing`](./temporal_anti_aliasing) | Halton sub-pixel jitter & YCoCg variance clipping | [Video](https://www.youtube.com/@GraphicsRender) |
| **04** | [`volumetric_fog_light_shafts`](./volumetric_fog_light_shafts) | 3D Froxel grid & Beer-Lambert light shafts | [Video](https://www.youtube.com/@GraphicsRender) |
| **05** | [`temporal_super_resolution`](./temporal_super_resolution) | 540p to 1080p Catmull-Rom upscaling & CAS | [Video](https://www.youtube.com/@GraphicsRender) |
| **06** | [`screen_space_global_illumination`](./screen_space_global_illumination) | Indirect diffuse bounce & color bleeding | [Video](https://www.youtube.com/@GraphicsRender) |
| **07** | [`ray_tracing_denoising_svgf`](./ray_tracing_denoising_svgf) | Spatio-temporal variance-guided filtering (SVGF) | [Video](https://www.youtube.com/@GraphicsRender) |

---

## 🚀 Usage & Integration
This repository contains clean, modular, and self-contained GLSL fragment and compute shader routines:
1. **Engine Agnostic**: Written in clean, modern GLSL (ES 3.00 / 330 core), easily portable to HLSL, WGSL, Unreal Engine Custom Nodes, or Unity Custom Passes.
2. **First-Principles Architecture**: Every pass strictly reflects the mathematical derivations and physical optics deconstructed in each corresponding YouTube lecture.

---

## 📄 License
This repository is licensed under the [MIT License](LICENSE).
