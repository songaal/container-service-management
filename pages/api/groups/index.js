import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../services/AuthService";
import GroupService from "../../../services/GroupService";
import GroupAuthService from "../../../services/GroupAuthService"
import JsonUtil from "../../../utils/JsonUtil";
async function groups(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        const id = req.session.auth.user.id;
        const admin = req.session.auth.user.admin;

        if (req.method === "POST") {
            const requestBody = JsonUtil.parse(req.body);
            const group = await GroupService.newGroup(requestBody);
            if (group['status'] === 'success') {
                await GroupAuthService.newGroupAuth(group['group']['id'], id)
                req.session.auth['groups'].push({id: group['id'], name: group['name']})
            }

            return res.send(group);
        } else if(req.method === "GET") {
            return res.send({
                status: "success",
                groups: await GroupService.findAll(id, admin)
            });
        }
    } catch (error) {
        console.error(error);
        return res.send({
            status: "error",
            message: "에러가 발생하였습니다."
        })
    }

}

export default withSession(groups)