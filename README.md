# GraphicsRender — Real-Time 3D Graphics Pipeline Source Code

> **Author**: [@GraphicsRender](https://www.youtube.com/@GraphicsRender)

Production reference source code, standalone WebGL2 interactive shaders, and GLSL algorithms for the **Real-Time 3D Graphics Pipeline** series.

---

## 📁 Pipeline Modules & Reference Implementations

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

## 🚀 Quick Start
Every module directory contains a standalone `index.html` and modular GLSL files in `shaders/`:
1. **Zero Dependencies**: Pure native WebGL2 implementation. No `npm install`, no build tools, no bundlers.
2. **Instant Run**: Double-click `index.html` in any modern web browser.
3. **Diagnostic Controls**: Press keys `1` ~ `5` to switch between different rendering passes, G-Buffers, heatmaps, and debug views.

---

## 📄 License
This repository is licensed under the [MIT License](LICENSE).
