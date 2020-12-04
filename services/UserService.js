import { v4 as uuidv4 } from 'uuid';
import Mail from "../utils/Mail"
import GroupAuthService from "./GroupAuthService";
const { Users, GroupAuth, Groups, GroupServer, Servers, Services, Sequelize, sequelize} = require("../models")
const crypt = require('bcryptjs')

export default {
    newUser: async (user) => {
        try {
            let duplicateUser = await Users.findOne({where: {userId: user['userId']}})
            if (duplicateUser) {
                return {
                    status: "fail",
                    message: "사용할수 없는 아이디입니다."
                }
            }

            let registerUser = await Users.create(Object.assign(user, {
                password: (await crypt.hash(user['password'], 12)),
                admin: false
            }));

            return {
                status: "success",
                user: Object.assign(registerUser, {
                    password: null
                })
            }
        } catch (e) {
            console.log(e)
            return {
                status: "error",
                message: "에러가 발생하였습니다."
            }
        }
    },
    resetPassword: async (userId) => {
        let registerUser = await Users.findOne({where: {userId: userId}})
        if (registerUser) {
            const tempPassword = uuidv4().slice(0, 4)
            const password = (await crypt.hash(tempPassword, 12))
            await Mail.sendText({
                to: userId,
                subject: "[운영관리] 비밀번호 초기화",
                text: "임시비밀번호: " + tempPassword
            })
            await registerUser.update({password: password})
        } else {
            console.log("메일전송 안함. 등록되지 않은 사용자입니다.")
        }
    },
    updatePassword: async (id, password, updatePassword) => {
        let registerUser = await Users.findOne({where: {id}})
        if (registerUser) {
            const isSame = await crypt.compareSync(password, registerUser['password'])
            if (isSame) {
                await registerUser.update({password: (await crypt.hash(updatePassword, 12))})
                return {
                    status: "success",
                    message: ""
                }
            } else {
                return {
                    status: "fail",
                    message: "기존 비밀번호가 일치하지 않습니다."
                }
            }
        } else {
            return {
                status: "fail",
                message: "사용자를 찾을 수 없습니다."
            }
        }
    },
    removeUser: async (id) => {
        await GroupAuth.destroy({where: {userId: id}})
        await Users.destroy({where: {id: id}})
        return true
    },
    findAll: async () => {
        return await Users.findAll({
            attributes: ['id', 'userId', 'name', 'createdAt', 'updatedAt'],
        })
    },
    editUser: async (id, reqUser) => {
        return await Users.update({
            admin: reqUser['admin']
        }, {
            where: {
                id: id
            }
        })
    }
}
