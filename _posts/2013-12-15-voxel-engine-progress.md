---
title: "Voxel Engine Progress & Optimizations"
date: 2013-12-15
categories: [DevBlog, Projects]
tags: [AI, Indie, Lighting, Mobile, Optimization, Unity, Voxel]
description: "Updates on my voxel-based game engine, including batching, pathfinding, and lighting optimizations for mobile."
image: "/assets/img/Screenshot_2013-12-15-04-07-42.jpg"
---

# Voxel Engine Progress & Optimizations

I've been posting updates on G+, Facebook, and Twitter, but it's probably a good idea to mirror some of that here, even if it’s just quick snippets and screenshots.

### Isometric Looks Cool
After experimenting, I think the game looks pretty neat in isometric view!

![Isometric View](/assets/img/isometriclook.png)

---

### Shifting Focus: Voxel RPG to Bomberman Revival
After some discussions, we decided to pause our voxel RPG and focus on something faster to release.

I had previously worked on a Bomberman-style game and tried to revive it with multiplayer. This will be the third attempt, but this time, all the art and level editing work is already done.

![Bomberman Revival](/assets/img/bomberscreeny.jpg)

We're using the same system as the RPG, so progress has been smooth.

![Pathfinding](/assets/img/E8l4JxY.gif)
Pathfinding is working well with the grid-based level editor. Since the editor is in-game, it has to be perfect.

---

### Optimizing Batching for Performance
I tackled batching today and set up an automated script that integrates with my in-game level editor.
So far, I’ve managed to keep the entire scene under **three draw calls**—under ten even with lighting!

![Batching Progress](/assets/img/batchingbeautiful.gif)

Batching is a game-changer, but I need to refine my texture atlases.

---

### Pathfinding Tweaks & AI Smoothing
Pathfinding updates were instant but caused some wiggling. By staggering updates to one per second, AI movement looks much smoother now.

![Optimized Pathfinding](/assets/img/fastpathing.gif)

---

### Debugging & Funny Moments
Sometimes, I just have to sit back and say… what?

![Weird Debug Moment](/assets/img/whatthe.jpg)

Also, a reminder to **multiply, not divide!**

![Multiply, Don't Divide](/assets/img/multnotdiv.jpg)

---

### Vertex-Based Lighting for Mobile
Since Unity has hard limits on dynamic lights for mobile, I implemented a system to **bake lighting into vertex colors** when saving a level.
This allows **infinite lights** with **zero extra draw calls.**

![Vertex Lighting](/assets/img/vertexlightingunshaded.jpg)

Unity doesn’t allow real-time shadow baking on mobile, and even if it did, it would be too performance-heavy. This approach lets players light up user-generated content without performance issues.

I'm also considering **baking ambient occlusion into vertex colors.** By casting 30-100 random rays per vertex, objects can self-shadow their environment slightly. Vertex colors are surprisingly versatile!

---

### Texture Atlasing & Batching Wins
Using `Texture2D.PackTextures()`, I got automatic texture atlasing working, eliminating the need for paid Asset Store tools.
Next, I’ll integrate it with my `AssetPostProcessor`, so models automatically batch and share materials on import.

![Atlas Progress](/assets/img/atlastest-1.jpg)

With atlased textures, I finally got everything working across rendering, lighting, and batching.
The result? The **entire scene in just one draw call.**

![Mobile-Optimized Scene](/assets/img/mobileready-1.jpg)

This leaves plenty of room for players, powerups, and effects. I won’t do much more optimization unless absolutely necessary.

---

### Final Testing on Android
Baking takes less than a minute, including ambient occlusion. I'd love to test on a beefier device like an OUYA, but for now, I’m using a low-end Android tablet.

![Android Testing](/assets/img/Screenshot_2013-12-15-04-07-42.jpg)

If I can stay above **30 FPS**, it should be fine. **25 FPS might be the real target for low-end devices.**
Still need to test with interactive objects in the scene.

---

### Final Thoughts
This has been a lot of progress for one day. Getting a **runtime level editor**, **fully batched scenes**, and **dynamic lighting on mobile** in a single draw call?
I think that’s pretty sweet.

![Lighting Optimization](/assets/img/lightingchunkbake.gif)

More updates soon!
