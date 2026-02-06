---
title: "QuantumVibes: Vibecoding Quantum Mechanics After a Veritasium Epiphany"
date: 2025-05-07
categories: [DevBlog, Projects, Experiments, AI]
tags: [AI, DoubleSlit, Feynman, GameDev, Gemini, HTML5, IndieDev, Interactive, JavaScript, LLM, PathIntegral, PhysicsVisualization, QuantumPhysics, QuantumVibes, Simulation, Veritasium, Vibe Coding, Visualization, WaveParticleDuality, WebWorker]
description: "How a Veritasium video about Path Integrals sparked the creation of QuantumVibes, my interactive Double-Slit and Feynman Path Integral simulator, vibecoded with AI."
image: "/assets/img/QUANTUM_REFRACTION.png"
---

So, yeah. Quantum mechanics. It's one of those things that always tickles the back of your brain if you're a dev, right? You think you kinda get it. Double-slit, Schrödinger's cat, all that jazz. But then, every once in a while, something just re-scrambles your eggs in the best possible way.

For me, recently, it was a damn good [**Veritasium video about really trusting quantum mechanics**](https://www.youtube.com/watch?v=qJZ1Ez28C-A){:target="_blank" rel="noopener noreferrer"}. I'd *known* about Feynman's path integrals – the idea that a particle takes *every possible path* simultaneously. But seeing it visualized so clearly... it wasn't just an abstract concept anymore. It was like, "Oh. OH. Light is literally exploring *all the goddamn paths*." That hit different.

<div style="text-align: center; margin: 1.5em 0;">
<iframe width="560" height="315" src="https://www.youtube.com/embed/qJZ1Ez28C-A" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
<br>
<em><small>The Veritasium video's visualization of Feynman's "Infinite Paths" was a key inspiration.</small></em>
</div>

And when my brain breaks like that, I gotta build. So, **QuantumVibes** was born – a quick, dirty, browser-based interactive toy to poke at this weirdness. Popped into existence around early May 2025 after some chats and that video rattling around in my skull.

**[>>> Play QuantumVibes In Your Browser! <<<](https://tront.xyz/quantumvibes/){:target="_blank" rel="noopener noreferrer"}**

---

<center>
  <img src="/assets/img/QUANTUM_REFRACTION.png" alt="QuantumVibes - Abstract Visualization of Quantum Wave Interference and Particle Paths" style="max-width: 700px; margin-top: 1em; margin-bottom: 0.5em; border: 1px solid #555; padding: 3px; background-color: #111;">
  <br>
  <em>My own attempt to visualize the beautiful weirdness – the core of QuantumVibes.</em>
</center>

---

## The "Vibecoding" Process: Yelling at a Robot Until Physics Happens

Now, how do you make a quantum sim on a whim when your main jam is C# and Unity, but you want this sucker on the web? You "vibecode" it. You sit down with an AI – Gemini, in this case – and you start prompting. And prompting. And occasionally cursing.

Let's be real: the effort was probably **1% me and 99% the robot**. I did some HTML nudging, but the JavaScript core? That was a collaborative hallucination. Took around **30 solid "shots"** (prompt iterations) to get something resembling the vision. And yeah, once Web Workers got involved for performance, I had to nuke the AI's context and start a fresh chat. It gets... *confused*. Standard procedure for anything non-trivial.

> Is it elegant code? Probably not. Does it work and let you fiddle with quantum concepts? You bet. That's the chaotic beauty of vibecoding.

---

## QuantumVibes: Two Flavors of Mind-Bending

The toy lets you interactively explore two core concepts:

### 1. The Double-Slit Experiment: Wave? Particle? Yes.

[![Double-Slit Simulation](https://tront.xyz/img/quantum_refraction.png)](https://tront.xyz/quantumvibes)

The classic that gives everyone an existential crisis. My sim lets you:

*   Witness wave-particle duality by toggling an "observer."
*   See the iconic interference pattern emerge (or collapse!).
*   It's powered by Web Workers for a fast histogram build-up, even with 10,000+ simulated "particles" at high speed. The visually moving particles are mostly for show.
*   Fiddle with sliders for `Slit Separation`, `Slit Height`, `Wave Constant` (your effective wavelength!), `Particle Speed`, etc.

**Accuracy disclaimer:** This is a *demonstration*. It shows the *effect*. It's almost certainly not Nobel Prize-winning physics in its mathematical rigor. But the diffraction patterns look cool!

### 2. Feynman's Path Integral Explorer: Taking ALL The Roads

[![Path Integral Explorer](https://tront.xyz/img/quantum_refraction.png)](https://tront.xyz/quantumvibes)

This is where that Veritasium video really shines through in the project. You set start (A) and end (B) points. The sim then draws a zillion random paths between them. The ones closest to the "path of least action" (usually the straightest) are emphasized. It's wild to see the classical path emerge from the quantum fuzz.

---

## The "Aha!" Moment

This project was about trying to capture that intuitive *click* when you finally *see* a complex idea like "light explores all paths." My little sim is a tribute to that. It's one thing to read that a particle explores every route; it's another to *see* a representation of that, even a simplified one, and watch order emerge from apparent chaos.

This was a quick, fun, slightly unhinged experiment. Mobile might be janky, accuracy is "good enough for jazz," but hopefully, it sparks some quantum curiosity.

## Join the Discussion

Wanna talk gamedev, AI coding, weird physics, or share cool stuff? Hit up the Discord – it's an active crew of devs working on all sorts of interesting projects (multiplayer, VR, AI, hardware, and more).

[**>>> Join the TrontDev Discord Server <<<**](https://discord.gg/0hyoWZyM6y7kkFCN){:target="_blank" rel="noopener noreferrer"}

---
*Keep it weird, folks.*