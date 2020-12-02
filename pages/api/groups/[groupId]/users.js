import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../../services/AuthService";
import GroupAuthService from "../../../../services/GroupAuthService"
import UserService from "../../../../services/UserService";

async function groups(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        const { groupId } = req.query
        const id = req.session.auth.user.id;
        const admin = req.session.auth.user.admin;

        if (req.method === "GET") {
            res.send({
                status: "success",
                groupAuthList: await GroupAuthService.findByGroupId(groupId),
                users: await UserService.findAll()
            });
        } else if (req.method === "POST") {
            const userIds = JSON.parse(req.body)["userIds"]
            console.log(userIds)
            res.send({
                status: "success",
                result: await GroupAuthService.addGroupAuthList({id, admin, groupId, userIds})
            });
        } else if (req.method === "DELETE") {
            const userIds = JSON.parse(req.body)["userIds"]
            console.log(userIds)
            res.send({
                status: "success",
                result: await GroupAuthService.removeGroupAuthList({id, admin, groupId, userIds})
            });
        }
    } catch (error) {
        console.error(error);
        res.send({
            status: "error",
            message: "에러가 발생하였습니다."
        })
    }

}

export default withSession(groups)