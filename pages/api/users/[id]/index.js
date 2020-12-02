import UserService from "../../../../services/UserService"

import JsonUtil from "../../../../utils/JsonUtil";
import AuthService from "../../../../services/AuthService";

export default async (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    await AuthService.validate(req, res);

    try {
        if (req.method === 'POST') {
            res.end()
        } else {
            res.statusCode = 404;
            res.end()
        }
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify(error))
    }
}

