const { GroupServer, Servers, sequelize } = require("../models")

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
                             WHERE b.groupId in (SELECT groupId 
                                                   FROM group_servers c
                                                  WHERE c.serverId = server.id
                                                    AND c.groupId is not NULL)
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

    }
}