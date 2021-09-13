import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import ServerService from "../../../../services/ServerService"
import AuthService from "../../../../services/AuthService";
import SshClient from "../../../../utils/SshClient";
import FileService from "../../../../services/FileService";
import fs from "fs"

async function serverTest(req, res) {
    const tempDir = process.env.TEMP_FILES_DIR || "./public/tempFiles";
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    const id = req.query['id'];
    await AuthService.validate(req, res);
    await ServerService.isRead(id, req, res)

    try {
        if (req.method === 'POST') {
            if (req.query['type'] === "exec") {
                const cmdEntity = JSON.parse(req.body)
                res.send(JSON.stringify(await ServerService.execCmd(id, cmdEntity['cmd'])))
            } else if (req.query['type'] === "exp_excute") {
                let server = await ServerService.findServerById(req.query["id"]);
                const sshClient = new SshClient(
                    server.ip,
                    server.port,
                    server.user,
                    server.password
                );
                try {
                    const body = JSON.parse(req.body);

                    let executeCmd = `export LANG=ko_KR.UTF-8 && cd ${body["path"]} && ${(body["cmd"] || "ls -al")}`
                    let pramCmd = (body["cmd"]||"").toLowerCase()
                    if (pramCmd.startsWith("cd ") || pramCmd.startsWith("mv ") || pramCmd.startsWith("rename ")) {
                        executeCmd += "&&ls -al"
                    }

                    console.log('executeCmd', pramCmd);
                    const excuteData = await sshClient.exec(
                        executeCmd, {}
                    )
                
                    let tmpPwdCmd = (body["cmd"]||"").toLowerCase()
                    let tmpPwdPath = body["path"]
                    if (tmpPwdCmd.startsWith("cd ")) {
                        const excutePwdData = await sshClient.exec(
                            `cd ${body["path"]} && ${body["cmd"]} && pwd`,{}
                        )
                        if (excutePwdData.join("").startsWith("/")) {
                            tmpPwdPath = excutePwdData.join("")
                        }
                        console.log(excutePwdData)
                    }
                    
                    let dirFiles = excuteData.join("").split("\n")
                    dirFiles[0] = `현재 경로 : ${tmpPwdPath.replace("\n", "")}\n`
                    dirFiles = dirFiles.join("\n")

                    // 자동완성 API 파일명 체크용 데이터
                    const excuteSouceData = await sshClient.exec(
                        `export LANG=ko_KR.UTF-8 && cd ${tmpPwdPath.replace("\n", "")} && ls -a`, {}
                    )

                    let result = {}

                    result['dirFiles'] = dirFiles
                    result['dirFileNames'] = excuteSouceData
                    result['pwd'] = tmpPwdPath
                    
                    return res.send(JSON.stringify(result));
                } catch (e) {
                    console.log(e);
                }
            }
        } else if(req.method === 'GET'){
            if (req.query["type"] === "searchFile") {
                res.send({
                  status: "success",
                  fileList: await FileService.findFiles(req.session.auth.user.userId, req.query["filekey"]),
                });
            } else if (req.query["type"] === "updateFile") {
                res.send({
                   status: "success",
                   fiileList: await FileService.updateFileInfo(req.session.auth.user.userId, req.query["filekey"], req.query["phase"], req.query["path"])
                });
            }
        } else if(req.method === 'DELETE'){
            if (req.query["type"] === "removeFile") {
                res.send({
                   status: "success",
                   fiileList: await FileService.removeFiles(req.session.auth.user.userId, req.query["filekey"])
                });
                if(req.query["isFileDelete"] === "true"){
                    await fs.rmdirSync(`${tempDir}/` + req.query["filekey"], {
                        recursive: true,
                    });
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.send({
            status: "error",
            message: "에러가 발생하였습니다."
        })
    }
}

export default withSession(serverTest)