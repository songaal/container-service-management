const { Services, Servers, GroupServer, GroupAuth, Sequelize, sequelize } = require("../models")
import SshClient from '../utils/SshClient'

export default {
    async SshConnTest({ip, port, user, password}) {
        try {
            const client = new SshClient(ip, port, user, password);
            const result = await client.exec("uptime")
            if (result.length > 0) {
                return { status: "success", result: result }
            } else {
                return { status: "error", message: "연결에 실패하였습니다." }
            }

        } catch (error) {
            return {
                status: "error",
                message: "연결에 실패하였습니다.",
                error: error
            }
        }
    },
    async findServerByGroupId(groupId) {
        return await Servers.findAll(
            {
                attributes: ['id', 'name', 'user', 'ip', 'port', 'createdAt', 'updatedAt'],
                where: {
                    id: {
                        [Sequelize.Op.in]: sequelize.literal(`(
                            SELECT gs.serverId
                              FROM group_servers gs
                             WHERE gs.groupId = ${groupId}
                        )`)
                    }
                }
            })
    },
    async isRead(id, req, res) {
        try {
            const userId = req.session.auth.user.id;
            const admin = req.session.auth.user.admin;
            if (admin) {
                return;
            }

            const groupIds = await GroupServer.findAll({
                where: {serverId: id},
                attributes: ['groupId']
            })

            if (groupIds.length === 0) {
                throw new Error("no");
            }

            const count = await GroupAuth.count({
                where: {
                    userId: userId,
                    groupId: {
                        [Sequelize.Op.in]: groupIds.map(groupId => groupId['groupId'])
                    }
                }
            })
            if (count === 0) {
                throw new Error("no");
            }
        } catch (error) {
            console.error(error)
            res.statusCode = 403;
            res.send({
                status: "fail",
                message: "접근 권한이 없습니다."
            });
        }
    },
    async findServerById(id) {
        return (await Servers.findOne({
            where: {id: id}
        }))['dataValues']
    },
    async execCmd(id, cmd) {
        try {
            const server = await Servers.findOne({ where: {id: id} })
            const client = new SshClient(server['ip'], server['port'], server['user'], server['password']);
            return {
                status: "success",
                result: await client.exec(cmd)
            }
        } catch (error) {
            return {
                status: "error",
                message: "에러가 발생하였습니다.",
                error: error
            }
        }
    },
    async editServer(id, reqServer) {
        let regServer = await Servers.count({where: { id }})
        if (regServer !== 1) {
            throw new Error("서버 정보를 찾을 수 없습니다.")
        }
        regServer = await Servers.update({
            name: reqServer['name'],
            ip: reqServer['ip'],
            port: reqServer['port'],
            user: reqServer['user']
        }, {where: { id }})
        return regServer
    },
    async removeServer(id) {
        let regServer = await Servers.count({where: { id }})
        if (regServer !== 1) {
            throw new Error("서버 정보를 찾을 수 없습니다.")
        }

        await Services.update({serverId: -1}, {where: { serverId: id }})
        await GroupServer.destroy({where: { serverId: id }})
        await Servers.destroy({where: { id }})

    }
}