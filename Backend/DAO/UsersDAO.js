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

    insert(users) {
        return this.db.query("INSERT INTO users(nickname, email, phoneNumber, password, bio, birthdate, gender, links, tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
            [users.nickname, users.email, users.phoneNumber, users.password, users.bio, users.birthdate, users.gender, users.links, users.tags])
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
        return this.db.query("INSERT INTO users(nickname, email, password) VALUES ($1,$2,$3)",
            [nickname, email, hashedPassword])
    }

    async getNext(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT u.*, p.photo_data
                           FROM users u LEFT JOIN photos p ON u.id = p.user_id
                            WHERE u.id NOT IN (
                            SELECT userShown FROM interactions
                            WHERE userWhoInteracted = $1)
                            AND u.id != $1 AND p.photo_data IS NOT NULL
                            LIMIT 1`, [id])
                .then(res => resolve(res.rows[0]))
                .catch(e => reject(e)))
    }

    async getLikedMe(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT u.*, p.photo_data
                       FROM users u 
                       LEFT JOIN photos p ON u.id = p.user_id
                       WHERE u.id IN (
                           SELECT userWhoInteracted 
                           FROM interactions
                           WHERE userShown = $1
                           AND liked = true
                       )`, [id])
                .then(res => {
                    const filteredUsers = res.rows.map(row => ({
                        id: row.id,
                        nickname: row.nickname,
                        birthdate: row.birthdate
                    }));
                    resolve(filteredUsers);
                })
                .catch(e => reject(e)))
    }

    async getILiked(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT u.*, p.photo_data
                       FROM users u 
                       LEFT JOIN photos p ON u.id = p.user_id
                       WHERE u.id IN (
                           SELECT userShown 
                           FROM interactions
                           WHERE userWhoInteracted = $1
                           AND liked = true
                       )`, [id])
                .then(res => {
                    const filteredUsers = res.rows.map(row => ({
                        id: row.id,
                        nickname: row.nickname,
                        birthdate: row.birthdate
                    }));
                    resolve(filteredUsers);
                })
                .catch(e => reject(e)))
    }

    async getMatches(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT u.*, p.photo_data
                   FROM users u 
                   LEFT JOIN photos p ON u.id = p.user_id
                   WHERE u.id IN (
                       SELECT userShown 
                       FROM interactions
                       WHERE userWhoInteracted = $1
                       AND liked = true
                   )
                   AND u.id IN (
                       SELECT userWhoInteracted 
                       FROM interactions
                       WHERE userShown = $1
                       AND liked = true
                   )`, [id])
                .then(res => {
                    const matchedUsers = res.rows.map(row => ({
                        id: row.id,
                        nickname: row.nickname,
                        birthdate: row.birthdate
                    }));
                    resolve(matchedUsers);
                })
                .catch(e => reject(e)))
    }



    update(id, userData) {
        return this.db.query("UPDATE users SET nickname=$2, email=$3, password=$4, bio=$5, birthdate=$6, gender=$7, links=$8, tags=$9, interestedIn=$10, filter_agemin=$11, filter_agemax=$12, filter_dismax=$13 WHERE id=$1",
            [id, userData.nickname, userData.email, userData.password, userData.bio, userData.birthdate, userData.gender, userData.links, userData.tags, userData.interestedIn, userData.ageMin, userData.ageMax, userData.distance])
    }

    addPhoto(id, photo) {
        return this.db.query("INSERT INTO photos (user_id, photo_data) VALUES ($1, $2)",
            [id, photo])
    }
    updatePhoto(id, photo) {
        return this.db.query("UPDATE photos SET photo_data = $2 WHERE user_id = $1",
            [id, photo])
    }

    getPhotos(id) {
        return new Promise((resolve, reject) =>
            this.db.query(`SELECT photo_data FROM photos WHERE user_id=$1`, [id])
                .then(res => {
                    console.log(res)
                    resolve(res.rows[0].photo_data);
                })
                .catch(e => reject(e))
        );
    }

    deletePhoto(id) {
        return this.db.query(`DELETE FROM photos WHERE user_id=$1`, [id])
    }
}