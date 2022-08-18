
import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../../../../services/AuthService";
import GroupSvcService from "../../../../../../services/GroupSvcService";
import SHA256 from "../../../../../../utils/Sha256";

const secretKey = process.env.secret_key

async function groupsService(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        const groupId = req.query['groupId'];
        const serviceId = req.query['serviceId'];
        if (req.method === "GET") {
            const service = await GroupSvcService.findServiceById(serviceId)
            const token = String(SHA256(secretKey + "::" + service['groupId'] + "::" + serviceId)).substring(0, 10)
            return res.send({
                status: "success",
                service: service,
                token: token
            })
        } else if (req.method === "PUT") {
            const user = req.session.auth.user
            return res.send({
                status: "success",
                service: await GroupSvcService.editService(user, serviceId, JSON.parse(req.body))
            })
        } else if (req.method === "DELETE") {
            return res.send({
                status: "success",
                service: await GroupSvcService.removeService(groupId, serviceId)
            })
        }
    } catch (error) {
        console.error(error);
        return res.send({
            status: "error",
            message: "에러가 발생하였습니다.",
            error: JSON.stringify(error)
        })
    }
}

export default withSession(groupsService)