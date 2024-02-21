const dao = require('./dao')

module.exports = class PhotosDAO extends dao{
    constructor(db) {
        super(db,"Photos")
    }
    delete(id) {
        return this.db.query(`DELETE FROM ${this.tablename} WHERE id=$1`, [id])
    }
    getById(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM Photos WHERE id=$1`, [ id ])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }

    getAll(){
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM Photos`)
                .then(res => resolve(res.rows) )
                .catch(e => reject(e)))
    }

    insert(photos) {
        return this.db.query("INSERT INTO photos(IDuser, url) VALUES ($1,$2)",
            [photos.IDuser, photos.url])
    }

    update(photos) {
        return this.db.query("UPDATE photos SET IDuser=$2,url=$3 WHERE id=$1",
            [photos.id, photos.IDuser, photos.url])
    }
}