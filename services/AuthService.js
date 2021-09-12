const { Users } = require("../models")
const crypt = require('bcryptjs')
import GroupService from "../services/GroupService";

function getExpireTime(nowTime = new Date().getTime()) {
    const timeout = process.env.session_timeout || 60
    return nowTime + (timeout * 60 * 1000)
}

export default {
    login: async (userId, password) => {
        let auth = {};
        try {
            let registerUser = await Users.findOne({where: {userId: userId}})
            if (registerUser && await crypt.compareSync(password, registerUser['password'])) {
                const groups = await GroupService.findByUserId(registerUser['id']);
                const nowTime = new Date().getTime();
                const expireTime = getExpireTime(nowTime);
                auth = {
                    status: "success",
                    user: {
                        id: registerUser['id'],
                        name: registerUser['name'],
                        userId: registerUser['userId'],
                        admin: registerUser['admin'] || false,
                    },
                    groups: groups,
                    loginTime: nowTime,
                    expireTime: expireTime
                }
            } else {
                auth ={
                    status: "fail",
                    message: "잘못된 사용자 정보입니다."
                }
            }
        } catch (e) {
            console.error(e)
            auth ={
                status: "error",
                message: "에러가 발생하였습니다."
            }
        }
        return auth;
    },
    validate: async (req, res) => {
        try {
            const auth = req.session.auth;
            const nowTime = new Date().getTime();
            if (auth && auth['expireTime'] && nowTime < auth['expireTime']) {
                // 유효함.
                const groups = await GroupService.findByUserId(auth['user']['id']);
                const tmpAuth = Object.assign(auth, {
                    expireTime: getExpireTime(nowTime),
                    groups: groups
                });
                req.session.auth = tmpAuth;
                return tmpAuth;
            } else {
                res.statusCode = 401;
                res.send({
                    status: "fail",
                    message: "로그인정보가 없습니다."
                });
            }
        } catch (error) {
            console.error('validate error >>> ', error)
            throw error;
        }
    }
}


