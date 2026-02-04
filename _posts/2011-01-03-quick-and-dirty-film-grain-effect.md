---
title: "Quick and dirty film grain effect"
date: 2011-01-03
categories: [devblog]
tags: [effects, Papervision3D]
description: "Adding a film grain effect to my zombie shooter for that gritty Left4Dead feel."
image: "/assets/img/blog/filmgrain.png"
---

First of all, I think I'm done with daily blogging. It's too stressful, and I still post pretty often, so don't worry. It becomes a problem when I have to post every day though and all I can come up with is lolcats. I'll try posting some development related things soon. I'll also be cleaning up the blog again at TVBs suggestion.

**Now onto some game stuff.**

It's a zombie shooting game! Of course I'm going to add film grain! **It makes things more gritty!**

![Film Grain Effect](/assets/img/blog/filmgrain.png){: .align-center }
*Film Grain Effect*

I was originally going to use the Noise function of the bitmapdata, but found that things run much more smoothly when you use a single bitmap and scroll it across the viewport. So I created an extra wide bitmap full of noise / grain, and simply scroll it across the screen each frame. When it reaches the end of the bitmap, it sets x=0 and starts over! If you need some noise but don't feel like opening photoshop, feel free to use the image below.

![Wide Film Grain - Free to reuse!](/assets/img/blog/filmgrain_wide.png){: .align-center }
*Wide Film Grain - Free to reuse!*

Anyway, it's a simple effect, and I think it looks great. Reminds me of the film grain from Left4Dead, which has been my inspiration for this game. L4D and Doom. Heh, I'm making 2D **Left4Doom**.

![Left4Doom](/assets/img/blog/left4doom_9261.jpg){: .align-center }
*Left4Doom*
