
import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../../../../../../services/AuthService";
import TailLogsService from "../../../../../../../../services/TailLogsService";


async function groupsService(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        const serverId = req.query['serverId'];
        const groupId = req.query['groupId'];
        const serviceId = req.query['serviceId'];
        const logId = req.query['logId'];

        if (req.method === "GET") {
            return res.send({
                status: "success",
                logs: await TailLogsService.getLogs({serverId, groupId, serviceId, logId})
            })
        } else if (req.method === "POST") {
            return res.send({
                status: "success",
                result: await TailLogsService.start({groupId, serviceId, logId})
            })
        }
    } catch (error) {
        console.error(error);
    }
}

export default withSession(groupsService)