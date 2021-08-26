const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const ScheduleService = require("./services/ScheduleService")

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true)
        // const { pathname, query } = parsedUrl
        handle(req, res, parsedUrl)
    }).listen(3355, (err) => {
        if (err) throw err
        ScheduleService.init()
        console.log('> Ready on http://localhost:3000')
    })
})

/*

"dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js"
//    "dev": "next",
//    "build": "next build",
//    "start": "next start"


 */