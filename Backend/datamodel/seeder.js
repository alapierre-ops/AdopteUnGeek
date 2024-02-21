const Users = require('../Tables/users')
const Matchs = require('../Tables/matchs')
const Messages = require('../Tables/messages')
const Photos = require('../Tables/photos')

module.exports = (usersService, matchsService, messagesService, photosService) => {
    return new Promise(async (resolve, reject) => {
        try {
            await usersService.dao.db.query("CREATE TABLE users(id SERIAL PRIMARY KEY, nickname TEXT, email TEXT, phoneNumber TEXT, password TEXT, bio TEXT, birthdate DATE, gender TEXT, links TEXT, tags TEXT )")
            for (let i = 0; i < 5; i++) {
                await usersService.dao.insert(new Users("nickname" + i, "email" + i, "060000000" + i, "password" + i, "bio" + i, "2000-01-01", "gender" + i, "links" + i, "tags" + i))
            }
            await matchsService.dao.db.query("CREATE TABLE matchs(id SERIAL PRIMARY KEY, date DATE, IDuser1 TEXT, IDuser2 TEXT )")
            for (let i = 0; i < 5; i++) {
                await matchsService.dao.insert(new Matchs("2000-01-01", "17" + i, "22" + i))
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