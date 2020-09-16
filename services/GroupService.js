const { Groups } = require("../models")


export default {
    findAll: async () => {
        return await Groups.findAll()
    },
    newGroup: async ({name, description}) => {
        const alreadyGroups = await Groups.findAll({where: {name}})
        if (alreadyGroups.length > 0) {
            return {
                status: "success",
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