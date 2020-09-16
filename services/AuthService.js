const { Users } = require("../models")
const crypt = require('bcryptjs')

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
                const nowTime = new Date().getTime()
                const expireTime = getExpireTime(nowTime)
                auth = {
                    status: "success",
                    user: {
                        id: registerUser['id'],
                        name: registerUser['name'],
                        userId: registerUser['userId'],
                        admin: registerUser['admin'] || false,
                    },
                    groups: [], // TODO 소속된 그룹 포함 예정
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
            // let registerUser = await Users.findOne({where: {userId: auth['userId']}})

            const nowTime = new Date().getTime();
            if (auth && auth['expireTime'] && nowTime < auth['expireTime']) {
                // 유효함.
                const expireTime = getExpireTime(nowTime);
                const tmpAuth = Object.assign(auth, { expireTime });
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
            throw error;
        }
    }
}


