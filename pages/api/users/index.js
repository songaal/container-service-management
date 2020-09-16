import UserService from "../../../services/UserService"

export default async (req, res) => {
    try {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'POST') {
            // 사용자 추가.
            const result = await UserService.newUser(JSON.parse(req.body));
            res.end(JSON.stringify(result))
        } else {
            res.statusCode = 404;
            res.end()
        }
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify(error))
    }
}

