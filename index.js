(async()=>{
    "use strict";

    // Dependencies
    const gradientString = require("gradient-string")
    const { runJobs } = require("parallel-park")
    const shellJS = require("shelljs")
    const chalk = require("chalk")
    const fs = require("fs")
    
    // Variables
    const inFiles = fs.readdirSync("./in")
    const outFiles = fs.readdirSync("./out")

    var art3mist = {}

    // Functions
    art3mist.log = function(type, message){
        if(type === "i"){
            console.log(`[${chalk.blueBright("^")}] ${message}`)
        }else if(type === "e"){
            console.log(`[${chalk.redBright("^")}] ${message}`)
        }
    }
    
    // Main
    console.log(gradientString.summer(`
    ▄▄▄       ██▀███  ▄▄▄█████▓ ███▄ ▄███▓ ██▓  ██████ ▄▄▄█████▓
    ▒████▄    ▓██ ▒ ██▒▓  ██▒ ▓▒▓██▒▀█▀ ██▒▓██▒▒██    ▒ ▓  ██▒ ▓▒
    ▒██  ▀█▄  ▓██ ░▄█ ▒▒ ▓██░ ▒░▓██    ▓██░▒██▒░ ▓██▄   ▒ ▓██░ ▒░
    ░██▄▄▄▄██ ▒██▀▀█▄  ░ ▓██▓ ░ ▒██    ▒██ ░██░  ▒   ██▒░ ▓██▓ ░ 
     ▓█   ▓██▒░██▓ ▒██▒  ▒██▒ ░ ▒██▒   ░██▒░██░▒██████▒▒  ▒██▒ ░ 
     ▒▒   ▓▒█░░ ▒▓ ░▒▓░  ▒ ░░   ░ ▒░   ░  ░░▓  ▒ ▒▓▒ ▒ ░  ▒ ░░   
      ▒   ▒▒ ░  ░▒ ░ ▒░    ░    ░  ░      ░ ▒ ░░ ░▒  ░ ░    ░    
      ░   ▒     ░░   ░   ░      ░      ░    ▒ ░░  ░  ░    ░      
          ░  ░   ░                     ░    ░        ░            `))

    if(!inFiles.length) return  art3mist.log("e", "No files found in in directory.")
    
    art3mist.log("i", `${inFiles.length} files found.`)
    art3mist.log("i", "Cleaning files, please wait...")

    for( const file of outFiles ) fs.rmSync(`./out/${file}`)
    
    await runJobs(
        inFiles,
        async(file)=>{
            art3mist.log("i", `Cleaning ${file}`)

            const result = shellJS.exec(`utils\\docbleach\\cli -in "./in/${file}" -out "./out/${file.replace(".pdf", "")} - Cleaned using Art3mist.pdf"`, { silent: true }).stderr
            var threatsFound = result.match(/\d+ potential/)

            if(threatsFound){
                threatsFound = threatsFound[0].replace(" potential", "")

                art3mist.log("i", `${threatsFound} potential threats found & removed in ${file}`)
            }else{
                art3mist.log("i", `No potential threats found in ${file} but clean anyway.`)
            }

            var data = fs.readFileSync(`./out/${file.replace(".pdf", "")} - Cleaned using Art3mist.pdf`, "utf8")
            const ips = data.match(/\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b/g)
            const links = data.match(/((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/g)

            if(ips){
                data = data.replace(/\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b/g, "")
                art3mist.log("i", `${ips.length} ips found & removed.`)
            }

            if(links){
                data = data.replace(/((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/g, "")
                art3mist.log("i", `${links.length} links found & removed.`)
            }

            fs.writeFileSync(`./out/${file.replace(".pdf", "")} - Cleaned using Art3mist.pdf`, data, "utf8")
        },
        {
            concurrency: 35
        }
    )

    art3mist.log("i", "Finished.")
})()