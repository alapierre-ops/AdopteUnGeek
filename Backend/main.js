const pg = require('pg')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const morgan = require('morgan')

const usersServices = require("./Services/UsersServices")
const interactionsServices = require("./Services/InteractionsServices")
const messagesServices = require("./Services/MessagesServices")
const photosServices = require("./Services/PhotosServices")

const app = express()
app.use(bodyParser.urlencoded({ extended: false })) // URLEncoded form data
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('dev'));
app.use(cookieParser())

const connectionString = "postgres://user:password@localhost/Projet"
const db = new pg.Pool({ connectionString: connectionString })
const usersService = new usersServices(db)
const interactionsService = new interactionsServices(db)
const messagesService = new messagesServices(db)
const photosService = new photosServices(db)
require('./api/UsersAPI')(app, usersService)
require('./api/InteractionsAPI')(app, interactionsService)
require('./api/MessagesAPI')(app, messagesService)
require('./api/PhotosAPI')(app, photosService)
require('./datamodel/seeder')(usersService, interactionsService, messagesService, photosService)
    .then(app.listen(3333))


