
import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../services/AuthService";
import GroupService from "../../../services/GroupService";
import JsonUtil from "../../../utils/JsonUtil";


async function groupsDetail(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    //TODO 사용자 권한 체크.
    try {
        const id = req.query['id'];
        if (req.method === "GET") {

            const result = await GroupService.findById(id)
            console.log(result)
            res.send(result)
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