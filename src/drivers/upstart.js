const path = require('path')
const chalk = require('chalk')
const AutostartDriver = require('../driver')

class UpstartAutostartDriver extends AutostartDriver {
    get enable_commands() {
        console.log(chalk.blue(`Get enable_commands`))
        return [
            `chmod +x ${this.destination}`,
            'mkdir -p /var/lock/subsys',
            `touch /var/lock/subsys/${this.manager.settings.name}`,
            `update-rc.d ${this.manager.settings.name} defaults`
        ];
    }
    get disable_commands() {
        return [
            `update-rc.d ${this.manager.settings.name} disable`,
            `update-rc.d -f ${this.manager.settings.name} remove`
        ];
    }
    get destination() {
        let destination = `/etc/init.d/${this.manager.settings.name}`
        this.printDestination(destination)
        return destination;
    }
    get template() {
        let template;
        template = `
        #!/bin/bash

        BIN_PATH=${this.manager.settings.script}
        PID_FILE=/var/run/${this.manager.settings.name}.pid
        #USER=vladimir
        start(){
            echo ${this.manager.settings.start_message}
            start-stop-daemon -Sbmp $PID_FILE --chuid ${this.manager.settings.user} -x $BIN_PATH -- ${this.manager.settings.args.join(" ")}
        }

        stop(){
            echo ${this.manager.settings.stop_message}
            start-stop-daemon -Kp $PID_FILE --chuid ${this.manager.settings.user}
        }
        $1
        `
        this.printTemplateStart()
        this.printTemplate(template)
        this.printTemplateEnd()
        return template
    }
}

module.exports = UpstartAutostartDriver