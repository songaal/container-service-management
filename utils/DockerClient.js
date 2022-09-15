// const compose = require('docker-compose')
const compose = require('./docker-compose')
const axios = require('axios');
// const Docker = require('dockerode')

const _exec = async ({cmd, ip, port, path, log=false, commandOptions, composeOptions}) => {
    return await compose[cmd]({
        cwd: path,
        log: log,
        commandOptions: commandOptions,
        composeOptions: composeOptions,
        env: { DOCKER_HOST: `${ip}:${port}` }
    })
}

class DockerClient {
    constructor(ip, port, composePath) {
        this.ip = ip
        this.port = port
        this.composePath = composePath
    }
    async getContainerIds() {
        let result = await this.dockerCompose("ps", {commandOptions: ["-q"]})
        if (result['exitCode'] === 0) {
            return result['out'].split("\n").filter(id => id.length > 0)
        } else {
            return []
        }
    }
    async inspect(containerId) {
        let result = await axios.get(`http://${this.ip}:${this.port}/containers/${containerId}/json`, this.config );
        return result['data']
    }
    async stats(containerId) {
        let result = await axios.get(`http://${this.ip}:${this.port}/containers/${containerId}/stats?stream=false`, this.config);
        return result['data']
    }
    // async inspect(containerId) {
    //     const docker = new Docker({host: this.ip, port: this.port});
    //     const container = docker.getContainer(containerId);
    //     return new Promise((resolve, reject) => {
    //         container.inspect((err, data) => {
    //             if (err) reject(err)
    //             resolve(data)
    //         })
    //     })
    // }
    // async stats(containerId) {
    //     const docker = new Docker({host: this.ip, port: this.port});
    //     const container = docker.getContainer(containerId);
    //     return new Promise((resolve, reject) => {
    //         container.stats({stream: false}, (err, data) => {
    //             if (err) reject(err)
    //             resolve(data)
    //         })
    //     })
    // }
    async dockerCompose(cmd, {log, commandOptions, composeOptions}={}) {
        if(!cmd) {
            return {}
        }
        return await _exec({
            ip: this.ip,
            port: this.port,
            path: this.composePath,
            cmd: cmd,
            log: log||false,
            commandOptions: commandOptions,
            composeOptions: composeOptions
        })
    }
}



export default DockerClient