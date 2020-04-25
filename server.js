const HOST = process.env.HOST
const PORT = process.env.PORT || 6060

const app = require('./app')

// Here is a strange problem with windows 10 (listen EACCES: permission denied localhost)
if (HOST) {
    app.listen(HOST, PORT, () => {
        console.log(`File server is listening on ${HOST}:${PORT}`)
    })
} else {
    app.listen(PORT, () => {
        console.log(`File server is listening on port ${PORT}`)
    })
}