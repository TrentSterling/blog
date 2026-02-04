---
title: "Overloading my game with effects"
date: 2010-10-31T22:19:43
categories: [devblog]
tags: [3D, blendmodes, Dynamite Max, FGL, Papervision3D]
description: "Exploring performance issues with lighting and effects in Papervision3D."
---

So now that I'm pushing hard to get my game out, I've run into some issues. I've had to cut a lot of features to get the game out ASAP, and this has helped for the most part. But there are some features which are pretty much finished, but not truly optimized. Here's an image of my game with bloom, lighting, and other effects applied.

![Pretty? Yes. Good FPS? NO!](/assets/img/blog/performance_issues.png){: .align-center }

As you can see, with all of these effects, I'm getting around 30FPS, which is pretty poor because I'm on a quadcore rig. It means that the game will not be able to run on slower machines unless I turn down these effects. Of course, I plans to have an options screen that lets you customize the game's settings for best performance on your machine. Some effects can be done without (distortion, bloom, ect), but some things like lighting are required for gameplay to be the same across multiple computers. Lighting seems to be my biggest bottleneck, so I'm trying to find new ways to do it. I'm not to happy about this!

Currently I'm using a base layer, a lighting layer with the alpha blendmode, and a lighting layer with the overlay blendmode to achieve the lighting effects.

![Everyone loves optimization!](/assets/img/blog/first-idea-copy.jpg){: .align-center }

In my current papervision3d project, I've decided to add a simple 2d fake lighting function for my game. The game layers are drawn to a sprite which can be resized to make a 'stretched' view without bringing up papervision resolution using bitmapData.draw(). I have seen [copyPixels](http://www.adobe.com/livedocs/flash/9.0/ActionScriptLangRefV3/flash/display/BitmapData.html#copyPixels()), but it only has alpha options, and not anything that will transfer color. Not to mention that I'd still have to use the draw command to get a bitmapdata in the first place. I'm pretty sure there's no help there.

> *From: Adobe LiveDocs copyPixels() method*
>
> Provides a fast routine to perform pixel manipulation between images with no stretching, rotation, or color effects.

This blog post is more of a question. Well probably several questions that can get debated in the comments or something. Just organizing my game creates headache. Setting up a blog post worth reading? Now you must be joking!

![Games can get complicated!](/assets/img/blog/too-much-crap-copy.jpg){: .align-center }

I found this combination of draw layers and blendmodes to be the most desirable, but it has crippled my game's performance.

## Full-bright Game Object layer with NORMAL blendmode

```actionscript
RenderedLayer.bitmapData.draw(DrawnGameLayer, null, null, 'normal');//baselayer
```

![Base layer](/assets/img/blog/baselayer.png){: .align-center }

## Lighting layer with ALPHA blendmode (shades of darkness!)

```actionscript
RenderedLayer.bitmapData.draw(LightingLayer, null, null, 'alpha');//alpha light layer
```

![Alpha layer](/assets/img/blog/alphaadded.png){: .align-center }

You can see the FPS is about the same, but I'm on a pretty fast rig. It's a bit slower, but still manageable!

## Lighting layer with OVERLAY blendmode (shades of color!!)

```actionscript
RenderedLayer.bitmapData.draw(LightingLayer, null, null, 'overlay');//overlay light layer
```

![Overlay layer](/assets/img/blog/overlayadded.png){: .align-center }

Here you can see the FPS has dropped. In areas with more lights, it drops quite a bit. What I've learned is that applying blendmodes on the entire viewport kills FPS. I'm looking for a better way to do this, but I haven't come up with any answers!

Each of the draw functions happens right after the other. That's 3 drawing operations, and I may need to add more for some effects.

Ive also tried a Lighting layer with NORMAL blendmode, with Full-bright Game Object layer with MULTIPLY blendmode on top, and a few other blendmode choices that were nothing pretty. I'd like to find some way to apply effects through code, possibly using getpixel and setpixel, but it's a bit out of my league right now.

I can only hope that my questions here won't turn off sponsors because of the exposure. This is really just a developer thing. I really can't wait to sell my first flash game on FGL.
