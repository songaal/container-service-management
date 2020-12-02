const { Sequelize, sequelize, Users, Servers, Groups, GroupAuth, GroupServer, Services, Variable} = require("../models")


export default {
    async getStats(userId) {
        const serverSize = await Servers.count()
        const groupSize = await Groups.count()
        const serviceSize = await Services.count()
        const userSize = await Users.count()
        const groupAuthList = await GroupAuth.findAll({
            where: {
                userId: userId
            },
            include: [
                {
                    model: Groups,
                    attributes: {
                        include: [
                            [
                                sequelize.literal(`(
                            SELECT count(*)
                              FROM group_servers a
                             WHERE a.groupId = group_auth.groupId
                        )`),
                                "server_count"
                            ],
                            [
                                sequelize.literal(`(
                            SELECT count(*)
                              FROM services b
                             WHERE b.groupId = group_auth.groupId
                        )`),
                                "service_count"
                            ],
                            [
                                sequelize.literal(`(
                            SELECT count(*)
                              FROM group_auths c
                             WHERE c.groupId = group_auth.groupId
                        )`),
                                "user_count"
                            ]
                        ],
                    },
                    // include: [
                    //     {
                    //         model: Services
                    //     }
                    // ]
                }
            ]
        })
        return {
            system: {
                serverSize,
                groupSize,
                serviceSize,
                userSize,
            },
            groupAuthList,
        }
    },

}