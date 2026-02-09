---
title: "SpaceView: A SpaceMonger Clone in Rust"
date: 2026-02-07
categories: [devblog]
tags: [Rust, egui, Disk Space, Visualization, Treemap, Open Source]
description: "I built a SpaceMonger-inspired disk space visualizer from scratch in Rust with egui. Squarified treemaps, live scanning, extension filtering, duplicate detection, and a 3.6 MB binary."
image:
  path: /assets/img/blog/spaceview-neon.png
  alt: "SpaceView - Disk Space Visualizer in Rust"
---

![SpaceView scanning a drive](/assets/img/blog/spaceview-neon.png){: .align-center }

I've always loved [SpaceMonger](https://en.wikipedia.org/wiki/SpaceMonger). You open it, point it at a drive, and immediately see where all your space went. Big rectangles = big files. No graphs, no pie charts, no loading bars that take 20 minutes. Just a treemap.

SpaceMonger was discontinued years ago. WinDirStat is slow. TreeSize is fine but corporate. So I built my own.

**[GitHub Repo](https://github.com/TrentSterling/SpaceView)** | **[Download](https://github.com/TrentSterling/SpaceView/releases/latest)** | **[Site](https://tront.xyz/SpaceView/)**

## What It Does

SpaceView scans a drive or folder and renders a [squarified treemap](https://www.win.tue.nl/~vanwijk/stm.pdf) where every rectangle's area is proportional to its size. Scroll to zoom, double-click to dive into a folder, right-click to zoom back out. Drag to pan. Breadcrumbs show where you are.

It does one thing and does it well.

![SpaceView full drive scan](/assets/img/blog/spaceview-ocean.png){: .align-center }

## Features (v0.11.0)

The app has grown a lot since the first release. Here's what it does now.

- **Live scan visualization.** The treemap builds progressively as files are discovered. No blank screen while scanning. Pause, resume, cancel anytime.
- **5 view modes.** Map (treemap), List (sortable directory browser), Top Files (1000 largest), Types (extension treemap), Duplicates.
- **Drive picker.** Visual drive cards on the welcome screen with capacity bars. Click a drive to scan. No more typing paths.
- **Extension breakdown panel.** Side panel listing every file type by size. Click an extension to highlight matching files in the treemap. Everything else dims.
- **3 color modes.** Color by depth, file age (log-scale heatmap), or file extension. 3 themes: Rainbow, Neon, Ocean. Dark/light mode.
- **Duplicate detection.** Background tiered hashing (size, partial hash, full hash). Results sorted by wasted space.
- **Right-click context menu.** Open in Explorer, Copy Path, Delete to Recycle Bin. Works in all views.
- **Rich tooltips.** Hover any block for name, size, percentage, file count, full path.
- **Cushion shading.** 3D edge shadows on file blocks for visual depth.
- **Search/filter.** Filters across List, Top Files, Duplicates, and the extension panel.
- **Free space block.** See free vs used space. Toggle on/off.
- **Drag and drop.** Drop a folder to scan it.
- **Tiny binary.** 3.6 MB standalone .exe. No installer, no dependencies.

![SpaceView Types view](/assets/img/blog/spaceview-types.png){: .align-center }

## The Interesting Part: Screen-Space Rendering

The original SpaceMonger (I have the source code) does something clever: it lays out children in **screen pixels**, not world coordinates. This means headers are always exactly 16 pixels tall, padding is always 2 pixels, and borders are always 1 pixel, regardless of zoom level.

Most treemap viewers compute everything in world-space, which means when you zoom in, the proportional headers and padding either become enormous or disappear. SpaceMonger avoids this entirely.

SpaceView does the same thing. The world-space layout is approximate. It's only used for camera decisions (what to expand, what to prune, where the camera bounds are). The actual rendering runs `treemap::layout()` at each recursive level in screen coordinates.

```
render_node(node, screen_rect):
  if dir with children:
    1. fill body
    2. compute content area (screen_rect minus header, padding, border)
    3. run treemap::layout() on children in screen pixels
    4. recurse into each child with its screen rect
    5. draw header ON TOP of children
  else:
    fill rect, draw clipped text
```

Headers are drawn *after* children, so they're never obscured. All text uses clip rects to prevent spilling.

## Camera System

The camera is continuous: center + zoom, no navigation stack. Zoom is clamped between 1x (can't zoom past root) and 5000x (prevents floating point overflow at extreme magnification). The center is clamped so the viewport never leaves the treemap bounds.

The clamping was the v0.5.1 fix. Before that, you could double-click a tiny deeply-nested folder and zoom to 100,000x, which caused coordinate overflow and the entire view would go blank. The fix was straightforward: clamp the zoom, clamp the center, do it after every camera mutation.

## Lazy Level-of-Detail

SpaceView doesn't expand the entire directory tree at once. It starts with just the root children, then lazily expands directories that are large enough on screen (> 80px) and prunes ones that are off-screen or tiny.

During camera animations, the expand budget increases from 8 to 32 nodes per frame so the view fills in quickly as you zoom. During idle, it drops back to 8 to save CPU.

## Live Scanning

The scanner runs on a separate thread and sends partial tree snapshots via an mpsc channel after each top-level directory completes. The UI drains these every frame, keeping only the newest, and rebuilds the layout. You can zoom, pan, and hover while scanning.

When switching drives, old trees are moved to a background thread for deallocation. Dropping millions of FileNode allocations on the main thread would freeze the UI. Deferred drops fix that.

## Extension Filtering

The extension breakdown panel shows every file type sorted by total size. Click `.dll` and the treemap instantly dims everything except DLL files. The dimming uses `gamma_multiply(0.25)` on non-matching file blocks. Directory headers and bodies stay untouched since they're containers.

The extension list itself supports search filtering and virtual scrolling for performance.

## The Numbers

| | |
|---|---|
| Binary size | 3.6 MB |
| Language | Rust (edition 2021) |
| UI framework | egui 0.31 |
| Source files | 6 |
| Lines of code | ~2,500 |

## Tech Decisions

**Why Rust?** I wanted to learn it. Disk space visualization is a good fit. File I/O heavy, needs to be fast, benefits from strong typing.

**Why egui?** Immediate mode is perfect for this. The treemap is redrawn every frame from the layout tree. No retained widget state to manage. egui's painter API (`rect_filled`, `text`, `with_clip_rect`) maps cleanly to the rendering model.

**Why not async scanning?** The scanner runs on a separate thread with progress counters. It's simple, it works, and the scan progress UI updates every frame by reading atomic counters. No async runtime needed.

## Install

Download `spaceview.exe` from the [latest release](https://github.com/TrentSterling/SpaceView/releases/latest). No installation needed. Just run it.

Or build from source:

```bash
git clone https://github.com/TrentSterling/SpaceView.git
cd SpaceView
cargo build --release
```

## What's Next

- Advanced filter/search (SpaceSniffer-style syntax)
- Filesystem watcher for live updates
- Export/save scans
- Linux/macOS support (egui already supports it, just needs testing)

The source is on [GitHub](https://github.com/TrentSterling/SpaceView). MIT licensed.
