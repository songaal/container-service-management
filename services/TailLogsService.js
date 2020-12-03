const { Sequelize, sequelize, Services, Variable} = require("../models")
import FileUtil from "../utils/FileUtil"
import DockerClient from "../utils/DockerClient"
import SshClient from '../utils/SshClient'
import SshTail from "../utils/SshTail"
import Ttl from "../utils/Ttl"
import GroupSvcService from "./GroupSvcService";
import ServerService from "./ServerService";


const dockerDefaultPort = process.env.docker_default_api||2375
const dataTtlSec = 30
const keyMapTTLSec = 30
const MAX_SIZE = 10000
const DATA_TTL = new Ttl({ttl: dataTtlSec * 1000})
let KEY_MAP = {}


export default {
    async start({groupId, serviceId, logId}) {
        // 1. FrontEnd에서 로그 수집 시작 API를 호출한다.
        // 2. 서버에선 Key를 생성하여, KeyTTL 메모리에 적재한다.(TTL 10초)
        // 3. SshTail 객체를 생성한다.
        // 4. expire 만료시간안에 alive API 호출하여 로그 수집을 계속한다.
        // 5. 스케줄을 돌면서 keyMap 만료된 데이터를 삭제한다.
        // 6. 로그를 수집하면서 key가 없거나 만료 되었으면 수집을 멈추고, 기존 데이터는 TTL에서 자동 제거 되도록 한다.

        const regService = await GroupSvcService.findServiceById(serviceId);
        if (!regService) {
            throw new Error("서비스를 찾을 수 없습니다.")
        }
        const serverId = regService['serverId']
        const server = await ServerService.findServerById(serverId)
        if (serverId === '' || serverId === '-1' || !server) {
            throw new Error("할당된 서버가 없습니다.")
        }
        const key = `${serverId}_${groupId}_${serviceId}_${logId}`
        if (typeof KEY_MAP[key] === 'object') {
            let alive = false
            try {
                if(KEY_MAP[key]['tail']['state'] === "connected" || KEY_MAP[key]['tail']['state'] === "tailing") {
                    console.log('이미 로그 수집을 진행하고있습니다.', key)
                    alive = true
                }
            } catch (err) {
                console.log('err', err)
            }
            if (alive) {
                return false
            }
        }

        let mode = ""
        let targets = []
        let ip = server['ip']
        let port = server['port']
        let user = server['user']
        let password = server['password']

        if (regService['type'] === 'container') {
            mode = "docker"
            const servicePath = await FileUtil.getDockerComposeServicePath({groupId, serviceId})
            const dockerClient = new DockerClient(server['ip'], server['dockerPort']||dockerDefaultPort, servicePath)
            targets = (await dockerClient.getContainerIds()).map(id => id.substring(0, 12))
        } else if (regService['type'] === 'process') {
            const resultLogFile = await Variable.findOne({ where: {id: logId} })
            if (resultLogFile['value']) {
                targets.push(resultLogFile['value'])
            }
            mode = "file"
        } else {
            throw new Error("타입이 잘못되었습니다.")
        }

        if (!targets || targets.length === 0) {
            throw new Error("수집할 로그 대상이 없습니다.")
        }
        const tail = new SshTail({
            host:       ip,
            port:       port,
            username:   user,
            password:   password,
            mode:       mode,
            key:        key,
        });
        tail
            .on('stderr', function(data){
                const key = tail.sshOpts['key']
                if ( KEY_MAP[key] === undefined || KEY_MAP[key] === null || Number(KEY_MAP[key]['expire']) < new Date().getTime()) {
                    tail.stop()
                } else {
                    const value = DATA_TTL.get(key)
                    value.push(data)
                    if (value.length > MAX_SIZE) {
                        let tmpValue = value.slice(Math.floor(MAX_SIZE / 2))
                        DATA_TTL.push(key, tmpValue, {ttl: dataTtlSec * 1000})
                    } else {
                        DATA_TTL.push(key, value, {ttl: dataTtlSec * 1000})
                    }
                }
            })
            .on('stdout', function(data){
                const key = tail.sshOpts['key']
                if ( KEY_MAP[key] === undefined || KEY_MAP[key] === null || Number(KEY_MAP[key]['expire']) < new Date().getTime()) {
                    tail.stop()
                } else {
                    const value = DATA_TTL.get(key)
                    value.push(data)
                    if (value.length > MAX_SIZE) {
                        let tmpValue = value.slice(Math.floor(MAX_SIZE / 2))
                        DATA_TTL.push(key, tmpValue, {ttl: dataTtlSec * 1000})
                    } else {
                        DATA_TTL.push(key, value, {ttl: dataTtlSec * 1000})
                    }
                }
            })
            .on('disconnected', function(){
                try {
                    const key = tail.sshOpts['key']
                    delete KEY_MAP[key]
                    KEY_MAP[key] = undefined
                }catch (e) {
                    console.log(e)
                }
            })
            .on('connected',    function(){
                const key = tail.sshOpts['key']
                DATA_TTL.push(key, [ Buffer.from("connected") ], {ttl: dataTtlSec * 1000})
            })
            .on('error',        function(error){
                console.log('Client Error:' + error)
                try {
                    const key = tail.sshOpts['key']
                    delete KEY_MAP[key]
                }catch (err) {
                    console.log('error : ', err)
                }
            })
            .start(targets)


        const nowTime = new Date().getTime()
        KEY_MAP[key] = {
            params: { serverId, groupId, serviceId, logId, ip, port, user, password, mode, targets },
            start: nowTime,
            expire: nowTime + (keyMapTTLSec * 1000),
            tail: tail
        }

        return {
            key: key,
            start: KEY_MAP[key]['start'],
            expire: KEY_MAP[key]['expire'],
        }
    },
    async getLogs({serverId, groupId, serviceId, logId}) {
        const key = `${serverId}_${groupId}_${serviceId}_${logId}`
        const logs = DATA_TTL.get(key)
        if (typeof KEY_MAP[key] === "object") {
            try {
                const nowTime = new Date().getTime()
                KEY_MAP[key]['expire'] = nowTime + (keyMapTTLSec * 1000)
            } catch(err) {
                // ignore
            }
        }
        return logs
    }
}