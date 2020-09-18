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
                             WHERE gs.serverId = id
                        )`), 'group_server_count'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                              FROM services b
                             WHERE b.groupId in (SELECT groupId 
                                                   FROM group_servers c
                                                  WHERE c.serverId = id)
                        )`), 'service_count'
                    ]
                ]
            }
        })
    }


}