let Client = require('ssh2-sftp-client');
let sftp = new Client();

// 연결 및 조회
sftp.connect({
  host: '127.0.0.1',
  port: '50000',
  username: 'ysban',
  password: '1234'
}).then(() => {
  return sftp.list('/home');
}).then(data => {
  console.log(data, 'the data info');
}).catch(err => {
  console.log(err, 'catch error');
});