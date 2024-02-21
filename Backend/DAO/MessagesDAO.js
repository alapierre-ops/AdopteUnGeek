const dao = require('./dao')

module.exports = class MessagesDAO extends dao{
    constructor(db) {
        super(db,"Messages")
    }
    delete(id) {
        return this.db.query(`DELETE FROM ${this.tablename} WHERE id=$1`, [id])
    }
    getById(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM Messages WHERE id=$1`, [ id ])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }

    getAll(){
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM Messages`)
                .then(res => resolve(res.rows) )
                .catch(e => reject(e)))
    }

    insert(messages) {
        return this.db.query("INSERT INTO messages(date, content, IDuser1, IDuser2) VALUES ($1,$2,$3,$4)",
            [messages.date, messages.content, messages.IDuser1, messages.IDuser2])
    }

    update(messages) {
        return this.db.query("UPDATE messages SET date=$2,content=$3,IDuser1=$4,IDuser1=$5 WHERE id=$1",
            [messages.id, messages.date, messages.content, messages.IDuser1, messages.IDuser2])
    }
}