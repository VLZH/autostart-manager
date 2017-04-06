# Autostart manager

Firstly, this package was for me, only for one - enabling easy start https://github.com/brozeph/simple-socks.git

But i note that i sometimes meet the problem of automaticly starting my script on launch of system. And every time I have to create a script in init.d .. register it .. So i am going to add cli functional and support of another init systems

## Installation

```
npm install autostart-manager
```

## Supported init systems
Linux:
* systemd
* upstart

Mac:
* launchd

## ToDo
* add support of systemv, openrc
* fix bugs in launchd, systemd
* cli interface (simple version)
* validation of settings
* method isEnabled
* show message if this script already created/removed with confirm overwriting
* add tests
* more features (Add more settings, add support of windows)

## Example Usage

```javascript
const AutostartManager = require('autostart-manager'),

var manager = new AutostartManager({
    name: 'simple-socks'
})
// Add current script to init system
function enableAutostart(){
    manager.enable()
}

// Remove current script from init system
function disableAutostart(){
    manager.disable()
}
```
## Options
Constructor of the class AutostartManager expected only one argument – settings(object)
Settings:
* name: {string} name of script(required)
* script: {string} path to the script (Default: current script)
* args: {string[]} array of strings, arguments with which the script will be launched
* env: {object} environment variables
* user: {string} name of user (Default: current user)

### PS
Sorry for my English)