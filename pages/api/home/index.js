import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../services/AuthService";
import GroupService from "../../../services/GroupService";
import GroupAuthService from "../../../services/GroupAuthService"
import JsonUtil from "../../../utils/JsonUtil";
import HomeService from "../../../services/HomeService";

async function groups(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        const id = req.session.auth.user.id;

        if(req.method === "GET") {
            res.send({
                status: "success",
                stats: await HomeService.getStats(id)
            })
        } else if(req.method === "PUT") {
            const body = JSON.parse(req.body)
            res.send({
                status: "success",
                favorites: await GroupAuthService.updateFavorites(id, body['groupId'], body['favorites'])
            })
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