---
title: "Windows Phone 8 and Unity"
date: 2013-09-24
categories: [DevBlog]
tags: [Unity]
description: "phone  Been doing some testing on a phone that was given by family. Its a Nokia Lumia 521. I’m guessing that it ranks fairly low on the performance..."
image: "/assets/img/blog/wp/phone.png"
---

![phone](/assets/img/blog/wp/phone.png)
 Been doing some testing on a phone that was given by family. Its a Nokia Lumia 521. I’m guessing that it ranks fairly low on the performance spectrum, so I decided to try Unity’s free Windows Phone exporter. Getting set up was fairly simple. I already had VS2012 installed. All I had to do was set up the device as a developer device and I was able to push builds to the phone.

My first problem when coding using Windows Phone is the lack of ArrayList and HashTable. This totally caught me off guard, and ended up grounding my development for about a week. Now I’m happy with List and Dictionary, and things perform better that way.

This phone seems to only render Fixed Function shaders – so getting all the fancy effects Unity can throw at me isn’t really a possibility. However – I can render around 40 moving physics items with a decent polycount above 30FPS. Skinned/rigged meshes seem to eat a bit more frames – probably due to the lack of batching or something.

I’m too busy with another project that I can’t speak about – but my week-long dive into mobile development was helpful in getting an idea of what mobile can do.

As a side note: I hate mobile controls. Frankly I’m not sure I can ever be comfortable playing a game with virutal joysticks or tilt controls. It feels so out of place and uncontrollable. Not to mention I have fat thumbs. From what I can see – if your game isn’t “tap here, then tap there”, it won’t really feel right. I might expand the game pictured above with some zombies and a tap-to-shoot style of play. Who knows!
