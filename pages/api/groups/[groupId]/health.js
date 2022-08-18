
import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../../services/AuthService";
import GroupSvcService from "../../../../services/GroupSvcService";


async function groupsService(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        const groupId = req.query['groupId'];
        if (req.method === "GET") {
            const services = [].concat(await GroupSvcService.findServiceByGroupId(groupId), await GroupSvcService.findShareServiceByGroupId(groupId))
            return res.send({
                status: "success",
                health: await GroupSvcService.findAllServiceHealth(services)
            })
        }
    } catch (error) {
        console.error(error);
    }
}

export default withSession(groupsService)