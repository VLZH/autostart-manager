const fs = require('fs')
const shelljs = require('shelljs')
const async = require('async')
const chalk = require('chalk')

class AutostartDriver {
    /**
     * @param {AutostartManager} manager 
     */
    constructor(manager) {
        this.manager = manager
    }
    enable(callback) {
        console.log(chalk.green.bold('=== enable autostart ==='))
        this.printInfoAboutInitSystem()
        this.writeScriptFile(this.template, this.destination)
        this.runCommands(this.enable_commands, (err) => {
            if (err) callback(err)
            callback(null)
        })
    }
    disable(callback) {
        console.log(chalk.green.bold('=== disable autostart ==='))
        this.printInfoAboutInitSystem()
        this.runCommands(this.disable_commands, (err) => {
            if (err) callback(err)
            this.removeScriptFile(this.destination)
            callback(null)
        })
    }
    writeScriptFile(scriptd, destination) {
        try {
            fs.writeFileSync(destination, scriptd)
            this.printCreateScriptFile(destination)
        }
        catch (err) {
            this.printErrorCreateScriptFile(destination)
        }
    }
    removeScriptFile(destination) {
        try {
            fs.unlinkSync(destination)
            this.printRemoveScriptFile(destination)
        } catch (err) {
            this.printErrorRemoveScriptFile(destination)
        }
    }
    /**
     * Run bash commands for register scriptd in init system
     * @param {string[]} commands 
     */
    runCommands(commands, callback) {
        async.forEachLimit(commands, 1, (command, next) => {
            shelljs.exec(command, (code, stdout, stderr) => {
                if (code === 0) {
                    this.printSuccessCommand(command)
                    return next()
                } else {
                    this.printErrorCommand(command, code, stdout, stderr)
                    return next(new Error(command + ' failed, see error above.'))
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
    printTemplateStart() {
        console.log(chalk.blue('--- template start ---'))
    }
    printTemplateEnd() {
        console.log(chalk.blue('--- template end ---'))
    }
    printTemplate(template) {
        console.log(chalk.gray(template))
    }
    printDestination(destination) {
        console.log(chalk.blue(`Destination: ${destination}`))
    }
    printSuccessCommand(command) {
        console.log(chalk.blue(`Success command: ${command}`))
    }
    printErrorCommand(command, code, stdout, stderr) {
        console.log(chalk.red(`Failure command: ${command} Exit code : ${code}`))
    }
    printInfoAboutInitSystem(){
        console.log(chalk.blue('Init system:'), chalk.red(this.manager.initsys))
    }
    //Remove file
    printRemoveScriptFile(destination){
        console.log(chalk.blue(`Remove script file: ${destination}`))
    }
    printErrorRemoveScriptFile(destination){
        console.log(chalk.red(`Error on removing file from: ${destination}`))
    }
    //Create file
    printCreateScriptFile(destination){
        console.log(chalk.blue(`Create script file: ${destination}`))
    }
    printErrorCreateScriptFile(destination){
        console.log(chalk.red(`Error on writing script file to: ${destination}`))
    }
}

module.exports = AutostartDriver