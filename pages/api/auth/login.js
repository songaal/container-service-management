import React from 'react';

export default async (req, res) => {
    if (req.method === 'POST') {
        const result = await get(req, res);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ name: 'John Doe', msg: result }))
    } else {
        res.statusCode = 404;
        res.end()
    }
}

async function post(req, res) {

}
