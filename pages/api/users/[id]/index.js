
export default async (req, res) => {
    try {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
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

