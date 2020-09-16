import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../services/AuthService";
import GroupService from "../../../services/GroupService";
import JsonUtil from "../../../utils/JsonUtil";
async function groups(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        if (req.method === "POST") {
            const requestBody = JsonUtil.parse(req.body);
            res.send(await GroupService.newGroup(requestBody));
        } else if(req.method === "GET") {
            res.send(await GroupService.findAll());
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