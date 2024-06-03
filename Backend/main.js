const pg = require('pg')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const usersServices = require("./Services/UsersServices")
const interactionsServices = require("./Services/InteractionsServices")
const messagesServices = require("./Services/MessagesServices")
const photosServices = require("./Services/PhotosServices")

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.raw({type: "image/*", limit: "10mb"}))
app.use(cors())
app.use(morgan('dev'));
app.use(cookieParser())

let dsn = process.env.CONNECTION_STRING;
if (dsn === undefined) {
    const {env} = process;
    const read_base64_json = function (varName) {
        try {
            return JSON.parse(Buffer.from(env[varName], "base64").toString())
        } catch (err) {
            throw new Error(`no ${varName} environment variable`)
        }
    };
    const variables = read_base64_json('PLATFORM_VARIABLES')
    dsn = variables["CONNECTION_STRING"]
}

const port = process.env.PORT || 3333
const db = new pg.Pool({ connectionString: dsn })
const usersService = new usersServices(db)
const interactionsService = new interactionsServices(db)
const messagesService = new messagesServices(db)
const photosService = new photosServices(db)
require('./api/UsersAPI')(app, usersService)
require('./api/InteractionsAPI')(app, interactionsService)
require('./api/MessagesAPI')(app, messagesService)
require('./api/PhotosAPI')(app, photosService)
require('dotenv').config();
const seedDatabase = async () => require('./datamodel/seeder')(usersService, interactionsService, messagesService, photosService)
if (require.main === module) {
    seedDatabase().then( () =>
        app.listen(port, () =>
            console.log(`Listening on the port ${port}`)
        )
    )
}

module.exports = { app, seedDatabase, usersService, messagesService }