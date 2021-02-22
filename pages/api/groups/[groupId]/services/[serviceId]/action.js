
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
        const user = req.session.auth.user
        const groupId = req.query['groupId'];
        const serviceId = req.query['serviceId'];
        const type = req.query['type'];
        if (req.method === "GET") {
            if (type === 'stats') {
                res.send({
                    status: "success",
                    state: await GroupSvcService.getState(groupId, serviceId)
                })
            }
        } else if (req.method === "PUT") {
            if (type === 'start') {
                res.send({
                    status: "success",
                    result: await GroupSvcService.startServices(user, groupId, serviceId)
                })
            } else if (type === 'stop') {
                res.send({
                    status: "success",
                    result: await GroupSvcService.stopServices(user, groupId, serviceId)
                })
            } else if (type === 'update') {
                res.send({
                    status: "success",
                    result: await GroupSvcService.updateServices(user, groupId, serviceId)
                })
            } else if (type === 'share') {
                const reqShare = JSON.parse(req.body)
                res.send({
                    status: "success",
                    results: await GroupSvcService.shareServices(serviceId, groupId, reqShare['shareGroupIds'])
                })
            } else if (type === 'schedule') {
                const schedule = req.query['isSchedule'];
                res.send({
                    status: "success",
                    results: await GroupSvcService.editSchedule(serviceId, groupId, schedule)
                })
            }
        }
    } catch (error) {
        console.error(error);
        res.send({
            status: "error",
            message: error['message']||"에러가 발생하였습니다.",
            error: error
        })
    }
}

export default withSession(groupsService)