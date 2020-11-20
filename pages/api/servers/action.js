import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import ServerService from "../../../services/ServerService"

async function serverTest(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')

    try {
        if (req.method === 'POST') {
            if (req.query['type'] === "test") {
                const clientInfo = JSON.parse(req.body)
                const result = await ServerService.SshConnTest(clientInfo)
                res.send(result)
            }
        } else if (req.method === 'GET') {
            if (req.query['type'] === "terminal") {
                res.send({
                    status: "success",
                    terminalUrl: process.env.webssh_host
                })
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