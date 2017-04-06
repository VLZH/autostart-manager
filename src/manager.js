const shelljs = require("shelljs")
const path = require("path")
const debug = require("debug")('AutostartManager')

const INIT_SYSTEMS = {
    'systemctl': 'systemd',
    'update-rc.d': 'upstart',
    'chkconfig': 'systemv',
    'rc-update': 'openrc',
    'launchctl': 'launchd'
};

const REQUIRED_SETTINGS = ['name']

class AutostartManager {
    constructor(settings) {
        if (typeof settings !== 'object') throw new Error(`required argument settings is not object`)
        for (let req_item of REQUIRED_SETTINGS) {
            if (!Object.keys(settings).includes(req_item)) {
                throw new Error(`Not defined required setting: ${req_item}`)
            }
        }

        let default_settings = {
            name: settings.name,
            script: process.argv[1],
            args: [],
            env: [],
            user: process.env.USER,
            user_home: process.env.HOME,
            start_message: "Script is running",
            stop_message: "Script is stopped",
            node_path: path.dirname(process.execPath),
            description: settings.name,
            documentation_link: ''
        }
        this.settings = Object.assign(default_settings, settings)
        this.initsys = this.detectInitSystem()
        // this.platform = this.detectPlatform()
        this.driver = this.getInitSystemDriver()
    }
    detectInitSystem() {
        for (var command_for_check in INIT_SYSTEMS) {
            if (shelljs.which(command_for_check) != null) {
                debug(`Init System: ${INIT_SYSTEMS[command_for_check]}`)
                return INIT_SYSTEMS[command_for_check]
            }
        }
        // if nothing was be returned that mean init system on this system is undefined
        debug("Error Undefined Init System")
    }
    /**
     * @return {AutostartDriver} driver
     */
    getInitSystemDriver() {
        let DriverCls = require(`./drivers/${this.initsys}`)
        return new DriverCls(this)
    }
    /**
     * Enable autostart on launch of system defined by your script
     */
    enable() {
        this.driver.enable((err)=>{
            debugger;
        })
    }
    disable() {
        this.driver.disable((err) => {
            debugger;
        })
    }
    isEnable() {
        return new Promise((resolve, reject) => {

        })
    }
}

function getDateStr() {
    let d = new Date()
    return `${d.getFullYear()}_${d.getMonth()}_${d.getDay()}_${d.getHours()}_${d.getMinutes()}`
}

module.exports = AutostartManager