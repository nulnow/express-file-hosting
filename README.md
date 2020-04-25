# File hosting

## Install
    git clone https://github.com/nulnow/express-file-hosting.git
    cd express-file-hosting
    npm install

## Run the app

    npm start

## Run the app (dev mode)

    npm run start:dev

## Admin panel
Run the app in dev mode

    npm run start:dev

Navigate to the http://localhost:6060/

<img src="https://github.com/nulnow/express-file-hosting/blob/master/test/img/screenshot.png?raw=true" alt="admin panel" />

## Run the tests

    npm test

# API

The API to the app is described below.

## Upload a files

### Request

`POST /upload`

    curl -F ‘data=@path/to/local/file’ http://localhost:6060/upload

### Response

    [{
        url: <url>,
        guid: <guid>,
        name: <name>
    }]

## Get a file

### Request

`GET /download/<guid>[/<filename>]`

    curl http://localhost:6060/download/<guid>[/<filename>] --output file.jpg

### Response

    <File body>

