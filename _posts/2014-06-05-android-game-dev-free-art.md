---
title: "Android Game Dev and Free Art"
date: 2014-06-05
categories: [DevBlog, Projects]
tags: [2D, Android, Indie, PlayMaker, Unity]
description: "Exploring Android game development with PlayMaker, free art assets, and performance optimizations."
image: "assets/img/icon.jpg"
---

I know, I know. I haven’t been updating very regularly. Almost an entire game’s development has passed between my last update and this one.

Things have been weird since my last update. My artist is in university, so he’s had to take a little break from the unpaid hours of whipping I’ve been putting him through. I was sorta losing my mind because it felt like I was unable to progress at all without more artwork, and I decided to try something new.

Well, it wasn’t really a conscious decision to try something new. I’ve been trying to post more on the PlayMaker forums because it looks like there are more questions than answers there. I was simply helping a user figure out how to lay out a certain gameplay mechanic. [(Post linked here)](http://hutonggames.com/playmakerforum/index.php?topic=7228.msg35187)


![BJx9yn4](assets/img/BJx9yn4.gif)

I thought it was a nice mechanic. I had played a game with something similar that involved running from the sun and jumping from planet to planet. I exported this and ran it on my tablet. The performance wasn’t bad because the scene is really basic. This is a little different from any other time I’ve played with Android, because in general, everything I make runs like shit. Fill rate and full 3D scenes make my tablet cry.

![Screenshot_2014-05-14-23-44-34](assets/img/Screenshot_2014-05-14-23-44-34.png)

Things were starting to look good. The game was playable, but it lacked polish. Lacked a lot of polish. So I decided to move from 3D models to Unity 2D sprites. It was at this time that I learned there weren’t many PlayMaker actions for Unity 2D. So I made a few.

![ss (2014-06-05 at 09.50.55)](assets/img/ss-2014-06-05-at-09.50.55.png)


Anyway, without an artist, I wasn’t exactly sure what to do. On Reddit, I saw [Kenney (aka Asset Jesus)](http://www.reddit.com/r/gamedev/comments/23cdkn/4690_game_assets_completely_free_to_download_only/) had posted a huge asset pack of free art. The platformer artwork was cute and very Android-ish. I began replacing all my 3D models with sprites.

![NOT A virus](assets/img/NOT-A-virus.jpg)

After that, I added the PlayMaker speech bubbles package. Looks pretty good without much configuration!

![Screenshot_2014-05-18-21-27-00](assets/img/Screenshot_2014-05-18-21-27-00.png)

I also tried to add effects like a fullscreen vignette/noise, but it doesn’t exactly perform well on my tablet. It looks so much nicer, though! I’ve decided to add an options screen to pick and choose effects.

![lRDd9Xh](assets/img/lRDd9Xh.jpg)

![ss (2014-06-05 at 10.00.18)](assets/img/ss-2014-06-05-at-10.00.18.jpg)

Next came the level select screen. I used PlayMaker for the entire thing, which was good and bad at the same time. There are some things you just want to code in C#, but I want this project to be PlayMaker pure.

![ss (2014-06-05 at 09.57.54)](assets/img/ss-2014-06-05-at-09.57.54.png)

A bit bland, right? I plan to add progress stars and whatnot after I get persistent scores. From here on, my polish seems to fall apart again. I also have a Main Menu screen, but it’s just as ugly. However, it’s playable and functional at this point. A solid 60FPS on my tablet, which is quite an accomplishment.

I hope to get more of the polish out of the way before whipping artists to make it sexy. I’m doing it all with free art, and hopefully, I can replace the art with something a bit more fitting. But I want the artist to have an easy time with it, so I’m getting everything set up, including the tweens in place. Hopefully, we can do a find/replace on the art and ship it.

**EDIT:** Included links to PlayMaker post and Kenney’s Reddit post.







