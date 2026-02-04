---
title: "Christmas Stud Findings"
date: 2016-12-25
categories: [devblog, hardware]
tags: [nodemcu, esp8266, iot, electronics]
description: "Building a DIY stud finder with NodeMCU that sounds like a geiger counter."
---

More NodeMCU magic! A stud finder. It sounds like a geiger counter.

## The Project

Added an antenna to explain electromagnetic waves and interference to my wife. It was fun sticking it to my tongue and pretending it hurts.

## Tech

- NodeMCU chip
- Custom antenna
- Geiger counter-like audio feedback

The ESP8266's analog pin can detect changes in electromagnetic fields when you add an antenna. As you move near metal (like studs behind drywall, or wiring), the readings change. Map those readings to audio frequency and you've got a DIY stud finder that clicks faster near metal - just like a geiger counter!
