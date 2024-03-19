const dao = require('./dao')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = class UsersDAO extends dao{
    constructor(db) {
        super(db,"Users")
    }
    delete(id) {
        return this.db.query(`DELETE FROM ${this.tablename} WHERE id=$1`, [id])
    }
    getById(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM Users WHERE id=$1`, [ id ])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }
    getByEmail(email) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM Users WHERE email=$1`, [ email ])
                .then(res => resolve(res.rows[0]) )
                .catch(e => reject(e)))
    }
    getAll(){
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT * FROM Users`)
                .then(res => resolve(res.rows) )
                .catch(e => reject(e)))
    }

    insert(users) {
        return this.db.query("INSERT INTO users(nickname, email, phoneNumber, password, bio, birthdate, gender, links, tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
            [users.nickname, users.email, users.phoneNumber, users.password, users.bio, users.birthdate, users.gender, users.links, users.tags])
    }

    update(users) {
        return this.db.query("UPDATE users SET nickname=$2,email=$3,phoneNumber=$4,password=$5,bio=$6,birthdate=$7,gender=$8,links=$9,tags=$10 WHERE id=$1",
            [users.id, users.nickname, users.email, users.phoneNumber, users.password, users.bio, users.birthdate, users.gender, users.links, users.tags])
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
            const token = jwt.sign({ userId: userRecord.rows[0].id }, "secretKey");
            console.log("Authenticate: back token : " + token)
            return { user: userRecord.rows[0], token: token};
        } else {
            console.log("isPasswordCorrect: incorrect password")
            return {err: "401"};
        }
    }

    async signUp(nickname, email, password) {
        console.log('backend' + password)
        const hashedPassword = await bcrypt.hash(password,10)
        return this.db.query("INSERT INTO users(nickname, email, password) VALUES ($1,$2,$3)",
            [nickname, email, hashedPassword])
    }

    async verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, 'your-secret-key', (err, decoded) => {
                if (err) {
                    reject(err); // Token verification failed
                } else {
                    resolve(decoded); // Token verification successful, decoded contains payload
                }
            });
        });
    }
}