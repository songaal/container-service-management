
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
            res.send({
                status: "success",
                health: await GroupSvcService.findServiceHealth(services)
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

export default withSession(groupsService)