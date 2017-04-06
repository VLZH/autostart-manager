const path = require('path')
const chalk = require('chalk')
const AutostartDriver = require('../driver')

class SystemDAutostartDriver extends AutostartDriver {
    get enable_commands() {
        console.log(chalk.blue.bold(`Get enable_commands`))
        return [
        // `chmod +x ${this.destination}`,
        `systemctl enable ${this.manager.settings.name}`,
        `systemctl start ${this.manager.settings.name}`,
        `systemctl daemon-reload`,
        `systemctl status ${this.manager.settings.name}`
      ];
    }
    get disable_commands() {
        return [
        `systemctl stop ${this.manager.settings.name}`,
        `systemctl disable ${this.manager.settings.name}`
      ];
    }
    get destination() {
        let destination = `/etc/systemd/system/${this.manager.settings.name}.service`
        this.printDestination(destination)
        return destination;
    }
    get template() {
        let args = "", template;
        //TODO add enviroment settings
        //Environment=PM2_HOME=%HOME_PATH%
        if (this.manager.settings.script.args && Array.isArray(this.manager.settings.script.args)) {
            args = this.manager.settings.script.args.join(' ')
        }
        template = `
        [Unit]
        Description=${this.manager.settings.description}
        Documentation=${this.manager.settings.documentation_link}
        After=network.target

        [Service]
        Type=forking
        User=${this.manager.settings.user}
        LimitNOFILE=infinity
        LimitNPROC=infinity
        LimitCORE=infinity
        Environment=PATH=${this.manager.settings.node_path}:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
        PIDFile=/var/run/${this.manager.settings.name}.pid

        ExecStart=${this.manager.settings.script} ${args}
        ExecStop= kill -9 $(cat /var/run/${this.manager.settings.name}.pid)

        [Install]
        WantedBy=multi-user.target
        `
        this.printTemplateStart()
        this.printTemplate(template)
        this.printTemplateEnd()
        return template
    }
}

module.exports = SystemDAutostartDriver