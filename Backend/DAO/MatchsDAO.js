const dao = require('./dao')

module.exports = class MatchsDAO extends dao{
    constructor(db) {
        super(db,"matchs")
    }
    delete(id) {
        return this.db.query(`DELETE FROM ${this.tablename} WHERE id=$1`, [id])
    }
    getById(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM ${this.tablename} WHERE id=$1`, [ id ])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }

    getAll(){
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM ${this.tablename}`)
                .then(res => resolve(res.rows) )
                .catch(e => reject(e)))
    }

    insert(matchs) {
        return this.db.query("INSERT INTO matchs(date, IDuser1, IDuser2) VALUES ($1,$2,$3)",
            [matchs.date, matchs.IDuser1, matchs.IDuser2])
    }

    update(matchs) {
        return this.db.query("UPDATE matchs SET date=$2,email=$3,IDuser1=$4,IDuser2=$5 WHERE id=$1",
            [matchs.id, matchs.date, matchs.IDuser1, matchs.ID2])
    }
}