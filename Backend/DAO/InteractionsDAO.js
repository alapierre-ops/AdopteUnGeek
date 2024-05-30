const dao = require('./dao')

module.exports = class InteractionsDAO extends dao{
    constructor(db) {
        super(db,"interactions")
    }

    insert(interactions) {
        return this.db.query("INSERT INTO interactions(date, userWhoInteracted, userShown, liked) VALUES ($1,$2,$3,$4)",
            [interactions.date, interactions.userWhoInteracted, interactions.userShown, interactions.liked])
    }

    add(date, userWhoInteracted, userShown, liked) {
        return this.db.query("INSERT INTO interactions(date, userWhoInteracted, userShown, liked) VALUES ($1,$2,$3,$4)",
            [date, userWhoInteracted, userShown, liked])
    }

    async getNext(user, shownUserIds) {
        let interestedInClause = '';

        if (user.interestedin !== 'both') {
            interestedInClause = `AND u.gender = '${user.interestedin}'`;
        }

        return new Promise((resolve, reject) =>
            this.db.query(`SELECT u.*, p.photo_data
                   FROM users u
                   LEFT JOIN photos p ON u.id = p.user_id
                   WHERE u.id NOT IN (
                       SELECT userShown FROM interactions
                       WHERE userWhoInteracted = $1
                   )
                   AND u.id != $1
                   AND u.id NOT IN (${(shownUserIds || []).map((_, i) => `$${i + 5}`).join(', ')})
                   AND p.photo_data IS NOT NULL
                   AND DATE_PART('year', AGE(u.birthdate)) >= $2
                   AND DATE_PART('year', AGE(u.birthdate)) <= $3
                   ${interestedInClause}
                   AND (u.interestedin = 'both' OR u.interestedin = $4)
                   LIMIT 1`, [user.id, user.filter_agemin, user.filter_agemax, user.gender, ...shownUserIds])
                .then(res => resolve(res.rows[0]))
                .catch(e => reject(e))
        );
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
            this.db.query(`
            SELECT u.*, p.photo_data, MAX(m.sent_at) as last_message_date
            FROM users u
            LEFT JOIN photos p ON u.id = p.user_id
            LEFT JOIN messages m ON (m.sender_id = u.id OR m.receiver_id = u.id)
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
            )
            GROUP BY u.id, p.photo_data
            ORDER BY last_message_date DESC NULLS LAST
        `, [id])
                .then(res => {
                    const matchedUsers = res.rows.map(row => ({
                        id: row.id,
                        nickname: row.nickname,
                        birthdate: row.birthdate,
                        lastMessageDate: row.last_message_date
                    }));
                    resolve(matchedUsers);
                })
                .catch(e => reject(e))
        );
    }
}