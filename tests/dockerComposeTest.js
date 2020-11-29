const fs = require("fs")
const path = require("path")
const compose = require('docker-compose')




new Promise((resolve, reject) => {
    (async () => {
        try {
            const ip = "172.17.175.136"
            const port = "2375"
            const path = "C:\\TEST_HOME\\danawa\\data\\4\\25"
            let result = {}

            result['down'] = await compose.down({
                cwd: path,
                env: {
                    DOCKER_HOST: `${ip}:${port}`
                }
            })

            // result['upAll'] = await compose.upAll({
            //     cwd: path,
            //     env: {
            //         DOCKER_HOST: `${ip}:${port}`
            //     }
            // })
            //
            // result['ps'] = await compose.ps({
            //     cwd: path,
            //     env: {
            //         DOCKER_HOST: `${ip}:${port}`
            //     },
            //     commandOptions: ["-q"]
            // })

            // const containerIds = result['ps']['out'].split("\n").filter(id => id.length > 0)


            resolve(result)
        } catch(err) {
            reject(err)
        }
    })()
})

