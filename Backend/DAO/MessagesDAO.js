const dao = require('./dao')

module.exports = class MessagesDAO extends dao{
    constructor(db) {
        super(db,"Messages")
    }
    getMessages(userId1, userId2) {
        return new Promise((resolve, reject) => {
            this.db.query(
                "SELECT * FROM messages WHERE (sender_id = $1::text AND receiver_id = $2::text) OR (sender_id = $2::text AND receiver_id = $1::text)",
                [userId1, userId2]
            )
                .then(res => resolve(res.rows))
                .catch(err => reject(err));
        });
    }

    addMessage(senderID, receiverID, content) {
        const currentDate = new Date().toISOString();
        return new Promise((resolve, reject) => {
            this.db.query(
                "INSERT INTO messages (sender_id, receiver_id, content, sent_at) VALUES ($1::text, $2::text, $3, $4)",
                [senderID, receiverID, content, currentDate]
            )
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }
}