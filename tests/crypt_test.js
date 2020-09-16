const crypt = require('bcryptjs')



async function test() {
    console.log(await crypt.hash("admin", 12))
}


test()
