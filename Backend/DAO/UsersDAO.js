const dao = require('./dao')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = class UsersDAO extends dao {
    constructor(db) {
        super(db, "Users")
    }

    delete(id) {
        return this.db.query(`DELETE FROM ${this.tablename} WHERE id=$1`, [id])
    }

    getById(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM Users WHERE id=$1`, [id])
                .then(res => resolve(res.rows[0]))
                .catch(e => reject(e)))
    }

    getByEmail(email) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM Users WHERE email=$1`, [email])
                .then(res => resolve(res.rows[0]))
                .catch(e => reject(e)))
    }

    getAll() {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM Users`)
                .then(res => resolve(res.rows))
                .catch(e => reject(e)))
    }


    async authenticate(email, password) {
        console.log("Authenticate: " + email + " " + password)
        const userRecord = await this.db.query(`SELECT * FROM Users WHERE email=$1`, [email]);
        if (userRecord.rows.length === 0) {
            console.log("Authenticate: no user with this email")
            return {err: "404"};
        }
        console.log("Authenticate: user found")

        const hashedPassword = userRecord.rows[0].password;
        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
        if (isPasswordCorrect) {
            console.log("isPasswordCorrect: correct password")
            const token = jwt.sign({userId: userRecord.rows[0].id}, "secretKey");
            console.log("Authenticate: back token : " + token)
            return {user: userRecord.rows[0], token: token};
        } else {
            console.log("isPasswordCorrect: incorrect password")
            return {err: "401"};
        }
    }

    async signUp(nickname, email, password) {
        console.log('backend' + password)
        const hashedPassword = await bcrypt.hash(password, 10)
        await this.db.query("INSERT INTO users(nickname, email, password) VALUES ($1,$2,$3)",
            [nickname, email, hashedPassword])
    }

    update(id, userData) {
        return this.db.query("UPDATE users SET nickname=$2, email=$3, password=$4, bio=$5, birthdate=$6, gender=$7, tags=$8, interestedIn=$9, filter_agemin=$10, filter_agemax=$11, filter_dismax=$12, city=$13 WHERE id=$1",
            [id, userData.nickname, userData.email, userData.password, userData.bio, userData.birthdate, userData.gender, userData.tags, userData.interestedIn, userData.ageMin, userData.ageMax, userData.distance, userData.city])
    }
}