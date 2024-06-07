const dao = require('./dao')

module.exports = class PhotosDAO extends dao{
    constructor(db) {
        super(db,"Photos")
    }
    addPhoto(id, photo) {
        return this.db.query("INSERT INTO photos (user_id, photo_data) VALUES ($1, $2)",
            [id, photo])
    }

    getPhotos(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT photo_data FROM photos WHERE user_id=$1`, [id])
                .then(res => {
                    resolve(res.rows[0].photo_data);
                })
                .catch(e => reject(e))
        );
    }

    deletePhoto(id) {
        return this.db.query(`DELETE FROM photos WHERE user_id=$1`, [id])
    }
}