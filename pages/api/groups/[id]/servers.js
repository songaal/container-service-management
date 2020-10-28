
import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../../services/AuthService";
import ServerService from "../../../../services/ServerService";


async function groupsServers(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        const id = req.query['id'];
        if (req.method === "GET") {
            res.send({
                status: "success",
                servers: await ServerService.findServerByGroupId(id)
            })
        }
    } catch (error) {
        console.error(error);
        res.send({
            status: "error",
            message: "에러가 발생하였습니다.",
            error: JSON.stringify(error)
        })
    }
}

export default withSession(groupsServers)