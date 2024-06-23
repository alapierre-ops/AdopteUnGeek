
module.exports = (app, svc, jwtFunc) => {

    app.get("/api/messages", jwtFunc.validateJWT, async (req, res) => {
        try {
            const messages = await svc.dao.getAll();
            return res.json(messages);
        } catch (e) {
            console.error(e);
            res.status(500).end();
        }
    });

    app.get("/api/messages/:sender_id/:receiver_id", jwtFunc.validateJWT, async (req, res) => {
        try {
            const messages = await svc.dao.getMessages(req.params.sender_id, req.params.receiver_id);
            return res.json(messages);
        } catch (e) {
            console.error(e);
            res.status(400).end();
        }
    });

    app.post("/api/messages/:sender_id/:receiver_id", jwtFunc.validateJWT, async (req, res) => {
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