const fs = require('fs')
const shelljs = require("shelljs")
const async = require("async")
const chalk = require('chalk')
const debug = require('debug')('AutostartDriver')

class AutostartDriver {
    /**
     * @param {AutostartManager} manager 
     */
    constructor(manager) {
        this.manager = manager
    }
    enable(callback) {
        console.log(chalk.green.bold(`=== enable autostart ===`))
        console.log(chalk.blue(`Init system:`), chalk.red(this.manager.initsys))
        this.writeScriptFile(this.template, this.destination)
        this.runCommands(this.enable_commands, (err) => {
            if (err) callback(err)
            callback(null)
        })
    }
    disable(callback) {
        console.log(chalk.green.bold(`=== disable autostart ===`))
        this.runCommands(this.disable_commands, (err)=>{
            if (err) callback(err)
            callback(null)
        })
        this.removeScriptFile(this.destination)
    }
    writeScriptFile(scriptd, destination) {
        try {
            fs.writeFileSync(destination, scriptd);
        }
        catch (err) {
            console.log(chalk.red.bold(`Error on writing script file to: ${destination}`))
        }
    }
    removeScriptFile(destination) {
        try {
            fs.unlinkSync(destination)
        } catch (err) {
            console.log(chalk.red.bold(`Error on removing file from: ${destination}`))
        }
    }
    /**
     * Run bash commands for register scriptd in init system
     * @param {string[]} commands 
     */
    runCommands(commands, callback) {
        async.forEachLimit(commands, 1, function (command, next) {
            shelljs.exec(command, function (code, stdout, stderr) {
                if (code === 0) {
                    console.log(chalk.blue.bold(`${command} [DONE]`))
                    return next();
                } else {
                    console.log(chalk.red.bold(`${command} [ERROR] Exit code : ${code}`))
                    return next(new Error(command + ' failed, see error above.'));
                }
            })
        }, function (err) {
            if (err) throw err
            callback(err)
        })
    }
    get template() {
        // Throw error about getting template for Meta Class
        return `
        #!/bin/bash

        BIN_PATH=${this.manager.settings.script}
        PID_FILE=/var/run/${this.manager.settings.name}.pid
        #USER=vladimir
        start(){
            echo ${this.manager.settings.start_message}
            start-stop-daemon -Sbmp $PID_FILE --chuid $USER -x $BIN_PATH -- ${this.manager.settings.args.join(" ")}
        }

        stop(){
            echo ${this.manager.settings.stop_message}
            start-stop-daemon -Kp $PID_FILE --chuid $USER
        }
        $1
        `
    }
    printTemplateStart(){
        console.log(chalk.blue(`--- template start ---`))
    }
    printTemplateEnd(){
        console.log(chalk.blue(`--- template end ---`))
    }
    printTemplate(template){
        console.log(chalk.gray(template))
    }
    printDestination(destination){
        console.log(chalk.blue(`Destination: ${destination}`))
    }
}

module.exports = AutostartDriver