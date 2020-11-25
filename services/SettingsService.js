const { GroupServer, Servers, Services, sequelize } = require("../models")

export default {
    getServerList: async () => {
        return await Servers.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) 
                              FROM group_servers AS gs
                             WHERE gs.serverId = server.id
                               AND gs.groupId is not NULL
                        )`), 'group_server_count'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                              FROM services b
                             WHERE b.serverId = server.id
                        )`), 'service_count'
                    ]
                ]
            }
        })
    },
    async addServerInfo({name, groups, ip, port, user, password}) {
        try {
            let newServer = await Servers.create({name, user, password, ip, port})
            if (groups && groups.length > 0) {
                const groupIdMap = {};
                groups.map(group => group['id']).forEach(groupId => groupIdMap[groupId] = null)
                const groupIds = Object.keys(groupIdMap)
                for (let i = 0; i < groupIds.length; i++) {
                    await GroupServer.create({
                        serverId: newServer['id'],
                        groupId: groupIds[i]
                    })
                }
            }
            return {
                status: 'success',
                server: newServer
            }
        } catch (err) {
            console.error(err)
            return {
                status: 'error',
                message: JSON.stringify(err)
            }
        }

    },
    async findGroupsById(serverId) {
        return await GroupServer.findAll(
            {
                where: {
                    serverId: serverId
                },
                attributes: {
                    include: [
                        [
                            sequelize.literal(`(
                            SELECT count(*)
                              FROM services b
                             WHERE b.groupId = groupId
                        )`),
                            "service_count"
                        ]
                    ]
                }
            })
    },
    async deleteServerByGroup(serverId, groupId) {

        const servicesResult = await Services.update({ serverId: -1 }, { where : {serverId, groupId}})
        const groupServerResult = await GroupServer.destroy({ where : {serverId, groupId}})

        return {
            servicesResult,
            groupServerResult
        }
    },
    async addServerOnGroups(serverId, groupIds) {
        let results = []
        for (let i = 0; i < groupIds.length; i++) {
            results.push(await GroupServer.create({
                serverId, groupId: groupIds[i]
            }))
        }
        return results
    },
    async editPassword(serverId, editPassword) {
        return await Servers.update({password: editPassword}, {where: {id: serverId}})
    }
}