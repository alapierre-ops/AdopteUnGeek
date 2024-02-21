module.exports = (app, svc) => {
    app.get("/messages", async (req, res) => {
        res.json(await svc.dao.getAll())
    })
    app.get("/messages/:id", async (req, res) => {
        try {
            const messages = await svc.dao.getById(req.params.id)
            if (messages === undefined) {
                return res.status(404).end()
            }
            return res.json(messages)
        } catch (e) { res.status(400).end() }
    })
    app.post("/messages/", (req, res) => {
        const messages = req.body
        if (!svc.isValid(messages))  {
            return res.status(400).end()
        }
        svc.dao.insert(messages)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
    app.delete("/messages/:id", async (req, res) => {
        const messages = await svc.dao.getById(req.params.id)
        if (messages === undefined) {
            return res.status(404).end()
        }
        svc.dao.delete(req.params.id)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
    app.put("/messages", async (req, res) => {
        const messages = req.body
        console.log(messages)
        if ((messages.id === undefined) || (messages.id == null) || (!svc.isValid(messages))) {
            return res.status(400).end()
        }
        if (await svc.dao.getById(messages.id) === undefined) {
            return res.status(404).end()
        }
        svc.dao.update(messages)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
}
