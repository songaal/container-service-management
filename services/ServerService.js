const { Services, Servers, GroupServer, GroupAuth, Sequelize, sequelize, ShareService } = require("../models")
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
        let results = []
        const servers = await Servers.findAll(
            {
                // attributes: [
                //     'id', 'name', 'user', 'ip', 'port', 'createdAt', 'updatedAt',
                //
                // ],
                attributes: {
                    exclude: ["password"],
                    include: [
                        [
                            sequelize.literal(`(
                            SELECT count(*)
                              FROM services a
                             WHERE a.serverId = server.id
                               AND a.groupId = ${groupId}
                        )`),
                            "service_count"
                        ]
                    ]
                },
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

        const shareServices = await ShareService.findAll({where: { toGroupId: groupId }})
        if (shareServices.length > 0) {
            const serviceIds = shareServices.map(ss => ss['serviceId'])
            const services = await Services.findAll({where: {id: { [Sequelize.Op.in]: serviceIds }}})
            const shareServerIds = services.filter(svc => !servers.find(server => server[id] === svc['serverId'])).map(svc => svc['serverId'])
            const shareServers = await Servers.findAll({
                attributes: { exclude: ["password"] },
                where: {
                    id: {
                        [Sequelize.Op.in]: shareServerIds
                    }
                }
            })

            results = [].concat(servers, shareServers.map(server => ({...server['dataValues'], shared: true})))
        } else {
            results = servers
        }
        return results
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
            user: reqServer['user'],
            dockerPort: reqServer['dockerPort']||"2375"
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