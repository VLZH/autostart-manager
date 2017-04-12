const path = require('path')
const chalk = require('chalk')
const AutostartDriver = require('../driver')

class LaunchDAutostartDriver extends AutostartDriver {
    get enable_commands() {
        console.log(chalk.blue.bold('Getting enable_commands'))
        return [
            `launchctl load -w ${this.destination}`
        ]
    }
    get disable_commands() {
        return [
            `launchctl remove ${this.destination}`
        ]
    }
    get destination() {
        let destination = path.join(this.manager.settings.user_home, `Library/LaunchAgents/com.${this.manager.settings.name}.plist`)
        this.printDestination(destination)
        return destination
    }
    get template() {
        let args = '', template
        if (this.manager.settings.script.args && Array.isArray(this.manager.settings.script.args)) {
            args = this.manager.settings.script.args.reduce((prev, curr) => {
                return prev + `<string>${curr}</string>`
            }, '')
        }
        template = `
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
        <dict>
            <key>Label</key>
            <string>com.${this.manager.settings.name}</string>
            <key>UserName</key>
            <string>${this.manager.settings.user}</string>
            <key>KeepAlive</key>
            <true/>
            <key>ProgramArguments</key>
            <array>
                <string>${this.manager.settings.script}</string>
                ${args}
            </array>
            <key>RunAtLoad</key>
            <true/>
            <key>OnDemand</key>
            <false/>
            <key>LaunchOnlyOnce</key>
            <true/>
            <key>EnvironmentVariables</key>
            <dict>
                <key>PATH</key>
                <string>${this.manager.settings.node_path}</string>
            </dict>
        </dict>
        </plist>
        `
        this.printTemplateStart()
        this.printTemplate(template)
        this.printTemplateEnd()
        return template
    }
}

module.exports = LaunchDAutostartDriver