module.exports = (app, svc) => {
    app.get("/messages", async (req, res) => {
        res.json(await svc.dao.getAll())
    })

    app.get("/messages/:sender_id/:receiver_id", async (req, res) => {
        try {
            const messages = await svc.dao.getMessages(req.params.sender_id, req.params.receiver_id)
            console.log("messages/:id1/:id2 == ", messages)
            if (!messages) {
                console.log("messages/:id1/:id2 : no messages found")
                return res.status(301).end()
            }
            return res.json(messages)
        } catch (e) {
            console.log(e)
            res.status(400).end() }
    })

    app.post("/messages/:sender_id/:receiver_id", async (req, res) => {
        const sender_id = req.params.sender_id;
        const receiver_id = req.params.receiver_id;
        const content = req.body.content

        svc.dao.addMessage(sender_id, receiver_id, content)
            .then(_ => res.status(204).end())
            .catch(e => {
                console.log(e);
                res.status(500).end();
            })
    });
}
