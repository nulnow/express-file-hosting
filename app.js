require('dotenv').configure()
const path = require('path')
const promiseFs = require('promise-fs')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const rimraf = require('rimraf')
const morgan = require('morgan')

const DIR = process.env.DIR || path.resolve(__dirname, 'storage')
const NODE_ENV = process.env.NODE_ENV || 'poroduction'
const PREFIX = process.env.PREFIX || '/files'

if (!fs.existsSync(DIR)){
    fs.mkdirSync(DIR);
}

const app = express()
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

const makeGuid = () => `${Math.random()}`.replace('0.', '')
const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = async (source) => {
   return (await  promiseFs.readdir(source)).map(name => path.join(source, name)).filter(isDirectory)
}
const makeLink = (guid, filename) => {
    if (filename) {
        return `${PREFIX || ''}/download/${guid}/${filename}`
    } else {
        return `${PREFIX || ''}/download/${guid}`
    }
}

app.use(cors())

app.post('/upload', fileUpload(), async (req, res) => {
    const files = Object.values(req.files)
    const response = []
    for (file of files) {
        const guid = makeGuid()
        const filename = file.name
        await promiseFs.mkdir(path.resolve(DIR, guid))
        await file.mv(path.resolve(DIR, guid, filename))
        response.push({
            url: makeLink(guid, filename),
            guid,
            name: filename,
        })
    }
    return res.json(response)
})

app.use('/download/:guid', async (req, res) => {
    try {
        const files = await promiseFs.readdir(path.resolve(DIR, req.params.guid))
        res.sendFile(path.resolve(DIR, req.params.guid, files[0]))
    } catch (e) {
        console.error(e)
        res.status(404)
        res.sendFile(path.resolve(__dirname, '404.html'))
    }
})

// if (NODE_ENV !== 'production' && NODE_ENV !== 'test') {
    app.set('view engine', 'ejs')
    app.get('/', async (req, res) => {
        res.render('index', {
            linksCount: await (async () => {
                try {
                    const dirsLength = (await promiseFs.readdir(path.resolve(__dirname, DIR))).length
                    return dirsLength
                } catch (e) {
                    console.error(e)
                    return 'error'
                }
            })(),
            links: await (async () => {
                try {
                    const dirs = await promiseFs.readdir(path.resolve(__dirname, DIR))
                    const links = dirs.map(dir => ({
                        guid: dir,
                        url: makeLink(dir),
                    }))
                    return links
                } catch (e) {
                    console.error(e)
                    return 'error'
                }
            })(),
        })
    })
    app.use('/frontend', express.static('frontend'))
    app.get('/all-links', async (req, res) => {

        const dirs = await getDirectories(DIR)
        res.json(dirs)
    })
    app.post('/delete-all', async (req, res) => {
        const files = await promiseFs.readdir(path.resolve(__dirname, DIR))
        for (file of files) {
            rimraf.sync(path.resolve(__dirname, DIR, file))
        }
        res.sendStatus(200)
    })
    app.post('/delete/:guid', async (req, res) => {
        try {
            rimraf.sync(path.resolve(DIR, req.params.guid))
            res.sendStatus(200)
        } catch (e) {
            console.error(e)
            res.status(404)
            res.sendFile(path.resolve(__dirname, '404.html'))
        }
    })
// }

app.use('*', (req, res) => {
    res.status(404)
    res.sendFile(path.resolve(__dirname, '404.html'))
})

module.exports = app