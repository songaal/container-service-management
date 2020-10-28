const Client = require('ssh2').Client;

class SshClient {
    constructor(ip, port, username, password) {
        this.ip = ip;
        this.port = port;
        this.username = username;
        this.password = password;
    }
    async exec(cmd, { readTimeout = 3000 } = {}) {
        return new Promise((resolve, reject) => {
            const conn = new Client();
            let result = {
                stdout: [],
                stderr: []
            }
            conn.on('error', function (err) {
                reject({
                    status: "error",
                    message: err['message']||err
                })
            })
            conn.on('ready', function() {
                conn.exec(cmd, function(err, stream) {
                    if (err) reject(({
                        status: "error",
                        message: err['message']||err
                    }));
                    stream.on('end', function(code, signal) {
                        conn.end();
                        resolve(result);
                    }).on('data', function(data) {
                        console.log('STDOUT: ' + data);
                        result['stdout'].push(String(data));
                    }).stderr.on('data', function(data) {
                        console.log('STDERR: ' + data);
                        result['stderr'].push(String(data));
                    });
                });
            }).connect({
                host: this.ip,
                port: this.port,
                username: this.username,
                password: this.password
            });

        })
    }
}

export default SshClient;
