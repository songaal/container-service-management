const Schedule = require('node-cron');
const { Services, Servers, FileHistory } = require("../models")
const dockerDefaultPort = 2375
const fs = require('fs');

let sync = {}
async function TaskJob(service) {
    try {
        if (sync[`${service['groupId']}_${service['id']}`] !== undefined) {
            return false;
        }
        sync[`${service['groupId']}_${service['id']}`] = true
        const Path = require("path")
        const compose = require('docker-compose')
        const Client = require('ssh2').Client;

        if (!service['serverId']) {
            console.log("Server Empty...", service)
            return false
        }

        const server = await Servers.findOne({where: {id: service['serverId']}})
        if (!server) {
            console.log("Server Empty...", service)
            return false
        }
        const ip = server['ip']
        const port = service['type'] === 'container' ? (server['dockerPort']||dockerDefaultPort) : server['port']
        const username = server['user']
        const password = server['password']

        if(service['type'] === 'container') {
            const path = Path.join(process.env['docker_compose_home_path'], String(service['groupId']), String(service['id']))
            console.log('schedule compose path >> ', path)
            const psResult = await compose.ps({
                cwd: path,
                log: false,
                env: { DOCKER_HOST: `${ip}:${port}` }
            })

            // 모든 컨테이너가 Up 없는 상태에서 진행함.
            if (psResult['exitCode'] === 0 && !String(psResult['out']).includes(" Up ")) {
                await compose.down({
                    cwd: path,
                    log: false,
                    env: { DOCKER_HOST: `${ip}:${port}` }
                })
                setTimeout(async function() {
                    await compose.upAll({
                        cwd: path,
                        log: false,
                        env: { DOCKER_HOST: `${ip}:${port}` }
                    })
                    console.log("[Schedule] serviceId: " + service['id'] + " Action: UP ALL!")
                }, 500)
            } else {
                console.log("[Schedule] 이미 컨테이너 실행 중입니다. ", service)
            }
        } else if (service['type'] === 'process') {
            const startScripts = service['startScript']
            const pidCmd = "echo $(" + service['pidCmd'] + ") && echo 0"

            const conn = new Client();
            let isStartExec = false;
            conn.on('ready', function() {
                conn.exec(pidCmd, function(err, stream) {
                    stream.on('end', function(code, signal) {
                        conn.end();
                    })
                    stream.stdout.on('data', function(data) {
                        // PID 조회하여 존재하지 않을때만 시작 시크립트 진행함.
                        if (!isStartExec && String(data).split("\n").filter(s => s !== '')[0] === '0') {
                            isStartExec = true;
                            conn.exec(startScripts, ()=>{})
                            console.log("[Schedule] serviceId: " + service['id'] + " Action: Process Started !")
                        } else {
                            console.log("이미 실행 중인 프로세스가 존재합니다.")
                        }
                    }).stderr.on('data', function(data) {
                        String(data)
                    })
                });
            }).on('error', (err1) => {
                console.log("Schedule Exec Connection Fail.", err1)
            }).connect({
                host: ip,
                port: port,
                username: username,
                password: password,
                readyTimeout: Number(999999)
            });
        }
    } catch (err) {
        console.error("ERROR Schedule. Service: ", service, ", ERROR : " , err)
    } finally {
        delete sync[`${service['groupId']}_${service['id']}`]
        sync[`${service['groupId']}_${service['id']}`] = undefined
    }
}

let registryJobs = {}

class ScheduleService {
    constructor() {

    }

    async init() {
        const keys = Object.keys(registryJobs)||[]
        for (let i=0; i < keys.length; i++) {
            this.cancelJob(keys[i])
        }

        const services = (await Services.findAll({where: {isSchedule: true}}))||[]
        services.forEach(service => {
            try {
                this.createJob(`${service['groupId']}_${service['id']}`, service["cron"], service['dataValues'])
                console.log('[init Schedule] groupId: ' + service['groupId'] + ", ServiceId:" + service['id'])
            } catch (e) {
                console.error("[init schedule error !!!!] service ID: ", service['id'], ", error >>", e)
            }
        })
        console.log("schedule Service Count: ", services.length)

        // 임시파일 삭제 스케줄
        Schedule.schedule((process.env.TEMPFILE_REMOVE_CRON || "0 0 */3 * * *"), async () => {
            try{ 
                await fs.readdir((process.env.TEMP_FILES_DIR || "./public/tempFiles"), function(error, filelist) {
                    if (error) return console.log(error);
                    filelist.forEach(name => {
                        fs.stat((process.env.TEMP_FILES_DIR || "./public/tempFiles") + `/${name}`, async (err, fileInfo) => {  
                            if (err) return console.log(err);
                            if (name !== "logs") {
                                var gapTime = ((new Date().getTime() - fileInfo.birthtime.getTime())/1000/60).toFixed(0);

                                // 180분 경과된 파일을 제거
                                if(parseInt(gapTime) >= (process.env.FILE_REMOVE_MINUTE || 180)){

                                    // 파일 삭제
                                    try {
                                        await fs.rmdirSync((process.env.TEMP_FILES_DIR || "./public/tempFiles") + `/${name}`, {
                                            recursive: true,
                                        });
                                    } catch (error) {
                                        console.log(error);   
                                    }
                                    
                                    // DB 삭제
                                    // 스케줄링 인터벌 시간 이후에도 'F'인 건, 업로드에 멈춘 건, 다운로드 멈춘건 디비에서 제거
                                    try {
                                        await FileHistory.destroy({where: {fileKey: name, phase: 'L', type: 'upload'}});
                                        await FileHistory.destroy({where: {fileKey: name, phase: 'R', type: 'download'}});
                                        await FileHistory.destroy({where: {fileKey: name, phase: 'F'}});
                                        await FileHistory.destroy({where: {userId: ''}});
                                    } catch (error) {
                                        console.log(error);
                                    }                   
                                }
                            }
                        });
                    });
                })
            } catch(e) {
                console.log(e);
            } 
        }, { scheduled: true, timezone: "Asia/Seoul"}).start()
    }
    createJob(key, cron, service) {
        if (!registryJobs[key]) {
            this.cancelJob(key)
        }
        try {
            const task = Schedule.schedule(cron, () => TaskJob(service), { scheduled: true, timezone: "Asia/Seoul"}).start()
            registryJobs[key] = { key, cron, service, task }
            console.log("Registry Schedule JOB >>> GroupId: " + key.split("_")[0], ", ServiceId: ", key.split("_")[1], " cron: ", cron)
            return true
        } catch(e) {
            console.error('create job failed. ', e)
            return false
        }
    }

    cancelJob(key) {
        try {
            if (registryJobs[key]) {
                registryJobs[key].task.stop()
                registryJobs[key].task.destroy()
                delete registryJobs[key]
            }
            return true
        } catch(e) {
            console.error(e)
            return false
        }
    }

    getScheduleJob(key) {
        return Object.assign({}, registryJobs[key]||{})
    }
}
module.exports = new ScheduleService()