import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../../../../../services/AuthService";
import SettingsService from "../../../../../../../services/SettingsService";
import JsonUtil from "../../../../../../../utils/JsonUtil";

async function settingsServer(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    if (req.session.auth.user.admin === false) {
        res.statusCode = 403;
        return res.send({status: "fail", message: "접근 권한이 없습니다."});
    }

    try {
        const { serverId, groupId } = req.query

        if (req.method === 'DELETE') {
            return res.send({
                status: "success",
                results: await SettingsService.deleteServerByGroup(serverId, groupId)
            })
        }
    } catch (error) {
        console.error(error);
        return res.send({
            status: "error",
            message: "에러가 발생하였습니다."
        })
    }
}

export default withSession(settingsServer)