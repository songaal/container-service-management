
import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../../services/AuthService";
import GroupService from "../../../../services/GroupService";
import JsonUtil from "../../../../utils/JsonUtil";


async function groupsDetail(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    const id = req.query['id'];
    await AuthService.validate(req, res);
    await GroupService.isRead(id, req, res)

    try {
        if (req.method === "GET") {
            res.send(await GroupService.findById(id))
        } else if (req.method === "PUT") {
            const groupEdit = JSON.parse(req.body);
            res.send(await GroupService.editGroup(id, groupEdit));
        } else if (req.method === "DELETE") {
            res.send(await GroupService.removeGroup(id));
        }
    } catch (error) {
        console.error(error);
        res.send({
            status: "error",
            message: "에러가 발생하였습니다."
        })
    }
}

export default withSession(groupsDetail)