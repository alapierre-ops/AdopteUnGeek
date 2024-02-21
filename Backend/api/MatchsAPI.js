module.exports = (app, svc) => {
    app.get("/matchs", async (req, res) => {
        res.json(await svc.dao.getAll())
    })
    app.get("/matchs/:id", async (req, res) => {
        try {
            const matchs = await svc.dao.getById(req.params.id)
            if (matchs === undefined) {
                return res.status(404).end()
            }
            return res.json(matchs)
        } catch (e) { res.status(400).end() }
    })
    app.post("/matchs/", (req, res) => {
        const matchs = req.body
        if (!svc.isValid(matchs))  {
            return res.status(400).end()
        }
        svc.dao.insert(matchs)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
    app.delete("/matchs/:id", async (req, res) => {
        const matchs = await svc.dao.getById(req.params.id)
        if (matchs === undefined) {
            return res.status(404).end()
        }
        svc.dao.delete(req.params.id)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
    app.put("/matchs", async (req, res) => {
        const matchs = req.body
        console.log(matchs)
        if ((matchs.id === undefined) || (matchs.id == null) || (!svc.isValid(matchs))) {
            return res.status(400).end()
        }
        if (await svc.dao.getById(matchs.id) === undefined) {
            return res.status(404).end()
        }
        svc.dao.update(matchs)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
}
