const Users = require('../Tables/users')
const Interactions = require('../Tables/interactions')
const Messages = require('../Tables/messages')
const Photos = require('../Tables/photos')

module.exports = (usersService, interactionsService, messagesService, photosService) => {
    return new Promise(async (resolve, reject) => {
        try {
            await interactionsService.dao.db.query("CREATE TABLE interactions(id SERIAL PRIMARY KEY, date DATE, userWhoInteracted INTEGER, userShown INTEGER, liked BOOLEAN )")
            await interactionsService.dao.insert(new Interactions("2000-01-01", "0", "0", false))
            await usersService.dao.db.query("CREATE TABLE users(id SERIAL PRIMARY KEY, nickname TEXT, email TEXT, phoneNumber TEXT, password TEXT, bio TEXT, birthdate DATE, gender TEXT, links TEXT, tags TEXT )")
            for (let i = 0; i < 25; i++) {
                await usersService.dao.insert(new Users("nickname" + i, "email" + i, "060000000" + i, "password" + i, "bio" + i, "2000-01-01", "gender" + i, "links" + i, "tags" + i))
            }
            await photosService.dao.db.query("CREATE TABLE photos(id SERIAL PRIMARY KEY, IDuser TEXT, url TEXT )")
            for (let i = 0; i < 5; i++) {
                await photosService.dao.insert(new Photos("17" + i, "https://t.me/aiodhsuh" + i))
            }
            await messagesService.dao.db.query("CREATE TABLE messages(id SERIAL PRIMARY KEY, IDuser1 TEXT, IDuser2 TEXT, date DATE, content TEXT )")
            for (let i = 0; i < 5; i++) {
                await messagesService.dao.insert(new Messages("17" + i, "22" + i, "2000-01-01", "atyuidofhzvcedrfvgbhjf" + i))
            }
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