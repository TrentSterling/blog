---
title: "PowerShell Manager — a system tray tool for arranging terminal windows into grids"
date: 2026-02-28
categories: [Projects, Tools]
tags: [rust, egui, windows, terminal, desktop-app, system-tray, win32, open-source]
description: "A tiny Rust app that lives in your system tray and snaps PowerShell, Windows Terminal, and other terminals into grid layouts. Draggable weighted grids, 21 presets, headless CLI mode."
---

## The Problem

I run a lot of terminal windows. PowerShell sessions, Windows Terminal tabs, the occasional cmd. They pile up and overlap each other. Every time I want to see multiple terminals side by side I'm manually dragging and resizing windows, trying to eyeball equal spacing. Windows Snap helps for 2-4 windows but falls apart when you want a 2x3 grid or an asymmetric layout.

I wanted something that sits in the tray, detects all my terminal windows, and snaps them into a grid with one click.

## What It Does

PowerShell Manager is a system tray app built in Rust with egui. You run the exe, it drops into your system tray. Right-click the icon for a menu of 21 built-in layout presets. Left-click opens a GUI with a visual preview, detected windows list, and settings.

It detects windows from 14 terminal types: PowerShell, pwsh, Windows Terminal, cmd, Alacritty, WezTerm, Hyper, mintty, ConEmu, Tabby, Terminus, Kitty, Rio, and conhost.

### Layout Modes

**Preset mode** gives you 21 built-in layouts: grids from 1x2 to 4x4, column/row splits, left-right, top-bottom, main-side (one big pane + stacked side panes), and focus (75/25 split with stacked side).

**Custom Grid mode** lets you set any column/row count from 1-8 and then drag dividers between cells to create weighted layouts. Want the left column to be twice as wide as the right? Drag the divider. The preview shows live percentage labels (e.g. "67%x50%") so you know exactly what you're getting.

**Cell toggling** — click any cell in the preview to disable it. Disabled cells are skipped when arranging, so you can leave gaps for other apps.

### Headless CLI

For scripting and hotkeys:

```bash
powershellmanager.exe --headless 2x3
powershellmanager.exe --headless columns:4
powershellmanager.exe --headless main-side:3
powershellmanager.exe --headless focus:4
```

Arranges windows and exits immediately. No GUI, no tray, just snap and done.

## The Tray Restore Bug

One interesting bug: eframe (the egui desktop framework) stops calling `update()` when the window is hidden via `ViewportCommand::Visible(false)`. This means if you hide the app to the tray, the event loop stops, and tray click events queue up but never get processed. The window becomes permanently invisible.

The fix was moving tray event polling to a dedicated background thread that runs independently of eframe's render loop. The thread polls `MenuEvent` and `TrayIconEvent` receivers every 100ms and calls Win32 `ShowWindow(SW_SHOW)` + `ShowWindow(SW_RESTORE)` + `BringWindowToTop` + `SetForegroundWindow` directly when the user clicks the tray icon. Then it calls `ctx.request_repaint()` to wake up the eframe loop. The main `update()` function detects the window is visible again via `IsWindowVisible` and resumes drawing.

This is the same pattern I used in [Device History](https://github.com/TrentSterling/device-history) — it seems to be the canonical workaround for tray apps built on eframe.

## Tech Stack

- **Rust** (edition 2021) — the whole thing is one binary, no runtime
- **egui/eframe** — immediate-mode GUI for the popup window
- **tray-icon** + **winit** — system tray icon and context menu
- **windows crate** — Win32 APIs for window enumeration (`EnumWindows`), positioning (`SetWindowPos`), process identification (`K32GetModuleFileNameExW`)
- **TOML** — config persistence (~/.powershellmanager/config.toml)
- **clap** — CLI argument parsing for headless mode

The release binary is about 9 MB. No installer needed — just download and run.

## Download

Grab the latest release from GitHub:

- [**Download powershellmanager.exe**](https://github.com/TrentSterling/powershellmanager/releases/latest)
- [**Source on GitHub**](https://github.com/TrentSterling/powershellmanager)
- [**Landing page**](https://tront.xyz/powershellmanager/)
