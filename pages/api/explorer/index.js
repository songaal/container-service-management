let Client = require('ssh2-sftp-client');
let client = new Client();

async function explorer(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    try {
        client.connect({
            host: '127.0.0.1',
            port: '50000',
            username: 'ysban',
            password: '1234'
          }).then(() => {
            return client.append(req.body, '/abc.txt');
          }).then((data) => {
            return client.end();
          }).catch(err => {
            console.log(err, 'catch error');
          })
    } catch (error) {
        console.error(error);
        res.send({
            status: "error",
            message: "에러가 발생하였습니다.",
            error: JSON.stringify(error)
        })
    }
}

export default explorer