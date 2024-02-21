const PhotosDAO = require("../DAO/PhotosDAO")

module.exports = class PhotosService {
    constructor(db) {
        this.dao = new PhotosDAO(db)
    }
    isValid(photos) {
        return true
    }
}