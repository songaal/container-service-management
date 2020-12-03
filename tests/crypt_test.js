const crypt = require('bcryptjs')



async function test() {
    console.log(await crypt.hash("admin", 12))
    // $2a$12$RJbPhoO4mQ4BR32EY69q2.Sn7M1gf7zRTWGD2xOnStQ7/BIVCVbaK
}


test()
