const { GroupAuth } = require("../models")


export default {
    newGroupAuth: async (groupId, userId) => {
        return await GroupAuth.create({ groupId, userId })
    }

}