---
title: "Device History: WTF Just Disconnected?"
date: 2026-02-28
categories: [devblog]
tags: [Rust, egui, USB, Windows, WMI, Tool]
description: "A neon-themed USB device monitor for Windows. Real-time connect/disconnect detection with a GUI, CLI mode, and persistent logging. Built in Rust with egui."
image:
  path: /assets/img/blog/device-history.png
  alt: "Device History v0.4.0 - Neon dark mode USB monitor"
---

![Device History](/assets/img/blog/device-history.png){: .align-center }

**[Download .exe](https://github.com/TrentSterling/device-history/releases/download/v0.4.0/device-history.exe)** | **[GitHub](https://github.com/TrentSterling/device-history)** | **[Landing Page](https://tront.xyz/device-history/)**

You know that moment when your VR headset drops out mid-session, or your game controller just vanishes, and you're staring at the screen wondering what the hell happened? I built Device History because I got tired of asking "WTF just disconnected?" and having no answer.

It's a single 7MB .exe. Download it, run it, done. No installer, no setup, no dependencies. It lives in your system tray and watches silently.

## The Problem

I work with a lot of USB devices - VR headsets, Quest Link cables, Wacom tablets, game controllers, audio interfaces, keyboards, mice. Things disconnect randomly. Something on my desk disconnects a few times a day — I'm not even sure which device it is yet. Could be my Wacom, could be this old USB HDD I've got. Windows gives you a tiny toast notification that disappears in seconds, and the Event Viewer is a nightmare to dig through for USB events. I wanted something that just sits there, watches, and tells me exactly what happened. Now I'll know.

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

## v0.4.0 — System Tray & Device Nicknames

The biggest change in v0.4.0: clicking X doesn't quit the app, it hides to the system tray. A tiny icon sits in your taskbar tray, silently monitoring. Right-click for Show/Hide/Exit, or double-click to restore. It's the kind of tool that should always be running but never in the way.

**Device nicknames** let you rename any device to something human. "USB Composite Device" is useless — "Quest 3 Link Cable" tells you exactly what just dropped. Nicknames are saved to a local prefs file and persist across restarts.

The app also remembers every device it's ever seen in a **known devices** list with first-seen and last-seen timestamps. Over time you build a history of your entire USB ecosystem. There's also search/filter across events and devices, sorting by any column, and full preference persistence (theme, active tab, nicknames).

Under the hood, the tray event handling runs on its own dedicated thread — completely independent of the GUI render loop. This matters because eframe (the Rust GUI framework) stops calling its update function when the window is hidden, which would normally mean tray clicks get ignored. The background thread polls tray events every 100ms and calls Win32 directly to restore the window.

## CLI Mode

If you don't want the GUI, run `device-history --cli` and get colored terminal output with the same monitoring. Same WMI polling, same logging, just text in your terminal. Useful for piping into other tools or running in a tmux pane.

## Tech Stack

- **Rust** - compiles to a single .exe, no runtime dependencies
- **eframe/egui** - immediate-mode GUI. The whole UI is one `update()` function that rebuilds every frame
- **wmi crate** - queries `Win32_PnPEntity` for USB device data
- **chrono** - timestamps for events and log entries
- **image** - loads the pirate face icon for the window/taskbar
- **winresource** - embeds the .ico into the .exe at build time

The architecture is dead simple: main thread runs egui, background thread runs the WMI poll loop, shared state protected by `Arc<Mutex<AppState>>`. No async, no channels, no complexity. The whole thing is one file. It also checks GitHub for new releases on startup — if there's a newer version, a clickable banner shows up in the header.

## Get It

Grab the .exe from the [releases page](https://github.com/TrentSterling/device-history/releases/tag/v0.4.0) and run it. That's it.

Or if you want to build from source:

```bash
git clone https://github.com/TrentSterling/device-history
cd device-history
cargo build --release
```

Or install via cargo:

```bash
cargo install --git https://github.com/TrentSterling/device-history
```

Windows only (WMI is a Windows API).

---

This was a fun little self-contained build — the kind of tool that scratches a specific itch and does one thing well. Functional in an afternoon, styled in an evening, system tray and nicknames added because I kept using it and wanted more. Sometimes the best tools are the simplest ones. Next time something disconnects, at least I'll know what it was — and I'll have named it something I can actually recognize.
