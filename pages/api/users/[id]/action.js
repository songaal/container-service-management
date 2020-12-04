import UserService from "../../../../services/UserService"
import JsonUtil from "../../../../utils/JsonUtil";

export default async (req, res) => {
    try {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'PUT') {
            if (req.query['type'] && req.query['type'] === 'resetPassword') {
                await UserService.resetPassword(req.query['id']);
                res.send({
                    status: "success"
                })
            } else if (req.query['type'] && req.query['type'] === 'updatePassword') {

                const body = JsonUtil.parse(req.body);
                const result = await UserService.updatePassword(req.query['id'], body['password'], body['updatePassword']);
                res.send(result)
            } else {
                res.statusCode = 400;
            }
        } else {
            res.statusCode = 404;
            res.end()
        }
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify(error))
    }
}

