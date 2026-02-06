---
title: "HL2-Style Volumetric Light Beams in Three.js"
date: 2026-02-05
categories: [Projects, Experiments]
tags: [three-js, webgl, shader, graphics]
description: "A Three.js port of the fake volumetric lighting technique Valve used in Half-Life 2. Flat quads that look 3D using cylindrical billboarding and procedural noise."
image:
  path: /assets/img/blog/volumetric_beam.png
  alt: Colorful volumetric light beams rendered in Three.js
---

Ever notice those dusty light cones in Half-Life 2? The ones streaming through windows in Ravenholm, or cutting through the fog in the canals? They look volumetric, like real light scattering through particles in the air.

They're not. They're flat quads.

Valve shipped this trick in 2004 (map `d1_canals_08`) and it still holds up because your brain fills in the rest. I ported this technique to Three.js after seeing [Passivestar's excellent Godot implementation](https://passivestar.xyz/posts/light-beam-shader-in-godot/).

**[Live Demo](https://tront.xyz/threejs-volumetric-beam/)** | **[GitHub](https://github.com/TrentSterling/threejs-volumetric-beam)**

![Volumetric light beams](/assets/img/blog/volumetric_beam.png)
_Spawned a bunch of random beams to stress test. Still runs at 60fps._

## The Trick

It's a 2D plane that always faces the camera, but locked to rotate only around the beam's axis. This is called **cylindrical billboarding**.

When you look at the beam from the side, you see the full width. When you look straight down the beam (where you'd see it edge-on as paper-thin), it fades out gracefully instead of breaking the illusion.

## How It Works

### Vertex Shader: Cylindrical Billboarding

The shader takes a cross product between the camera direction and the beam's local Y-axis to get a "right" vector. The quad's vertices are rebuilt using this right vector (horizontal) and the beam axis (vertical).

The result: the quad always faces you, but it won't flip or tumble; it stays locked to its axis like a real light cone would.

A dot product between the view direction and beam axis produces a fade value for the edge-on case.

### Fragment Shader: Shape + Atmosphere

The cone shape comes from `pow(uv.y, 1.0 - curve)` which interpolates width from a narrow tip to a wide base. Smoothstep masks give the edges a soft falloff.

For the dusty atmosphere effect, three noise texture samples scroll in different directions:
- Two control alpha (dust/smoke density)
- One drives UV distortion so the noise isn't static

World-position offsets ensure each beam samples a different region of the noise texture, so adjacent beams don't look identical.

### Performance

One shared `ShaderMaterial` gets `.clone()`'d for each beam. This shares the compiled shader program on the GPU while giving each beam its own uniform values. Additive blending with no depth writes means no sorting overhead.

The noise texture is generated once on a `<canvas>` at startup; zero external assets, zero network requests.

Compare this to raymarched volumetrics (dozens of texture samples per pixel per frame) and the cost difference is night and day. You can spawn hundreds of these beams and still hit 60fps.

## Controls

The demo has a GUI panel where you can:
- Spawn random lights with varied colors, sizes, and angles
- Tweak the cone shape (curve, tip width, edge sharpness)
- Adjust the atmosphere (dust intensity, noise scale, simulation speed)

## Credits

- **Original shader concept:** [Passivestar](https://passivestar.xyz/posts/light-beam-shader-in-godot/)
- **Three.js port:** Me + Gemini

The technique itself dates back to Valve's Source engine circa 2004. Sometimes the old tricks are the best tricks.
