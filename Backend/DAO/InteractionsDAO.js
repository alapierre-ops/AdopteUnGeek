const dao = require('./dao')

module.exports = class InteractionsDAO extends dao{
    constructor(db) {
        super(db,"interactions")
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

    insert(interactions) {
        return this.db.query("INSERT INTO interactions(userWhoInteracted, userShown, liked, date) VALUES ($1,$2,$3,$4)",
            [interactions.userWhoInteracted, interactions.userShown, interactions.liked, interactions.date])
    }

    update(interactions) {
        return this.db.query("UPDATE interactions SET date=$2,email=$3,IDuser1=$4,IDuser2=$5 WHERE id=$1",
            [interactions.id, interactions.date, interactions.IDuser1, interactions.ID2])
    }
}