---
title: "RuntimeCSG: Boolean Brush Modeling That Actually Works at Runtime"
date: 2026-02-17
categories: [devblog]
tags: [Unity, CSG, Boolean, Geometry, Tools, UPM]
description: "A non-destructive CSG brush modeling system for Unity, inspired by Chisel. Per-brush algorithm, 5 primitives, chunk system, and it works at runtime."
image:
  path: /assets/img/blog/runtimecsg-editor.png
  alt: "RuntimeCSG editor view showing boolean brush operations in Unity"
---

![RuntimeCSG](/assets/img/blog/runtimecsg-editor.png){: .align-center }

**[Landing Page](https://tront.xyz/runtimecsg/)** | **[GitHub](https://github.com/TrentSterling/runtimecsg)** (private)

## The Problem

Unity doesn't have CSG. ProBuilder exists, but it's mesh editing -- vertex pushing, edge loops, face extrusion. That's not boolean operations. You can't take two shapes, subtract one from the other, and get a clean result.

Chisel was the closest thing we had. It was a proper CSG tool for Unity inspired by the Source engine's brush system. Then development stopped. The repo went quiet. If you wanted boolean brush modeling in Unity, your options were "use an abandoned project" or "write it yourself."

So I wrote it myself.

## How It Works

RuntimeCSG uses a Chisel-style per-brush CSG algorithm instead of the traditional monolithic BSP approach. The pipeline looks like this:

1. **Split** -- each brush's polygons get split against the planes of every overlapping brush
2. **Categorize** -- each polygon fragment is classified (inside, outside, aligned, reverse-aligned) relative to each neighboring brush
3. **Evaluate** -- the full boolean chain determines which fragments are visible based on operation type
4. **Build** -- visible fragments are collected into chunked meshes with auto-generated MeshColliders

The key insight is that each brush is processed independently. When you move a single brush, only the chunks it touches need rebuilding. The chunk system tracks dirty regions so unchanged areas are never recomputed. Rebuilds are time-sliced across frames with a configurable millisecond budget so you never get a frame spike.

Three boolean operations: **Additive** (union), **Subtractive** (carve), and **Intersect**. Five brush primitives: box, wedge, cylinder, arch, sphere. All defined by clipping planes internally, which means the math is clean and extensible.

A couple of decisions I'm happy with: plane math uses **double precision** internally to avoid the float precision collapse you get when brushes are far from the origin. Coplanar surfaces (two brushes sharing a face) use a **later-brush-wins tiebreaker** so you never get z-fighting.

## Runtime API

This is the part that matters most. RuntimeCSG isn't just an editor tool. It works at runtime. You can build and modify CSG geometry from code while the game is running.

```csharp
// Create a CSG model
var modelGo = new GameObject("Level");
var model = modelGo.AddComponent<CSGModel>();

// Add a floor
var floor = new GameObject("Floor").AddComponent<CSGBrush>();
floor.transform.SetParent(modelGo.transform);
floor.SetBox(new Vector3(10f, 0.5f, 10f));
floor.Operation = CSGOperation.Additive;

// Carve a hole
var hole = new GameObject("Hole").AddComponent<CSGBrush>();
hole.transform.SetParent(modelGo.transform);
hole.SetBox(new Vector3(1f, 1f, 1f));
hole.Operation = CSGOperation.Subtractive;
```

That's it. The model detects brush changes automatically via dirty tracking and rebuilds the affected chunks. Move a brush at runtime and the geometry updates. Add or remove brushes and the mesh regenerates. MeshColliders update too, so physics just works.

The editor side has a scene overlay toolbar with keyboard shortcuts (Tab to toggle, Shift+B/W/C/S for quick brush creation) and full Unity Undo support. But the runtime path is the same code -- no editor-only hacks.

## Testing

185 tests across two suites: 143 editor tests covering the pure CSG algorithm (split, categorize, evaluate, all operation combinations, edge cases like touching brushes and coplanar faces) and 42 runtime tests covering the component pipeline (brush creation, chunk rebuilds, mesh generation).

Tested on Unity 2022.3, 6000.1, and 6000.3. The whole suite runs in batch mode via Tronthub and gets triggered automatically by TrontAgent on every commit.

## What's Next

The package is a clean UPM install with separate runtime and editor assemblies. It works, the tests pass, and the API is stable. I'm considering an Asset Store release -- there's a real gap in the market for a CSG tool that actually works at runtime and isn't abandoned.

For now the repo is private while I clean up the editor UX and add a few more brush types. If you're interested, the landing page has more details.
