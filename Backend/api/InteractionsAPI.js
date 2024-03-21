module.exports = (app, svc) => {
    app.get("/interactions", async (req, res) => {
        res.json(await svc.dao.getAll())
    })

    app.get("/interactions/:id", async (req, res) => {
        try {
            const interactions = await svc.dao.getById(req.params.id)
            if (interactions === undefined) {
                return res.status(404).end()
            }
            return res.json(interactions)
        } catch (e) { res.status(400).end() }
    })

    app.post("/interactions/", (req, res) => {
        const interactions = req.body
        if (!svc.isValid(interactions))  {
            return res.status(400).end()
        }
        svc.dao.insert(interactions)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.delete("/interactions/:id", async (req, res) => {
        const interactions = await svc.dao.getById(req.params.id)
        if (interactions === undefined) {
            return res.status(404).end()
        }
        svc.dao.delete(req.params.id)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.put("/interactions", async (req, res) => {
        const interactions = req.body
        console.log(interactions)
        if ((interactions.id === undefined) || (interactions.id == null) || (!svc.isValid(interactions))) {
            return res.status(400).end()
        }
        if (await svc.dao.getById(interactions.id) === undefined) {
            return res.status(404).end()
        }
        svc.dao.update(interactions)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
}
