
const { Sequelize, sequelize, Services, Variable, FileHistory} = require("../models")

export default {
    newFileInfo: async (file) => {
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
    findFiles: async (userId, filekey) => {
        if(filekey === "undefined"){
            return await FileHistory.findAll({where: {userId: userId}})
        } else{
            return await FileHistory.findAll({where: {userId: userId, filekey : filekey}})
        }
    },
    updateFileInfo: async (userId, fileKey, phase) => {
        return await FileHistory.update({phase: phase},{where: {userId: userId, fileKey: fileKey}})
    },
    removeFiles: async (userId, fileKey) => {
        await FileHistory.destroy({where: {userId: userId, fileKey: fileKey}})
        return await FileHistory.findAll({where: {userId: userId}})
    },
}
