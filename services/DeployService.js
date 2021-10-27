
const {Deploy} = require("../models")

export default {
    newDeploy: async (deploy) => {
        try {
            let registerDep = await Deploy.create(deploy);
            return {
                status: "success",
                deploy: registerDep
            }
        } catch (e) {
            console.log(e)
            return {
                status: "error",
                message: "에러가 발생하였습니다."
            }
        }
    }, 
    findDeploy: async (groupId) => {
        return await Deploy.findAll({where: {groupId: groupId}})
    },
    removeDeploy: async () => {
        await Deploy.destroy({where: {groupId: "1"}})
    },
}
