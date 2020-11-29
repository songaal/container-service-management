import ServerService from "./ServerService"
const { Sequelize, sequelize, Services, Variable} = require("../models")
import FileUtil from "../utils/FileUtil"
import DockerClient from "../utils/DockerClient"

const dockerDefaultPort = 2375

export default {
    async findServiceById(id) {
        const regService = await Services.findOne({
            where: { id }
        })

        const variables = await Variable.findAll({
            where: {serviceId: id}
        })

        return {
            ...regService.dataValues,
            variables: variables.filter(variable => variable['type'] === 'container'),
            logFiles: variables.filter(variable => variable['type'] === 'process')
        }
    },
    async findServiceByGroupId(groupId) {
        return await Services.findAll({
            where: { groupId },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT name
                              FROM servers a
                             WHERE a.id = service.serverId
                        )`),
                        "server_name"
                    ]
                ]
            }
        })
    },
    async addService(groupId, reqService) {
        let service = {}
        let regServer = {}
        try {
            regServer = await Services.create({
                name: reqService['name'], groupId,
                serverId: reqService['server'],
                type: reqService['type'],
                yaml: reqService['type'] === 'container' ? reqService['yaml'] : "",
                pidCmd: reqService['type'] === 'process' ? reqService['pidCmd'] : "",
                startScript: reqService['type'] === 'process' ? reqService['startScript'] : "",
                stopScript:  reqService['type'] === 'process' ? reqService['stopScript'] : "",
            })
            service = regServer['dataValues']
            service['variables'] = []
            service['logFiles'] = []

            const id = String(regServer['dataValues']['id'])
            const type = reqService['type']
            const variables = type === 'container' ? reqService['variables'] : reqService['logFiles']
            const yaml = reqService['yaml'];

            await Variable.destroy({ where: { serviceId: id } })
            await this.appendVariables({serviceId: id, type: type, variables: variables})

            const dockerComposeServicePath = await FileUtil.getDockerComposeServicePath({
                groupId: groupId,
                serviceId: id
            })
            await FileUtil.cleanDockerComposeFile(dockerComposeServicePath)

            if (type === 'container') {
                await FileUtil.writeDockerCompose({dockerComposeServicePath, yaml, variables})
            } else if (type === 'process') {
                // TODO 프로세스 처리 필요시 사용.
            }
        } catch (err) {
            console.error(err)
            if (regServer['id']) {
                await Services.destroy({where: { id: regServer['id']}})
                await Variable.destroy({ where: { serviceId: id } })
            }

            throw err
        }
        return service;
    },
    async editService(id, reqService) {
        await Services.update({
            name: reqService['name'],
            serverId: reqService['server'],
            type: reqService['type'],
            yaml: reqService['type'] === 'container' ? reqService['yaml'] : "",
            pidCmd: reqService['type'] === 'process' ? reqService['pidCmd'] : "",
            startScript: reqService['type'] === 'process' ? reqService['startScript'] : "",
            stopScript:  reqService['type'] === 'process' ? reqService['stopScript'] : "",
        }, {
            where: { id }
        })
        const variables = reqService['type'] === 'container' ? reqService['variables'] : reqService['logFiles']
        const yaml = reqService['yaml'];

        await Variable.destroy({ where: { serviceId: id } })
        await this.appendVariables({serviceId: id, type: reqService['type'], variables: variables})


        const regService = await this.findServiceById(id)
        const groupId = regService['groupId']
        const type = reqService['type']

        const dockerComposeServicePath = await FileUtil.getDockerComposeServicePath({groupId: groupId, serviceId: id})
        await FileUtil.cleanDockerComposeFile(dockerComposeServicePath)

        if (type === 'container') {
            await FileUtil.writeDockerCompose({dockerComposeServicePath, yaml, variables})
        } else if (type === 'process') {
            // TODO 프로세스 처리 필요시 사용.
        }

        return {
            ...reqService
        }
    },
    async appendVariables({serviceId, type, variables}){
        let tmp = []
        const variableSize = variables.length
        for (let i = 0; i < variableSize; i++) {
            tmp.push((await Variable.create({
                serviceId: serviceId,
                key: variables[i]['key'],
                value: variables[i]['value'],
                type: type,
            }))['dataValues'])
        }
        return tmp
    },
    async removeService(groupId, serviceId) {
        const regService = await this.findServiceById(serviceId)

        const dockerComposeFilePath = await FileUtil.getDockerComposeServicePath({
            groupId: groupId,
            serviceId: serviceId
        })
        await FileUtil.cleanDockerComposeFile(dockerComposeFilePath)

        await Variable.destroy({ where: { serviceId: serviceId } })
        await Services.destroy({ where: { id: serviceId } })
        return regService
    },
    async getState(groupId, serviceId) {
        let result = {}
        const service = await this.findServiceById(serviceId)

        if (!service['serverId'] || Number(service['serverId']) < 0) {
            return result
        }
        const server = await ServerService.findServerById(service['serverId'])

        if(service['type'] === 'container') {
            result['type'] = "container"
            result['services'] = await FileUtil.getServiceNameList({groupId, serviceId})
            const ip = server['dataValues']['ip']
            const port = server['dataValues']['dockerPort']
            const servicePath = await FileUtil.getDockerComposeServicePath({groupId, serviceId})
            const dockerClient = new DockerClient(ip, port||dockerDefaultPort, servicePath)
            const containerIds = await dockerClient.getContainerIds()

            let containerInfoList = []
            for (let i = 0; i < containerIds.length; i++) {
                try {
                    containerInfoList.push({
                        id: containerIds[i],
                        inspect: await dockerClient.inspect(containerIds[i].substring(0, 12)),
                        stats: await dockerClient.stats(containerIds[i].substring(0, 12))
                    })
                } catch(err) {
                    containerInfoList.push({
                        id: containerIds[i],
                        error: err
                    })
                }
            }
            result['containers'] = containerInfoList
        } else if (service['type'] === 'process') {
            result['type'] = "process"
            console.log("container")
        }
        return result
    },
    async startServices(groupId, serviceId) {
        let result = {}
        const service = await this.findServiceById(serviceId)

        if (!service['serverId'] || Number(service['serverId']) < 0) {
            return result
        }
        const server = await ServerService.findServerById(service['serverId'])

        if(service['type'] === 'container') {
            const ip = server['dataValues']['ip']
            const port = server['dataValues']['dockerPort']
            const servicePath = await FileUtil.getDockerComposeServicePath({groupId, serviceId})
            const dockerClient = new DockerClient(ip, port||dockerDefaultPort, servicePath)
            result = await dockerClient.dockerCompose("upAll")
        } else if (service['type'] === 'process') {

        }
    },
    async stopServices(groupId, serviceId) {
        let result = {}
        const service = await this.findServiceById(serviceId)

        if (!service['serverId'] || Number(service['serverId']) < 0) {
            return result
        }
        const server = await ServerService.findServerById(service['serverId'])

        if(service['type'] === 'container') {
            const ip = server['dataValues']['ip']
            const port = server['dataValues']['dockerPort']
            const servicePath = await FileUtil.getDockerComposeServicePath({groupId, serviceId})
            const dockerClient = new DockerClient(ip, port||dockerDefaultPort, servicePath)
            result = await dockerClient.dockerCompose("down")
        } else if (service['type'] === 'process') {

        }
    },
    async updateServices(groupId, serviceId) {
        let result = {}
        const service = await this.findServiceById(serviceId)

        if (!service['serverId'] || Number(service['serverId']) < 0) {
            return result
        }
        const server = await ServerService.findServerById(service['serverId'])

        if(service['type'] === 'container') {
            const ip = server['dataValues']['ip']
            const port = server['dataValues']['dockerPort']
            const servicePath = await FileUtil.getDockerComposeServicePath({groupId, serviceId})
            const dockerClient = new DockerClient(ip, port||dockerDefaultPort, servicePath)
            result['pullAll'] = await dockerClient.dockerCompose("pullAll")
            result['down'] = await dockerClient.dockerCompose("down")
            result['upAll'] = await dockerClient.dockerCompose("upAll")
        } else if (service['type'] === 'process') {

        }
    },
}