import { v4 as uuidv4 } from 'uuid';
import Mail from "../utils/Mail"
const { Users } = require("../models")
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
                password: (await crypt.hash(user['password'], 12))
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
    removeUser: async (userId) => {
        const user = await this.findByUserId(userId);
        if (user) {
            user.destroy()
        }
    },
    resetPassword: async (userId) => {
        let registerUser = await Users.findOne({where: {userId: userId}})
        if (registerUser) {
            const tempPassword = uuidv4().slice(0, 4)
            await registerUser.update({password: (await crypt.hash(tempPassword, 12))})
            await Mail.sendText({
                to: userId,
                subject: "[운영관리] 비밀번호 초기화",
                text: "임시비밀번호: " + tempPassword
            })
        }
    }
}



// const user = {name: "aaa", admin: true, password: "pass"};
// console.log('1>>>', body, Sample)
//
// const newUser = await Users.create(user);
// console.log('newUser >>>', newUser)
//
// let s = await Sample.findOne({where: {key: body['key']}});
// console.log('>>>', s)
//
// await newUser.destroy();
