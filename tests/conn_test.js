const Connection = require('ssh2');

let conn = new Connection();
conn.host = '192.168.29.28';
conn.port = 22;
conn.username = 'root';
conn.password = 'centos';

conn.on('ready', function() {
    console.log('Connection :: ready');
    conn.exec('uptime --help', function(err, stream) {
        if (err) throw err;
        stream.on('close', function(code, signal) {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
        }).on('data', function(data) {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', function(data) {
            console.log('STDERR: ' + data);
        });
    });
})
conn.on('error', function(err) {
    console.log('Connection :: error :: ' + err);
});
conn.on('close', function() {
    console.log('Connection :: close');
});
conn.connect({
    host: conn.host,
    port: conn.port,
    username: conn.username,
    password: conn.password
});