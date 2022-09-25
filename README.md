# S.H.E.A.S. - Simple Hardware Editor and Simulator

A prototype of a simple purely graphical hardware editor and simulator for educational purposes, based on [DigitalJS](https://github.com/tilk/digitaljs) computer architecture visualization and simulation library.

### Live Web Page Available [Here](https://sheas.magiwanders.com)

![screenshot](./screenshots/global_screenshot.png)

### Documentation
To have an idea of how S.H.E.A.S. works, see the [getting started tutorial](docs/getting_started.md).

To embed S.H.E.A.S. in a webpage, the suggested way is to import this repo as a submodule and import every ```.js``` file in your code **except ```index.js```**.

Then, use a placeholder div in your HTML:

```html
<div id="sheas_container"></div>
```

For embedding only the visualization and the simulation controls (the ones below it) use:

```javascript
BuildSHEAS('embedded', document.getElementById('sheas_container'), <chip>) 
```

Where ```<chip>``` is a ```string``` of the compressed chip you want to load (the one copied into the clipboard by the "Share only the chip" button).

For embedding the whole of S.H.E.A.S. use:

```javascript
BuildSHEAS('complete', document.getElementById('sheas_container')) 
```
