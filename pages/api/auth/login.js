import React from 'react';
import fetch from "isomorphic-unfetch";
import { withSession } from 'next-session';
import AuthService from "../../../services/AuthService";
import JsonUtil from "../../../utils/JsonUtil";
import { logger } from '../../../utils/Winston'

async function login(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')

    if (req.method !== "POST") {
        res.statusCode = 405;
        res.end()
    }
    try {
        logger.log('debug', '로그인 요청', req.body)
        let requestLogin = JsonUtil.parse(req.body);
        const auth = await AuthService.login(requestLogin['userId'], requestLogin['password']);

        if(auth['status'] === 'success') {
            req.session.auth = auth;
        }
        res.send(auth);
    } catch (error) {
        console.error(error)
        res.send(error)
    }
}

export default withSession(login)