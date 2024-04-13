const UsersDAO = require("../DAO/UsersDAO")
const jwt = require("jsonwebtoken");

module.exports = class UsersService {
    constructor(db) {
        this.dao = new UsersDAO(db)
    }
    isValid(user) {
        return true
    }

    generateToken(userId) {
        return jwt.sign({ userId }, 'secretKey', );
    }
}