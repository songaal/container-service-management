
import React from 'react';
import GroupSvcService from "../../../../../../services/GroupSvcService";
import SHA256 from "../../../../../../utils/Sha256";

const secretKey = process.env.secret_key

async function remoteUpdateService(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')

    try {
        const groupId = req.query['groupId'];
        const serviceId = req.query['serviceId'];

        if (req.method === "PUT") {
            const token = String(SHA256(secretKey + "::" + groupId + "::" + serviceId)).substring(0, 10)
            if (!req.headers['x-auth-token'] || req.headers['x-auth-token'] !== token) {
                res.statusCode = 401
                res.end()
            }
            const user = {
                remote: true,
                headers: req.headers
            }
            return res.send({
                status: "success",
                result: await GroupSvcService.updateServices(user, groupId, serviceId)
            })
        } else {
            res.statusCode = 404
            res.end()
        }
    } catch (error) {
        console.error(error);
        return res.send({
            status: "error",
            message: error['message']||"에러가 발생하였습니다.",
            error: error
        })
    }
}

export default remoteUpdateService