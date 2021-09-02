import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import ServerService from "../../../../services/ServerService"
import AuthService from "../../../../services/AuthService";
import SshClient from "../../../../utils/SshClient";
import FileService from "../../../../services/FileService";

async function serverTest(req, res) {
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
                    var body = JSON.parse(req.body);

                    var excuteData = await sshClient.exec(
                        body["cmd"] !== undefined && body["cmd"] !== ""
                        ? `cd ${body["path"]} && ${body["cmd"]} ; ls -al ; pwd`
                        : `cd ${body["path"]} && ls -al && pwd`, // 아무것도 입력하지 않았을때 
                    {}
                    )

                    var result = {
                        dirFiles : "",
                        pwd : ""
                    }

                    if(excuteData.length == 2){
                        result['dirFiles'] = excuteData[excuteData.length-2] // 배열의 마지막에서 두번째 : ls -al
                        result['pwd'] = excuteData[excuteData.length-1] // 배열의 마지막 요소 : pwd
                    } else { // error handle
                        result['dirFiles'] = excuteData[0]
                        result['pwd'] = body["path"]
                    }
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
            } else if (req.query["type"] === "removeFile") {
                res.send({
                   status: "success",
                   fiileList: await FileService.removeFiles(req.session.auth.user.userId, req.query["filekey"])
                });
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