const jwt = require("jsonwebtoken");

module.exports = (app, svc) => {

    const validateTokenMiddleware = (req, res, next) => {
        const token = req.headers.authorization.substring(7);
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: Token is missing" });
        }

        try {
            const decoded = jwt.verify(token, "secretKey");
            req.userId = decoded.userId;
            next();
        } catch (error) {
            console.error("Error verifying token:", error);
            return res.status(401).json({ error: "Unauthorized: " + error.message });
        }
    };

    app.get("/messages", validateTokenMiddleware, async (req, res) => {
        try {
            const messages = await svc.dao.getAll();
            return res.json(messages);
        } catch (e) {
            console.error(e);
            res.status(500).end();
        }
    });

    app.get("/messages/:sender_id/:receiver_id", validateTokenMiddleware, async (req, res) => {
        try {
            const messages = await svc.dao.getMessages(req.params.sender_id, req.params.receiver_id);
            console.log("messages/:id1/:id2 == ", messages);
            if (!messages || messages.length === 0) {
                console.log("messages/:id1/:id2 : no messages found");
                return res.status(404).end();
            }
            return res.json(messages);
        } catch (e) {
            console.error(e);
            res.status(400).end();
        }
    });

    app.post("/messages/:sender_id/:receiver_id", validateTokenMiddleware, async (req, res) => {
        const sender_id = req.params.sender_id;
        const receiver_id = req.params.receiver_id;
        const content = req.body.content;

        if (!content) {
            return res.status(400).json({ error: 'Content is missing' });
        }

        if (isNaN(sender_id) || isNaN(receiver_id)) {
            return res.status(400).json({ error: 'Invalid user IDs' });
        }

        try {
            await svc.dao.addMessage(sender_id, receiver_id, content);
            res.status(204).end();
        } catch (e) {
            console.error(e);
            res.status(500).end();
        }
    });
}