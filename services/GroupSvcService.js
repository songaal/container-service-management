const { Sequelize, sequelize, Services, Variable} = require("../models")


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
        if (reqService['type'] === 'container') {
            const variableSize = reqService['variables'].length
            for (let i = 0; i < variableSize; i++) {
                service['variables'].push((await Variable.create({
                    serviceId: id,
                    key: reqService['variables'][i]['key'],
                    value: reqService['variables'][i]['value'],
                    type: reqService['type'],
                }))['dataValues'])
            }
        }
        if (reqService['type'] === 'process') {
            const logFileSize = reqService['logFiles'].length
            for (let i = 0; i < logFileSize; i++) {
                service['logFiles'].push((await Variable.create({
                    serviceId: id,
                    key: reqService['logFiles'][i]['key'],
                    value: reqService['logFiles'][i]['value'],
                    type: reqService['type'],
                }))['dataValues'])
            }
        }
        return service;
    },
    async editService(id, reqService) {
        let service = {}

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

        service['variables'] = []
        service['logFiles'] = []

        await Variable.destroy({ where: { serviceId: id } })

        if (reqService['type'] === 'container') {
            const variableSize = reqService['variables'].length
            for (let i = 0; i < variableSize; i++) {
                service['variables'].push((await Variable.create({
                    serviceId: id,
                    key: reqService['variables'][i]['key'],
                    value: reqService['variables'][i]['value'],
                    type: reqService['type'],
                }))['dataValues'])
            }
        }
        if (reqService['type'] === 'process') {
            const logFileSize = reqService['logFiles'].length
            for (let i = 0; i < logFileSize; i++) {
                service['logFiles'].push((await Variable.create({
                    serviceId: id,
                    key: reqService['logFiles'][i]['key'],
                    value: reqService['logFiles'][i]['value'],
                    type: reqService['type'],
                }))['dataValues'])
            }
        }

        return {
            ...service,
            ...reqService
        };
    }
}