const { Sequelize, sequelize, Groups, GroupAuth, GroupServer, Services } = require("../models")


export default {
    findAll: async (userId, isAdmin) => {
        let where = {}

        if (!isAdmin) {
            where['id'] = {
                [Sequelize.Op.in]: sequelize.literal(`(
                            SELECT groupId
                              FROM group_auths aa
                             WHERE aa.userId = ${userId}
                    )`)
            }
        }

        return await Groups.findAll({
            where,
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT count(*)
                              FROM group_servers a
                             WHERE a.groupId = id
                        )`),
                        "server_count"
                    ],
                    [
                        sequelize.literal(`(
                            SELECT count(*)
                              FROM services b
                             WHERE b.groupId = id
                        )`),
                        "service_count"
                    ],
                    [
                        sequelize.literal(`(
                            SELECT count(*)
                              FROM group_auths c
                             WHERE c.groupId = id
                        )`),
                        "user_count"
                    ]
                ]
            }
        })
    },
    findByUserId: async (userId) => {
        const groups = await GroupAuth.findAll({
            where: {userId: userId},
            include: [
                {model: Groups}
            ]
        });
        return groups.map(group => group['group'])
    },
    newGroup: async ({name, description}) => {
        const alreadyGroups = await Groups.findAll({where: {name}})
        if (alreadyGroups.length > 0) {
            return {
                status: "fail",
                message: "이미 사용하고있는 그룹이름입니다."
            }
        }
        return {
            status: "success",
            group: await Groups.create({name, description})
        }
    },
    findById: async (groupId) => {
        const group = await Groups.findOne({where: {id: groupId}})

        if (group) {
            return {
                status: "success",
                group: group
            }
        } else {
            return {
                status: "fial",
                message: "그룹이 없습니다."
            }
        }
    }
}