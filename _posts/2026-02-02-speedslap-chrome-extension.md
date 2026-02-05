---
title: "SpeedSlap v1.2 - YouTube Speed Control"
date: 2026-02-02
categories: [devblog]
tags: [Chrome Extension, JavaScript, Tools, YouTube]
description: "Released a Chrome extension for better YouTube playback speed control."
image: "/assets/img/blog/speedslap.png"
---

![SpeedSlap](/assets/img/blog/speedslap.png){: .align-center }

Shipped a little Chrome extension: **SpeedSlap**

[GitHub](https://github.com/TrentSterling/speedslap) | [Landing Page](https://tront.xyz/speedslap/) | [v1.2 Release](https://github.com/TrentSterling/speedslap/releases/tag/v1.2)

## The Problem

YouTube's built-in speed controls suck. Limited range, clunky UI, no keyboard shortcuts worth a damn.

I watch a lot of educational content at 2-3x speed. Needed something better.

## The Solution

SpeedSlap gives you:

- Speed range from 0.5x to 10x (configurable)
- Keyboard shortcuts (customizable)
- Scroll wheel control on the overlay
- SLAP toggle - one key to jump to your preferred fast speed
- Persistent speed across page loads
- Draggable overlay that remembers position

## Default Shortcuts

- `Numpad +` - Toggle SLAP speed (default 3x)
- Backtick - Reset to 1x
- `]` / `[` - Increase/decrease by 0.5x
- `Shift + ]` / `[` - Fine adjust by 0.1x

## Tech

Manifest V3, vanilla JS, no frameworks. Injected content script handles the YouTube player API.

The trickiest part was handling YouTube's SPA navigation - the player gets recreated when you navigate between videos without a full page load.

## Get It

Clone from GitHub and load unpacked in Chrome. Maybe I'll put it on the Chrome Web Store eventually but the review process is annoying.
