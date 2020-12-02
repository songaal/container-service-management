const { GroupAuth } = require("../models")


export default {
    newGroupAuth: async (groupId, userId) => {
        return await GroupAuth.create({ groupId, userId, favorites: "0" })
    },
    findByGroupId: async (groupId) => {
        return await GroupAuth.findAll({where: {groupId: groupId}})
    },
    addGroupAuthList: async ({id, admin, groupId, userIds}) => {

        if (!admin) {
            const count = await GroupAuth.count({where: {userId: id}})
            if (count === 0) {
                throw new Error("추가할 권한이 없습니다.")
            }
        }

        let results = []
        for (let i = 0; i < userIds.length; i++) {
            try {
                results.push(await GroupAuth.create({ groupId: groupId, userId: userIds[i], favorites: "0" }))
            } catch (err) {
                console.error('err', err)
            }
        }
        return results
    },
    removeGroupAuthList: async ({id, admin, groupId, userIds}) => {
        if (!admin) {
            const count = await GroupAuth.count({where: {userId: id}})
            if (count === 0) {
                throw new Error("추가할 권한이 없습니다.")
            }
        }

        let results = []
        for (let i = 0; i < userIds.length; i++) {
            try {
                results.push(await GroupAuth.destroy({
                    where: {
                        groupId: groupId,
                        userId: userIds[i]
                    }
                }))
            } catch (err) {
                console.error('err', err)
            }
        }
        return results
    },
    async updateFavorites(userId, groupId, favorites) {
        return await GroupAuth.update({
            favorites: favorites
        }, {
            where: {
                userId: userId,
                groupId: groupId
            }
        })
    }
}