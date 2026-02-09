---
title: "EOS-Native: I Built a Standalone Multiplayer Framework for Unity"
date: 2026-02-07
categories: [devblog]
tags: [EOS, Multiplayer, Networking, Open Source, Unity, P2P]
description: "What started as a FishNet transport turned into a full multiplayer networking framework. 80 managers, 46K lines, zero middleware."
image: "/assets/img/blog/eos-native.png"
---

![EOS-Native](/assets/img/blog/eos-native.png){: .align-center }

Five days ago I released [FishNet-EOS-Native](/posts/fishnet-eos-native-released/); a transport layer for FishNet that talks directly to the EOS SDK. Cool, works great, shipped it.

Then I kept going.

**[GitHub Repo](https://github.com/TrentSterling/EOS-Native)** | **[Documentation](https://tront.xyz/EOS-Native/)** (51 pages)

## What Happened

I was building features on top of FishNet (host migration, SyncVars, replays) and kept running into the same problem: FishNet's architecture fights you on P2P. RPCs route through the host. Migration destroys and recreates objects. SyncVars use reflection hacks to survive migration.

So I stopped writing a transport and started writing a framework.

EOS-Native is a complete multiplayer networking stack for Unity built directly on top of EOS P2P. No FishNet, no Mirror, no Photon, no middleware. Just EOS packets and a 4-layer architecture I own top to bottom.

## The Architecture

```
Layer 3: Game Systems     (planned: prediction, rollback, spatial interest)
Layer 2: High-Level Net   (NetworkObject, SyncVar, NetworkTransform, EasySync)
Layer 1: Transport Toolkit (NetWriter/Reader, MessageRouter, PacketFragmenter)
Layer 0: Raw EOS SDK      (P/Invoke bindings, native libs for 7 platforms)
```

**Layer 0** is the official EOS C# SDK with native binaries for Windows (x86/x64), macOS, Linux (x64/ARM64), iOS, and Android.

**Layer 1** handles binary serialization with pooling, packet fragmentation for EOS's 1170-byte limit, typed message routing, and frame-level batching.

**Layer 2** is where it gets interesting. NetworkObject, SyncVar\<T\>, SyncList\<T\>, SyncDictionary, NetworkTransform with spring physics and 3-tier LOD, NetworkAnimator, and EasySync (Normcore-style no-code property sync from the Inspector).

**Layer 3** is the roadmap; prediction, rollback, spatial interest management.

## Why P2P Mesh Matters

In FishNet/Mirror, all RPCs go through the host. Player A wants to tell Player B something? A -> Host -> B. The host is a bottleneck.

In EOS-Native, RPCs go direct. A -> B. The host only matters for authority arbitration and late-join snapshots. This means less latency for player-to-player communication and less load on the host.

## Zero-Hitch Host Migration

This is the feature I'm most proud of. When the host disconnects in FishNet, every NetworkObject gets destroyed and recreated on the new host. That means a frame of flicker, lost particle effects, reset animations, and reflection hacks to save/restore SyncVars.

In EOS-Native, nothing gets destroyed. The authority pointer changes, the RPC migration buffer flushes queued messages, and the game continues. The EOS lobby layer (voice, chat, presence) survives migration automatically since it's a separate layer from the networking.

## 80 Managers

The framework ships with 80 C# manager classes covering:

- **Lobbies** - create/search/join, 4-digit codes, quick match, fluent builder API
- **Voice** - RTC voice chat, audio device selection, pitch shifting
- **Chat** - lobby text chat, global channel-based chat
- **Social** - friends, party system, presence, Discord rich presence
- **Ranked** - ELO/Glicko-2/SimpleMMR matchmaking with seasons
- **Stats** - leaderboards, achievements, match history
- **Replays** - record/playback with timeline, auto-detected highlights (multi-kill, clutch, comeback), voice recording
- **Moderation** - reports, sanctions, vote kick, AFK detection
- **Storage** - cloud saves (400MB per player, 10GB title)
- **Anti-cheat** - EOS EAC integration
- **UI** - F1 debug overlay (6 tabs), Canvas UI for mobile, runtime console

All of this is free. No per-CCU fees, no middleware licenses. EOS is free; this package is free.

## The Hard Parts (Round 2)

**Binary serialization** - wrote NetWriter/NetReader from scratch with pooling. Every SyncVar dirty-tracks its own state and serializes only when changed. Sequence numbers on every packet so stale data gets rejected.

**NetworkTransform** - this one took a while. It's a hybrid system: spring physics for smooth local interpolation, buffered interpolation for remote peers, extrapolation with velocity prediction when packets are late, and a 3-tier LOD system (Full/Tweened/Simple) based on distance with hysteresis to prevent thrashing.

**Late-join snapshots** - when a new peer joins, the host sends a full state dump of every NetworkObject, their SyncVars, ownership, and spawn data. The new peer reconstructs the entire game state from this snapshot.

## Install

UPM git URL:
```
https://github.com/TrentSterling/EOS-Native.git?path=Assets/com.tront.eos-native
```

Or just copy `Assets/com.tront.eos-native/` into your project's `Packages/` folder.

Add `EOS_DISABLE` to your scripting defines if you need to strip EOS from compilation.

## What's Next

- Packet compression (LZ4 or similar)
- Client-side prediction and rollback
- Spatial interest management
- SyncVar LOD tiers (dynamic sync rate for all SyncVars, not just transforms)
- Multi-transport crossplay (EOS + Steam side by side)
- Spectator mode
- Dedicated server support
- [TrontCloud](https://tront.xyz/trontcloud/) integration; optional persistent backend for stats, leaderboards, and achievements that survive beyond a single play session

The FishNet transport (`FishNet-EOS-Native`) still exists and still works. It depends on this package for the EOS SDK and lobby/voice/social managers. But if you're starting fresh and don't need FishNet's abstractions, EOS-Native gives you the full stack with less overhead.

[Docs are here](https://tront.xyz/EOS-Native/) - 51 pages covering setup, architecture, every feature, and API reference.
