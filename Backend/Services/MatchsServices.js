const MatchsDAO = require("../DAO/MatchsDAO")

module.exports = class MatchsService {
    constructor(db) {
        this.dao = new MatchsDAO(db)
    }
    isValid(match) {
        return true
    }
}