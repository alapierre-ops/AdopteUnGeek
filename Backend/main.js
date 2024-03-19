const pg = require('pg')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const morgan = require('morgan')

const usersServices = require("./Services/UsersServices")
const matchsServices = require("./Services/MatchsServices")
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
const matchsService = new matchsServices(db)
const messagesService = new messagesServices(db)
const photosService = new photosServices(db)
require('./api/UsersAPI')(app, usersService)
require('./api/MatchsAPI')(app, matchsService)
require('./api/MessagesAPI')(app, messagesService)
require('./api/PhotosAPI')(app, photosService)
require('./datamodel/seeder')(usersService, matchsService, messagesService, photosService)
    .then(app.listen(3333))


