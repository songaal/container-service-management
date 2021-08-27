
const { Sequelize, sequelize, Services, Variable, FileHistory} = require("../models")

export default {
    newFile: async (file) => {
        try {
            let registerFile = await FileHistory.create(file);
            return {
                status: "success",
                file: registerFile
            }
        } catch (e) {
            console.log(e)
            return {
                status: "error",
                message: "에러가 발생하였습니다."
            }
        }
    }, 
    findFiles: async (userId) => {
        return await FileHistory.findAll({where: {userId: userId}})
    },
    updateFiles: async (userId) => {
        await FileHistory.update({phase: 'R'},{where: {userId: userId}})
        return await FileHistory.findAll({where: {userId: userId}})
    },
    removeFiles: async (userId) => {
        await FileHistory.destroy({where: {userId: userId}})
        return await FileHistory.findAll({where: {userId: userId}})
    },
}
