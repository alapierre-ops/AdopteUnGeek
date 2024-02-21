const UsersDAO = require("../DAO/UsersDAO")

module.exports = class UsersService {
    constructor(db) {
        this.dao = new UsersDAO(db)
    }
    isValid(user) {
        return true
    }
}