const { Sequelize, sequelize, Services, Variable} = require("../models")
import DockerComposeService from "./DockerComposeService";

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
        const regServer = await Services.create({
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

        const dockerComposeFilePath = await DockerComposeService.getDockerComposeFilePath({serverId: reqService['server'], groupId, serviceId: id})
        await DockerComposeService.cleanDockerComposeFile(dockerComposeFilePath)

        if (type === 'container') {
            await DockerComposeService.writeDockerCompose({dockerComposeFilePath, yaml, variables})
        } else if (type === 'process') {
            // TODO 프로세스 처리 필요시 사용.
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
        const serverId = regService['serverId']
        const groupId = regService['groupId']
        const type = reqService['type']

        const dockerComposeFilePath = await DockerComposeService.getDockerComposeFilePath({serverId: serverId, groupId, serviceId: id})
        await DockerComposeService.cleanDockerComposeFile(dockerComposeFilePath)

        if (type === 'container') {
            await DockerComposeService.writeDockerCompose({dockerComposeFilePath, yaml, variables})
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
    async removeService(id) {
        const regService = await this.findServiceById(id)
        const serverId = regService['dataValues']['serverId']
        const groupId = regService['dataValues']['groupId']

        const dockerComposeFilePath = await DockerComposeService.getDockerComposeFilePath({serverId: serverId, groupId, serviceId: id})
        await DockerComposeService.cleanDockerComposeFile(dockerComposeFilePath)

        await Variable.destroy({ where: { serviceId: id } })
        await Services.destroy({ where: { serviceId: id } })
        return regService
    }
}