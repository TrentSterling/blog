---
title: "Device History: WTF Just Disconnected?"
date: 2026-02-28
categories: [devblog]
tags: [Rust, egui, USB, Windows, WMI, Tool]
description: "A neon-themed USB device monitor for Windows. Real-time connect/disconnect detection with a GUI, CLI mode, and persistent logging. Built in Rust with egui."
image:
  path: /assets/img/blog/device-history.png
  alt: "Device History v0.3.0 - Neon dark mode USB monitor"
---

![Device History](/assets/img/blog/device-history.png){: .align-center }

**[GitHub](https://github.com/TrentSterling/device-history)** | **[Landing Page](https://tront.xyz/device-history/)**

You know that moment when your VR headset drops out mid-session, or your game controller just vanishes, and you're staring at the screen wondering what the hell happened? I built Device History because I got tired of asking "WTF just disconnected?" and having no answer.

## The Problem

I work with a lot of USB devices - VR headsets, Quest Link cables, Wacom tablets, game controllers, audio interfaces, keyboards, mice. Things disconnect randomly. Windows gives you a tiny toast notification that disappears in seconds, and the Event Viewer is a nightmare to dig through for USB events. I wanted something that just sits there, watches, and tells me exactly what happened.

## What It Does

Device History polls Windows Management Instrumentation (WMI) every 500ms on a background thread, takes a snapshot of all connected USB devices, and diffs against the previous snapshot. When something changes, it logs it to a file and shows it in a neon-themed GUI with color-coded event cards.

Each event card shows:
- Timestamp
- Connect (green) or disconnect (red) with a colored left accent bar
- Device name
- VID:PID identifier
- Device class (USB, HIDClass, Bluetooth, etc.)
- Manufacturer

The device list panel shows everything currently plugged in. The whole thing runs in about 5MB of memory.

## The Neon Treatment

I've been applying the tront.xyz aesthetic to my tools lately - deep dark backgrounds, neon accents, rainbow gradients. Device History has three themes you can switch between:

- **Neon** - the full tront.xyz experience: `#0d0f14` background, purple/orange/teal/green/red neon accents, rainbow gradient separators
- **Light** - white/light gray, darker muted accents for daylight readability
- **Mids** - balanced medium gray with softer neon tones

The theme picker sits in the header bar. Click and it switches instantly - the entire egui Visuals struct gets rebuilt with the new palette.

## CLI Mode

If you don't want the GUI, run `device-history --cli` and get colored terminal output with the same monitoring. Same WMI polling, same logging, just text in your terminal. Useful for piping into other tools or running in a tmux pane.

## Tech Stack

- **Rust** - compiles to a single .exe, no runtime dependencies
- **eframe/egui** - immediate-mode GUI. The whole UI is one `update()` function that rebuilds every frame
- **wmi crate** - queries `Win32_PnPEntity` for USB device data
- **chrono** - timestamps for events and log entries
- **image** - loads the pirate face icon for the window/taskbar
- **winresource** - embeds the .ico into the .exe at build time

The architecture is simple: main thread runs egui, background thread runs the WMI poll loop, shared state protected by `Arc<Mutex<AppState>>`. No async, no channels, no complexity.

## Building It

```bash
git clone https://github.com/TrentSterling/device-history
cd device-history
cargo build --release
```

Or install directly:

```bash
cargo install --git https://github.com/TrentSterling/device-history
```

Windows only (WMI is a Windows API). Requires Rust toolchain.

---

This was a quick build - functional in an afternoon, styled in an evening. Sometimes the best tools are the simplest ones. Next time something disconnects, at least I'll know what it was.
