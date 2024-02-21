const MessagesDAO = require("../DAO/MessagesDAO")

module.exports = class MessagesService {
    constructor(db) {
        this.dao = new MessagesDAO(db)
    }
    isValid(message) {
        return true
    }
}