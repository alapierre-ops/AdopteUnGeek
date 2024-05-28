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

console.log(process.env.CONNECTION_STRING)
const dsn = process.env.CONNECTION_STRING
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
require('./datamodel/seeder')(usersService, interactionsService, messagesService, photosService)
    .then(app.listen(3333))


