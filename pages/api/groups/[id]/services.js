
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
        const groupId = req.query['id'];
        if (req.method === "GET") {
            res.send({
                status: "success",
                services: await GroupSvcService.findServiceByGroupId(groupId)
            })
        } else if(req.method === "POST") {
            res.send({
                status: "success",
                service: await GroupSvcService.addService(groupId, JSON.parse(req.body))
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