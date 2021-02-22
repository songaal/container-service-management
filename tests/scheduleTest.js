const Path = require("path")
const compose = require('docker-compose')
const Client = require('ssh2').Client;


(async () => {
    const path = Path.join("D:\\docker-compose-files", "1", "2")
    const psResult = await compose.ps({
        cwd: path,
        log: false,
        commandOptions: ['-q', '--filter', 'status=Up'],
        env: { DOCKER_HOST: `kube1.danawa.io:30200` }
    })
    if (psResult['exitCode'] === 0 && psResult['out'].split("\n").filter(id => id.length > 0).length === 0) {
        const upResult = await compose.upAll({
            cwd: path,
            log: false,
            env: { DOCKER_HOST: `kube1.danawa.io:30200` }
        })
        console.log('up', upResult)
    } else {
        const downResult = await compose.down({
            cwd: path,
            log: false,
            env: { DOCKER_HOST: `kube1.danawa.io:30200` }
        })
        console.log('down', downResult)
    }
})()

//
// (async () => {
//     const startScripts = "mkdir -p /home/danawa/docker-build/tomcat-metrics-test/hello"
//     const pidCmd = "echo $(" + "ps -ef| grep docker1d|grep -v grep|head -n 1|awk '{print $2}'" + ") && echo 0"
//
//     const conn = new Client();
//     let isStartExec = false;
//     conn.on('ready', function() {
//         conn.exec(pidCmd, function(err, stream) {
//             stream.on('end', function(code, signal) {
//                 conn.end();
//             })
//             stream.stdout.on('data', function(data) {
//                 if (!isStartExec && String(data).split("\n").filter(s => s !== '')[0] === '0') {
//                     isStartExec = true;
//                     conn.exec(startScripts, ()=>{})
//                     console.log("시작 완료")
//                 } else {
//                     console.log("이미 실행 중인 프로세스가 존재합니다.")
//                 }
//             }).stderr.on('data', function(data) {
//                 String(data)
//             })
//         });
//
//     }).connect({
//         host: 'kube1.danawa.io',
//         port: '22',
//         username: "danawa",
//         password: "tkdtndur)!)^kube1",
//         readyTimeout: Number(999999)
//     });
// })()



