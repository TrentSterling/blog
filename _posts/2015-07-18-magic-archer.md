---
title: "Multiplayer Magic Archer"
date: 2014-11-18 # Date of vlog recording/post
categories: [DevBlog, Projects]
tags: [Unity, Multiplayer, Platformer, GameDev, Twitch, Devlog, NGUI, Unity4, 12Games12Weeks]
description: "A devlog discussing the early development of a multiplayer platformer in Unity 4, the impact of Twitch streaming, the '12 Games in 12 Weeks' challenge, and challenges with UI systems and engine updates."
image: "/assets/img/2014-11-18_22-39-28.png" # Using an image from the vlog/post
---

<iframe class="responsive-embed" src="//www.youtube.com/embed/IP3tRx5HkTg" frameborder="0" allowfullscreen></iframe>

> I've detailed the development text a bit more in 2025, integrating details from the original Week 1 blog post and the vlog itself.
{: .prompt-tip }

---

This post looks back at 'Multiplayer Magic Archer' (which never really got a proper name!), the game that essentially started my Twitch channel back in late 2014. It began as the first entry in a '12 Games in 12 Weeks' challenge I attempted. Game dev is hard, scheduling is hard, finishing stuff is hard, and this project definitely hit some bumps! The video embedded above is the original vlog discussing the progress and challenges after about 11 days.

## What Went Right? The Twitch Boom!

The biggest success was starting to stream daily development on Twitch ([http://www.twitch.tv/trent_sterling](http://www.twitch.tv/trent_sterling)).
*   **Unexpected Growth:** Despite poor stream quality due to my internet speed, the experience was great. I gained **71 followers in the first week** alone, and eventually hit 97 followers and 1,500 views within about 10 days.
*   **Multiplayer Focus:** A huge part of the interest seemed to stem from turning this initially local co-op game into a **networked multiplayer** one. People kept requesting it, so I dove in!
*   **Live Testing & Engagement:** We had peak concurrent viewers around 30-38, and at times had 10+ people jumping into the server simultaneously to test and just screw around. It was really cool and fun. The interaction drove a lot of the feature additions.
*   **Viewer-Driven Features:** Added a ton of stuff based on viewer feedback:
    *   Fancy lighting.
    *   Robust networking (prediction, interpolation, handling lag smoothly).
    *   Settings window to change player name and clothing color (synced over network).
    *   Plans for an in-game level editor (editable while playing).
*   **Dedicated Server:** Had a server running 24/7, allowing people to jump in and test.

![Early Multiplayer Screenshot](/assets/img/2014-11-06_20-45-01.png)

![Testing with Viewers](/assets/img/2014-11-07_16-59-18.png)

## Challenges / What Went Wrong

Of course, it wasn't all smooth sailing:
*   **Multiplayer Scope Creep:** Adding multiplayer took about 4 days initially, immediately putting the 12-week challenge schedule in jeopardy.
*   **Unity 4.6 Beta Disaster:** Ignoring the beta warnings for the lovely new 4.6 UI system bit me hard. **I SHOULD HAVE LISTENED!** A web player update broke *everything* built with the 4.6 beta UI. My Bacon Jam entry, "Super Turbo Ship Puncher 3", became totally busted everywhere it was hosted.
*   **Painful Downgrade:** Downgrading projects from 4.6 beta wasn't clean – scenes were lost, though prefabs/scripts remained. Fixing the Archer game after downgrading back to Unity 4.5 took an entire day. This also meant switching from the broken 4.6 UI to NGUI.
*   **NGUI Limitations:** NGUI had nice features (like colored chat text!) and decent skins, but its event system felt like a step back from 4.6's potential. A key frustration was the inability to pass arguments to button click handlers easily.
*   **The 12-Week Challenge Dilemma:** By day 8-11, I was way behind schedule for the challenge but had a project viewers were actively enjoying and participating in. A poll asking viewers whether to stick with this game or move on resulted in a tie! I ultimately decided to continue with the multiplayer archer game as long as the viewers were engaged, effectively pausing the strict challenge rules.

![First Week Banner](/assets/img/MFpRLkW.png)

![More Gameplay Screenshot](/assets/img/2014-11-11_00-19-25.png)

## Development Process & Code Quality

This project's development was uniquely shaped by the live stream:
*   **Community Driven:** There wasn't a formal GDD or even a consistent to-do list. Feature priority was often decided by asking the chat, "What should we build next?".
*   **Code Quality Warning:** This naturally led to... "jam code". It functioned, but the architecture, organization, and naming conventions were often messy and reactive. *Seriously, don't use this code as a learning example for best practices!* You might pick up some Unity API usage, but the overall structure is not something to emulate. (Consider this the official disclaimer!)

![Screenshot](/assets/img/2014-11-11_22-10-47.png)

![Screenshot](/assets/img/2014-11-11_22-11-14.png)

![Screenshot](/assets/img/2014-11-12_16-30-51.png)

![Screenshot](/assets/img/2014-11-12_16-38-55.png)

![Screenshot](/assets/img/2014-11-12_16-47-51.png)

![Screenshot](/assets/img/2014-11-12_22-07-40.png)

![Screenshot](/assets/img/2014-11-12_22-07-54.png)

![Screenshot](/assets/img/2014-11-12_23-26-59.jpg)

## Status & Future (as of late 2014 / early 2015)

*   **Playable Build:** For a long time, a playable web build was available via Dropbox and linked on stream/posts. (Note: The original Dropbox link [https://dl.dropboxusercontent.com/u/185467974/Games/CoopPlatformer/CoopPlatformerWebBuild/CoopPlatformerWebBuild.html](https://dl.dropboxusercontent.com/u/185467974/Games/CoopPlatformer/CoopPlatformerWebBuild/CoopPlatformerWebBuild.html) is now dead).
*   **Streaming:** I was streaming dev work for about 6 hours out of a 12-hour dev day back then.
*   **YouTube:** Shifted focus on YouTube from raw VODs to edited weekly vlogs like the one this post is based on.
*   **Project Goal:** Despite the messy code and challenge deviation, this multiplayer archer game was the project I really wanted to make my mark with at the time.
*   **The End:** Ultimately, as noted in the original blog post, Unity 5 breaking changes were the final nail in the coffin for this specific iteration of the project. It's been shelved ever since.

---

Thanks for reading this look back! It was a wild time learning Unity multiplayer and engaging with a live audience during development.

---
{% comment %}
Devlog about Multiplayer Magic Archer, incorporating details from Week 1 post.
#Author: TrentSterling
{% endcomment %}