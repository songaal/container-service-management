import React from 'react';
import {withSession} from 'next-session';
import AuthService from "../../../services/AuthService";

async function validate(req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200;
    return res.send(await AuthService.validate(req, res))
}

export default withSession(validate)