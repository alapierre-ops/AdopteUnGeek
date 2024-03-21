const InteractionsDAO = require("../DAO/InteractionsDAO")

module.exports = class InteractionsService {
    constructor(db) {
        this.dao = new InteractionsDAO(db)
    }
    isValid(interactions) {
        return true
    }
}