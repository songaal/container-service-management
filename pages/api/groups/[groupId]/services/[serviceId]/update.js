
import React from 'react';
import GroupSvcService from "../../../../../../services/GroupSvcService";


async function remoteUpdateService(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')

    try {
        const groupId = req.query['groupId'];
        const serviceId = req.query['serviceId'];

        if (req.method === "PUT") {
            const user = {
                remote: true,
                headers: req.headers||{}
            }
            res.send({
                status: "success",
                result: await GroupSvcService.updateServices(user, groupId, serviceId)
            })
        } else {
            res.statusCode = 404
            res.end()
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

export default remoteUpdateService