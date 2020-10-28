const { Servers, GroupServer, GroupAuth, Sequelize, sequelize } = require("../models")
import SshClient from '../utils/SshClient'

export default {
    async SshConnTest({ip, port, user, password}) {
        try {
            const client = new SshClient(ip, port, user, password);
            const result = await client.exec("uptime", {})
            return {
                status: "success",
                result
            }
        } catch (error) {
            return error
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
        return await Servers.findOne({
            attributes: ['id', 'name', 'user', 'ip', 'port', 'createdAt', 'updatedAt'],
            where: {id: id}
        })
    },


}