---
title: "More FlashPunk and Nape.. Oh, and life news!"
date: 2011-08-17T11:43:13
categories: [devblog]
tags: [FlashPunk, Nape, Papervision3D, haXe]
description: "Trying haXe, adopting a kitten named Flexo, car troubles, and engine development progress."
image: "/assets/img/blog/haxe.png"
---

As I'm always looking for better ways to do things, I remembered a few points deltaluca had brought up about using haXe over AS3. There is a haXe port of FlashPunk, and Nape is constructed with haXe, so I looked at moving to haXe myself. After reading a tutorial I was able to get a working Hello World.

![haXe](/assets/img/blog/haxe.png){: .align-center }
*It was harder than I thought it would be!*

I didn't really care for haXe, and I ran back to AS3 as it is much more familiar. Sorry deltaluca. I'm apparently dumb.

While we were staying at David's place, we adopted a kitten from his aunt. It made being stranded in the middle of nowhere Oklahoma much more enjoyable.

![Flexo](/assets/img/blog/jenniferandflexo.jpg){: .align-center }
*His name is Flexo (yeah, from Futurama). I'm sure Jennifer loves him more than me!*

David already has a cat named Simon, so getting a kitten was possibly a bit rude, but eventually Flexo and Simon ended up being friends.

![Simon](/assets/img/blog/lolsimon.jpg){: .align-center }
*Jennifer really enjoys dressing up cats. Cats don't generally enjoy wearing clothes, so it's pretty funny to watch.*

Around this time the starter on our car begins to fail. As the days went on, starting the car went from turning the key, waiting, and trying again, to hitting the starter with a lead pipe and a hammer. Finally the starter decided to crap out on us, and we had to get money together for a new starter. We had to rely on Jennifer's mom and some meditation CD projects she wanted to get our car going. I ended up burning around 600 CDs, and I killed David's burner. We got the money every 100 discs, but we had to help David pay for some electricity, and the gas to keep going back and forth to her moms house left us with nothing extra. Eventually we were able to buy the starter, and some new brakes, as they were getting pretty noisy too. Seems like everything tried to blow up on us at once, and it sucked.

With our car fixed, we were finally able to go home to Missouri. 3 hours into our trip going home, the tie-rod bolt pops out when I'm going around 80MPH. Both tires point INWARDS for a very abrupt and scary stop. It's a miracle that we didn't get into a horrible accident. I really wish I had my camera charged for that. We had to wait for Jennifer's dad to save our ass with a box of bolts he happened to be collecting. He found a matching bolt, and we were back on the road. The alignment is a bit off now, and the car is suffering from 'speed wobbles'. I'm sure the joints and tires are boned, but hey, it got us home.

![Doh!](/assets/img/blog/trentface.jpg){: .align-center }
*This is apparently my 'NO INTERNET' face.*

When I got into my house, I instantly jumped on the computer, expecting to make this post. Unfortunately, the internet was down. I'm on satellite internet, which is a complete pain in the ass. I could rant on about how much satellite internet is a rip-off, but it's the only way to get internet in a rural area.

![Explosions](/assets/img/blog/explosionp.png){: .align-center }
*Explosions, chain reactions, and tons of Nape objects! Beautiful!*

I started working on my FlashPunk + Nape version of Dynamite Max, which I'll refer to as my NapePunk project from now on. I stopped focusing on things like components, and found that inheritance seems to be much easier/faster.

Here's another time lapse SpeedCoding video.

{% include youtube.html id="pd_0zl2UyqI" %}

I figured that components would be the fastest way to do things, but inheritance is so basic and simple that I'm surprised how quickly I was able to put together my prototype.

![flashpunkcpuusage](/assets/img/blog/flashpunkcpuusage.png){: .align-center }
*The CPU usage is amazing! CopyPixels is great, but ugly.*

I used the PreRotation image class that comes with FlashPunk for all of my objects. It bakes the rotations so you can use CopyPixels for your drawing, as it is much faster. The problem is that my game design needs to get away from CopyPixels, as I have a moving camera, and CopyPixels snaps pixels and causes a bit of jitter. I did some experiments with Draw, and looked as simply using the regular DisplayList, but performance started to go out the window.

![Testing DisplayList performance](/assets/img/blog/displaylistperformance.png){: .align-center }
*Testing DisplayList performance*

If I'm going to be wasting CPU cycles on drawing, why not use my modified Papervision renderer? The problem is that when I use fake lighting in my scenes, I can only push about 600 triangles before I see poor performance. I seem to be simplifying everything I can, but lighting is essential to my gameplay design.

![Cubes](/assets/img/blog/modularandslow.png){: .align-center }
*Cubes and lighting? Hah, Flash can't do that! Not smoothly anyway.*

So instead of cutting lighting, I'm cutting down on triangles. I've decided to try and keep my blocky art-style, so I'm keeping things rectangular, but I'm getting rid of cubes! Instead of 6 planes for an object, I'll only be using 1 plane. This will allow the 600 triangle limit to be used by drawing 300 quads, or planes. 300 objects on screen is a pretty decent amount, and is enough to watch Nape start to choke. I figure if my rendering and my physics bottleneck on about the same number of objects, I have a pretty stable limit in place.

![Splitscreen](/assets/img/blog/lookincool.png){: .align-center }
*Lighting, lots of objects, and splitscreen!*

When I started working with Papervision, I felt a lot more comfortable. I started working with things like multiple viewports and a 2 player splitscreen system. Perspective, scaling, tiling and a lot of other things are handled automatically with Papervision. ViewportLayers and many other things make Papervision excellent for 2D/3D drawing. Best of all, I get 60FPS in fullscreen 1680x1050. Quite impressive.

![Desktop power!](/assets/img/blog/desktopmachine.jpg){: .align-center }
*Pretend that this image is animated at 60FPS.*

Anyway, I'm trying to push out this new engine as fast as I can. It is heavily influenced by FlashPunk, which is perfect as it allows for very rapid prototyping. Neat huh?

View the SpeedCoding playlist here: (First 2 videos are FlashPunk, the rest are Cube2D)
[http://www.youtube.com/playlist?list=PL3AFBEA39AD842E60](http://www.youtube.com/playlist?list=PL3AFBEA39AD842E60)
