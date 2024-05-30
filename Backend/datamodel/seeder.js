const Users = require('../Tables/users')
const Interactions = require('../Tables/interactions')
const Messages = require('../Tables/messages')
const Photos = require('../Tables/photos')

module.exports = (usersService, interactionsService, messagesService, photosService) => {
    return new Promise(async (resolve, reject) => {
        try {
            await interactionsService.dao.db.query("CREATE TABLE interactions(id SERIAL PRIMARY KEY, date DATE, userWhoInteracted INTEGER, userShown INTEGER, liked BOOLEAN )")
            await usersService.dao.db.query("CREATE TABLE users(id SERIAL PRIMARY KEY, nickname TEXT, email TEXT, password TEXT, bio TEXT, birthdate DATE, gender TEXT, tags TEXT )")
            await photosService.dao.db.query("CREATE TABLE photos(id SERIAL PRIMARY KEY, user_id TEXT, photo_data bytea )")
            await messagesService.dao.db.query("CREATE TABLE messages(id SERIAL PRIMARY KEY, sender_id TEXT, receiver_id TEXT, sent_at DATE, content TEXT )")
            resolve()
        } catch (e) {
            if (e.code === "42P07") { // TABLE ALREADY EXISTS https://www.postgresql.org/docs/8.2/errcodes-appendix.html
                resolve()
            } else {
                reject(e)
            }
        }
    })
}