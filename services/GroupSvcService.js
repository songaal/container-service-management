const { Sequelize, sequelize, Services, Variable} = require("../models")


export default {
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
        let server = {}
        const regServer = await Services.create({
            name: reqService['name'], groupId,
            serverId: reqService['server'],
            type: reqService['type'],
            yaml: reqService['type'] === 'container' ? reqService['yaml'] : "",
            pidCmd: reqService['type'] === 'process' ? reqService['pidCmd'] : "",
            startScript: reqService['type'] === 'process' ? reqService['startScript'] : "",
            stopScript:  reqService['type'] === 'process' ? reqService['stopScript'] : "",
        })
        server = regServer['dataValues']
        server['variables'] = []
        server['logFiles'] = []

        const serverId = regServer['dataValues']['id']
        if (reqService['type'] === 'container') {
            const variableSize = reqService['variables'].length
            for (let i = 0; i < variableSize; i++) {
                server['variables'].push((await Variable.create({
                    serverId,
                    key: reqService['variables'][i]['key'],
                    value: reqService['variables'][i]['val'],
                    type: reqService['type'],
                }))['dataValues'])
            }
        }
        if (reqService['type'] === 'process') {
            const logFileSize = reqService['logFiles'].length
            for (let i = 0; i < logFileSize; i++) {
                server['logFiles'].push((await Variable.create({
                    serverId,
                    key: reqService['logFiles'][i]['key'],
                    value: reqService['logFiles'][i]['val'],
                    type: reqService['type'],
                }))['dataValues'])
            }
        }
        return server;
    }
}