import React from 'react';
import {withSession} from 'next-session';

async function logout(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')

    delete req.session['auth']

    res.send({});
}

export default withSession(logout)