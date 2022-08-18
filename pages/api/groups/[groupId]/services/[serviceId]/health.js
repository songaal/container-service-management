
import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../../../../services/AuthService";
import GroupSvcService from "../../../../../../services/GroupSvcService";


async function groupsService(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        const serviceId = req.query['serviceId'];
        if (req.method === "GET") {
            const service = Object.assign({}, await GroupSvcService.findServiceById(serviceId))
            return res.send({
                status: "success",
                health: await GroupSvcService.findOneServiceHealth(service)
            })
        }
    } catch (error) {
        console.error(error);
    }
}

export default withSession(groupsService)