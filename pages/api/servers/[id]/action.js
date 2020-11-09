import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import ServerService from "../../../../services/ServerService"
import AuthService from "../../../../services/AuthService";

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