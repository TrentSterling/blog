---
title: "MQTT IoT Experiments"
date: 2016-12-30
categories: [devblog, hardware]
tags: [ESP8266, IoT, JavaScript, NodeMCU, espruino, mqtt]
description: "ESP8266/MQTT experiments with WiFi, HTTP servers, network scanning, and doorbell notifications."
---

Yo dawg, want some code?

IoT experiments with MQTT protocol, NodeMCU/ESP8266, and Espruino JavaScript.

## Features Demonstrated

- WiFi connectivity with ESP8266
- HTTP server on microcontroller
- Network scanning functionality
- MQTT broker connection
- Doorbell notification system
- Time synchronization via HTTP

## The Code

```javascript
/**
 * The `main` function gets executed when the board is initialized.
 * Development: npm run dev
 * Production: npm run deploy
 */
function main()
{
    // See http://www.espruino.com/ESP8266_WifiUsage
    // And http://www.espruino.com/Reference#Wifi
    var wifi = require("Wifi");
    // See http://www.espruino.com/Reference#http
    var http = require("http");

    /**
     * Simple HTML tag generator
     *
     * @param {string} tag - The HTML tag name e.g. p, div or html
     * @param {string|Array<string>} content - Content of the tag, a string or array of strings
     * @returns {string} - A string of HTML
     */
    function htm(tag, content)
    {
        if (Array.isArray(content)) content = content.join("");
        return "<" + tag + ">" + content + "</" + tag + ">";
    }

    /**
     * Generates a table to display wireless APs SSIDs and channels
     *
     * @param {Array<object>} networks - An array of APs objects
     * @returns
     */
    function generateTableForAPs(networks)
    {
        var tableHeader = htm("tr", [htm("th", "SSID"), htm("th", "rssi")]);
        var rows = networks.map(function(network)
        {
            return htm("tr", [htm("td", network.ssid), htm("td", network.rssi)]);
        });
        rows.unshift(tableHeader);
        return htm("table", rows);
    }

    /**
     * Generates a simple HTML page
     *
     * @param {string} title - The title of the page, also the H1
     * @param {string|Array<string>} content - Content of the page
     * @returns
     */
    function generatePage(title, content)
    {
        return htm("html", [
            htm("head", [htm("title", title), htm("style", "th,td {width:100px;border:1px solid #000;}")]),
            htm("body", [htm("h1", title), content])
        ]);
    }

    /**
     * Handles all requests for the simple HTTP server
     *
     * @param {any} request - Incomming request
     * @param {any} response - Response to client
     */
    function handleRequest(request, response)
    {
        response.writeHead(200, {'Content-Type': 'text/html'});

        if (request.url == "/doorbell")
        {
            var time = new Date();
            console.log("======\n\nDOORBELL: " + time.toUTCString());
            response.end(generatePage("Doorbell", htm("p", "The doorbell is ringing at " + time.toUTCString())));
        }
        else
        {
            console.log("request: " + request.url);
            wifi.scan(function(networks)
            {
                response.end(generatePage("Networks", generateTableForAPs(networks)));
            });
        }
    }

    /**
     * Handles the connection for the wifi.connect call.
     *
     * @param {Error} err
     */
    function onConnect(err)
    {
        if (err)
        {
            console.log("err: ", err.message);
        }
        else
        {
            console.log("wifigood");
            http.createServer(handleRequest).listen(80);
            console.log("webservergood");

            // Time sync
            var timeS;
            http.get("http://www.timeapi.org/utc/7+hours+ago?\\s", function(res)
            {
                res.on('data', function(data) { timeS = Number(data); });
                res.on('close', function(data)
                {
                    setTime(timeS);
                    console.log("timegood");
                });
            });

            // MQTT setup
            var server = "192.168.2.2";
            var mqtt = require("MQTT").create(server);
            console.log("MQTTstart " + mqtt);
            mqtt.connect();

            mqtt.on('connected', function()
            {
                mqtt.subscribe("message");
                console.log("brokergood");
                mqtt.publish("message", "hello, world");
            });
        }
    }

    wifi.setHostname("Doorbell");
    wifi.connect("your_ssid", {password: "your_password"}, onConnect);
}
```

## Tech Stack

- **Espruino** (JavaScript for microcontrollers)
- **NodeMCU/ESP8266** hardware
- **MQTT** messaging protocol
- Custom HTTP server
- WiFi module
