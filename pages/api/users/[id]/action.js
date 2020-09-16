import UserService from "../../../../services/UserService"

export default async (req, res) => {
    try {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'PUT') {
            if (req.query['type'] && req.query['type'] === 'resetPassword') {
                UserService.resetPassword(req.query['id']);
                res.end()
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

