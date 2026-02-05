---
title: "Christmas Stud Findings"
date: 2016-12-25
categories: [devblog, hardware]
tags: [ESP8266, Electronics, IoT, NodeMCU]
description: "Building a DIY stud finder with NodeMCU that sounds like a geiger counter."
image: "/assets/img/tongue.jpg"
---

More NodeMCU magic! A stud finder. It sounds like a geiger counter. I added an antenna to explain electromagnetic waves / interference to my wife. It was fun sticking it to my tongue and pretending it hurts.

[![NodeMCU Stud Finder](/assets/img/tongue.jpg)](/assets/img/tongue.jpg)

Read more to see code snippets and whatnot.

Well you must be a curious type. Here ya go.

```javascript
let isOn = false;
const interval = 0;
var count = 0;

function main()
{
    function toggleLights()
    {
        isOn = !isOn;
        digitalWrite(D2, isOn);
        digitalWrite(D3, isOn);
        digitalWrite(D4, isOn);
    }

    setInterval(() =>
    {
        count++;

        analogInput = Math.round(analogRead() * 10000);
        if (count > 200)
        {
            count = 0;
            console.log(analogInput);
        }

        if (analogInput > 100)
        {
            isOn = false;
        }
        else
        {
            isOn = true;
        }
        digitalWrite(D2, isOn);
        digitalWrite(D3, isOn);
        digitalWrite(D4, isOn);

    }, interval);
}
```

It's not very good, but we aren't super advanced yet.
