const Client = require('ssh2').Client;

class SshClient {
    constructor(ip, port, username, password) {
        this.ip = ip;
        this.port = port;
        this.username = username;
        this.password = password;
    }
    async exec(cmd, { timeout = 5000 } = {}) {
        return new Promise((resolve, reject) => {
            const conn = new Client();
            let result = []
            conn.on('error', function (err) {
                console.log("error:", err)
                reject({
                    status: "error",
                    message: err['message']||err
                })
            })
            conn.on('ready', function() {
                console.log("Exec: ", cmd)
                conn.exec(cmd, function(err, stream) {
                    if (err) reject(({
                        status: "error",
                        message: err['message']||err
                    }));
                    stream.on('end', function(code, signal) {
                        conn.end();
                    }).stdout.on('data', function(data) {
                        result.push("STDOUT: " + String(data));
                    }).stderr.on('data', function(data) {
                        result.push("STDERR: " + String(data));
                    });
                });
            }).on("error", function(err) {
                reject({
                    status: "error",
                    message: err['message']||err
                })
            }).on("close", function() {
                resolve(result);
            }).connect({
                host: this.ip,
                port: this.port,
                username: this.username,
                password: this.password,
                readyTimeout: timeout
            });
        })
    }
}

export default SshClient;
