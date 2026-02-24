---
title: "Vibe Coding: Rapid Game Prototyping with Gemini 2.5 (Even if I Hate It)"
date: 2025-04-10
tags: [AI, ComputeShaders, GameDev, Gemini, JavaScript, Prototyping, ThreeJS, Unity]
description: "Exploring rapid game prototyping using Gemini 2.5 via 'Vibe Coding' in JavaScript, despite hating the process, and discussing AI's role in Unity development."
image: "/assets/img/vibecoding.png" # Keep the main featured image as the vibecoding meme
---

![Vibecoding meme](/assets/img/vibecoding.png)

---

I'm a Unity dev mostly, comfortable in C# and the engine. But I've been playing around with Gemini 2.5 for code generation lately. I've used ChatGPT for quick code help before, but this "vibe coding" idea only seemed remotely possible once Gemini 2.5 came out with its free tier and massive 1 million token context.

Before this, the free ChatGPT context limit was a joke for anything serious. You'd hit a wall around 600 lines per class, making anything complex a pain. Now, I can feed Gemini whole chunks of logic, physics, procedural generation, UI stuff, all in one go without it losing its mind. It's a significant step up. I still need to get the CLI agent setup working with VSCode, which should make managing files easier, but that's on the list.

---
## The "Vibe Coding" Paradox

Now, let's be real: I don't actually *like* vibe coding. We've all seen the Primeagen streams trying to make it work, and frankly, most experienced developers avoid it for good reasons. It often feels random, like you're fighting the AI more than working with it.

But... there's still something compelling there. I know Unity well, but I actively dislike vanilla JavaScript. Yet, here I am, after maybe 15-20 prompts back and forth with Gemini, getting functional prototypes running *in the browser* using JS and Three.js. Stuff that feels like it should need a proper engine setup. I built things in a language I hate, way faster than I expected. That part is undeniably wild, even if the process itself can be frustrating.

---
## The Browser Prototypes 

These were all quick experiments, built fast to test mechanics, not to be polished games. Mostly vanilla JS and Three.js. The main reason for JS was simple: so anyone could click a link and see these things run without needing Unity installed or dealing with builds. It was about rapid iteration and showing you don't need the whole engine for *every* idea.

*   **VibeStar**
    *   Play it here: [`tront.xyz/vibestar/`](https://tront.xyz/vibestar/){:target="_blank"}
    *   **Idea:** Threaded A* pathfinding for agents in a voxel world with heavy visualization.
    *   **Result:** This one got pretty involved. It uses Web Workers to run A* pathfinding (with a Min Heap implementation) off the main thread. Agents (boids) navigate a procedural voxel world towards a user set target or random locations. The real standout is the visualization system: shader based points/cubes show A* nodes being explored by workers, boid paths are drawn, agent states are colored, and there's a global target marker. Loads of tweakable parameters for performance and visuals. Honestly, the threaded pathfinding and the debug viz came out looking **pretty badass** for a quick prototype.

     
    *   **Tech:** Vanilla JS, Three.js, Web Workers, custom A* implementation (Min Heap), custom voxel world generation, complex shader based visualization.
    *   **Shots:** Still a decent amount of back and forth, maybe 20+ shots, due to the complexity of threading, A*, and visualization logic.
	
   ![VibeStar A* Pathfinding Visualization](/assets/img/astarvibes.png)


*   **VibeCraft**
    *   Play it here: [`tront.xyz/vibecraft/`](https://tront.xyz/vibecraft/){:target="_blank"}
    *   **Idea:** Basic Minecraft style exploration with performant chunk loading.
    *   **Result:** A first person demo in a procedural world generated with simplex noise. It features two movement modes: standard grounded FPS controls (walk/jump) and a free flying mode (toggle with F). It actually defaults to flying mode on start because a key goal was testing the performance of the chunk loading/unloading system, which uses Web Workers to avoid hitching the main thread. Flying around lets you cover ground quickly and really see how well the terrain streaming keeps up. Also includes basic ground collision (when walking) and a working day/night cycle affecting lighting and fog.
    *   **Tech:** Vanilla JS, Three.js (r128), PointerLockControls, SimplexNoise lib, Web Workers.
    *   **Shots:** Around 10 to 15 iterations.
	
	
        ![VibeCraft Terrain Chunker](/assets/img/vcraft1.png)
        ![VibeCraft Terrain Chunker](/assets/img/vcraft2.png)

*   **VibeBounce**
    *   Play it here: [`tront.xyz/vibebounce/`](https://tront.xyz/vibebounce/){:target="_blank"}
    *   **Idea:** Visualizing ray bounces in a voxel space using an SVO.
    *   **Result:** An interactive simulation where you click a voxel surface to set an origin point. Rays then emit from that point and bounce realistically off the voxel geometry. The core tech is a Sparse Voxel Octree (SVO), which efficiently represents the 3D space by only subdividing occupied areas, making ray intersection tests much faster than checking every voxel. You can rotate the view, zoom, and tweak lots of parameters like grid resolution, noise density, ray count, bounce limits, ray distance, and visual timings/opacity via a control panel.
    *   **Tech:** Vanilla JS, Three.js (0.164.1), OrbitControls, custom SVO implementation, custom raycasting logic.
    *   **Shots:** Maybe 15-20 shots, the SVO logic took some refinement.

        ![VibeBounce SVO + Ray Bounce Visualization](/assets/img/vibe_bounce.jpg)
		
*   **VibeCar**
    *   Play it here: [`tront.xyz/vibecar/`](https://tront.xyz/vibecar/){:target="_blank"}
    *   **Idea:** Raycast vehicle physics sim with live tuning.
    *   **Result:** A surprisingly capable arcade style car simulation using Three.js for visuals and Cannon.js for the physics backend. It uses a raycast based approach for the wheels and suspension. The cool part is the live tuning panel allowing you to adjust dozens of parameters on the fly – things like car mass, engine force, suspension strength/damping/travel, wheel radius, track width, grip factors, steering angle/speed, and damping. It even tries to auto flip if stuck upside down, has manual flip (F key), a handbrake, basic speed/slip display, and I threw in some ramps and trees to crash into.
    *   **Tech:** Vanilla JS, Three.js, Cannon.js physics, Raycast vehicle controller, extensive live tuning UI.
    *   **Shots:** Probably took around 15-20 shots to get the physics integration, tuning panel, and extra features working reasonably well.

        ![VibeCar](/assets/img/vcar1.png)
        ![VibeCar](/assets/img/vcar2.png)

*   **2D AI Racer** (No public link)
    *   **Idea:** Top down racing with AI opponents. Basic track, AI cars using simple waypoint following and look ahead logic for steering. Good test for pathfinding prompts.
        ![Racers](/assets/img/racers.png)

*   **Bookworm Clone** (No public link)
    *   **Idea:** Word finding game based on Bookworm.
    *   **Result:** This one was tough. It required significantly more prompts, probably pushing 25+. Had to prompt Gemini to build a foundational Match 3 grid system first, *then* layer the word finding and scoring logic on top. Really highlighted the limits when dealing with complex, interdependent systems. Needed a lot more nudging and breaking the problem down.
	
        ![Match3](/assets/img/colormatch.png)
        ![HexWorm](/assets/img/hexworm.png)
		
		
		
*   **Marble Game** (No public link)
    *   **Idea:** Roll a marble through a level. Simple physics based rolling marble prototype, mostly used to quickly test camera follow logic and basic collision response. As you can see the track generator wasn't great. (More prompting could've fixed this, but I wanted to move on quickly!)
        ![Marble Roll](/assets/img/marble_track.jpg)
		

---
## Assisting in Unity Too

While these JS demos were quick and dirty ways to test ideas, I use AI (Gemini) in my actual Unity workflow constantly. It's not *just* about vibe coding stuff I don't know well.


Case in point: I recently built out a GPU-powered voxel raycasting system in Unity. AI was instrumental:
1.  Helped figure out efficient GPU visualization (`Graphics.RenderPrimitives`) when standard methods choked.
2.  Assisted in porting a Voxel DDA raycaster to a compute shader kernel.
3.  Generated boilerplate for GPU billboard rendering of hit points.
4.  Helped structure the `AsyncGPUReadback` process to get results back to the CPU for audio occlusion logic.
5.  Provided starting points for multi-pass compute shaders needed for path tracing visualization.

It acted like a pair programmer that knew compute shaders, HLSL, and Unity graphics APIs way better than I could recall offhand, significantly speeding up development of a complex feature.







---



![Rays](/assets/img/ray3.jpg)
![Rays](/assets/img/ray1.png)
![Rays](/assets/img/ray2.png)


---



## The Takeaway: Janky Process, Useful Accelerator

So, yeah. Even if "vibe coding" feels janky sometimes, AI like Gemini 2.5 *is* a powerful accelerator for early stage prototyping. Especially for solo devs or small teams just wanting to see if an idea has legs quickly. I could try out core mechanics in JS, a language I avoid, far faster than setting up equivalent projects from scratch, even in Unity where I'm comfortable. Getting something like the threaded A* visualizer (VibeStar), the SVO ray bouncer (VibeBounce), or even the live tunable car physics (VibeCar) running purely through prompts in a browser environment is pretty **nuts**.

It's not replacing developers or deep engine work. But it's definitely changing how fast you can slap together a proof of concept. It lets you focus more on the core game idea and less on the initial boilerplate, even if you have to wrestle the AI into shape. In regular development (like Unity), it's less "vibe" and more "augmentation" – handling the tedious bits and providing expert knowledge on demand.

Curious if anyone else has had similar experiences fighting with, but ultimately getting results from, these tools. Let me know your thoughts.

---
## Join the Discussion

Wanna chat more about this stuff? Found cool uses for AI in your dev work? Join my Discord:

| [https://tront.xyz/discord/](https://tront.xyz/discord/){:target="_blank"} |

---
{% comment %}
Blog post about Gemini 2.5 prototyping experiences.
#Author: {{site.author}}
{% endcomment %}