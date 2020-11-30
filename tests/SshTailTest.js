const SshTail = require("./SshTail")
const Ttl = require("./Ttl")


const ttl = new Ttl({ttl: 5000})
const maxCurrentLine = 10000


new Promise((resolve, reject) => {
    (async () => {
        try {

            let ttlKey = "serverId.groupId.serviceId.logId"

            const tail = new SshTail({
                host:       '172.18.75.12',
                username:   'root',
                password:   'centos',
                mode: 'docker'
            });

            tail.on('stderr', function(data){
                    const value = ttl.get(ttlKey)
                    if (value === null) {
                        ttl.push(ttlKey, [ data ])
                    } else {
                        value.push(data)
                        if (value.length > maxCurrentLine) {
                            ttl.push(ttlKey, value.slice(Math.floor(maxCurrentLine / 2)))
                        } else {
                            ttl.push(ttlKey, value)
                        }
                    }
                })
                .on('stdout', function(data){
                    const value = ttl.get(ttlKey)
                    if (value === null) {
                        ttl.push(ttlKey, [ data ])
                    } else {
                        value.push(data)
                        if (value.length > maxCurrentLine) {
                            ttl.push(ttlKey, value.slice(Math.floor(maxCurrentLine / 2)))
                        } else {
                            ttl.push(ttlKey, value)
                        }
                    }
                })
                // .on('disconnected', function(){console.log('disconnected')})
                // .on('connected',    function(){console.log('connected')})
                // .on('tailing',      function(){console.log('tailing')})
                // .on('eof',          function(signal, code){console.log('EOF:', signal, code)})
                .on('error',        function(error){console.log('ERR:' + error)})

                .start(
                    // ['/var/log/messages']
                    ['064de17fc3e5', "4a6ce6a1c10f", "32632ba3cc1", "2189d345ca", "0ecbe828", "262f2c53", "7e56cc6", "cca78d9cc2", "30e0adbe", "1509c194", "5a01f28", "15d82d5a0"]
                )

            setInterval(() => {
                ttl.get(ttlKey, data => {
                    console.log(data.length, String(data[data.length - 1]))
                })
            }, 5000)

// After 10 seconds stop the tail (and disconnect ssh)
            setTimeout(function(){
                tail.stop();
                console.log("stop!!")
            }, 5 * 60 * 1000);




            // setTimeout(() => {
            //     resolve()
            // }, 20 * 1000)

        } catch(err) {
            reject(err)
        }
    })()
})


