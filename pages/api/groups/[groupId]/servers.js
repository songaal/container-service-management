
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
        const groupId = req.query['groupId'];
        if (req.method === "GET") {
            return res.send({
                status: "success",
                servers: await ServerService.findServerByGroupId(groupId)
            })
        }
    } catch (error) {
        console.error(error);
    }
}

export default withSession(groupsServers)