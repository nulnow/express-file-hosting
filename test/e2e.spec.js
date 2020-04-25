const path = require('path')
const promiseFs = require('promise-fs')
const fs = require('fs')
const rimraf = require('rimraf')
const axios = require('axios')
const FormData = require('form-data')
const request = require('supertest')
const app = require('../app')

const TEST_FILENAME = 'aYveJSydU-0.jpg'
const TEST_STORAGE_DIR = path.join(__dirname, 'storage')

if (!fs.existsSync(TEST_STORAGE_DIR)){
    fs.mkdirSync(TEST_STORAGE_DIR);
}

const clearTestStorate = async () => {
    const files = await promiseFs.readdir(TEST_STORAGE_DIR)
    for (file of files) {
        rimraf.sync(path.resolve(TEST_STORAGE_DIR, file))
    }
}

describe('Fileserver', () => {
    let app

    beforeAll(async () => {
        await clearTestStorate()
        process.DIR = TEST_STORAGE_DIR
        app = require('../app')
    })

    afterAll(async () => {
        await clearTestStorate()
    })

    it('Sends 404 on /', async () => {
        return request(app)
            .get('/')
            .expect(404)
    })

    it('Uploads image', async () => {
        const imgFileBuffer = await promiseFs.readFile(path.resolve(__dirname, 'img', TEST_FILENAME))
        let url

        await request(app)
            .post('/upload')
            .set('Content-Type', 'multipart/form-data')
            .attach(TEST_FILENAME, imgFileBuffer, TEST_FILENAME)
            .expect(200)
            .expect((result) => {
                expect(result.body[0].url).toBeTruthy()
                expect(result.body[0].guid).toBeTruthy()
                expect(result.body[0].name).toBe(TEST_FILENAME)
                url = result.body[0].url
                return true
            })

        await request(app)
            .get(url)
            .expect(200)
            .expect((result) => {
                return Buffer.compare(imgFileBuffer, result.body)
            })
    })

})