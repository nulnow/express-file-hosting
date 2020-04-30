const HOST = process.env.HOST
const PORT = process.env.PORT || 6060
const PREFIX = process.env.PREFIX

const app = require('./app')

// Here is a strange problem with windows 10 (listen EACCES: permission denied localhost)

const server = require('express')

if (PREFIX) {
    server.use(PREFIX, app)
} else {
    server.use(app)
}

if (HOST) {
    server.listen(HOST, PORT, () => {
        console.log(`File server is listening on ${HOST}:${PORT}`)
    })
} else {
    server.listen(PORT, () => {
        console.log(`File server is listening on port ${PORT}`)
    })
}