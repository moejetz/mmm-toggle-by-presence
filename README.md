# mmm-toggle-by-presence

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).


## Short description
Checks the values from a I²C proximity sensor (presence detection) and shows/hides the complete HTML body.
Aditionally, there are methods in the node_helper.js to toggle the HDMI output of the RPI, to be able to completely shut down the HDMI monitor to save power.


## Screenshot
Unfortunately there is no module screenshot because the module itself has no UI element.
All this module does is showing/hiding the body tag and managing the HDMI power states.

## External APIs
none.

## Current development Status
WIP.

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'mmm-toggle-by-presence',
            position: 'fullscreen_below',
            config: {
                "updateInterval": 500,
                "detectionTimeout": 10000
            }
        }
    ]
}
```

## Configuration options

| Option | Required | Description | Type | Default
| ------ | -------- | ----------- | ---- | -------
| `updateInterval` | Optional | Update interval for presence detection | _int_ (ms) | 500
| `detectionTimeout` | Optional | Mirror will be turned off if no detection in this timespan | _int_ (ms) | 10000


# License: MIT

The MIT License (MIT)

Copyright (c) 2019

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
