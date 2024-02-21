module.exports = (app, svc) => {
    app.get("/photos", async (req, res) => {
        res.json(await svc.dao.getAll())
    })
    app.get("/photos/:id", async (req, res) => {
        try {
            const photos = await svc.dao.getById(req.params.id)
            if (photos === undefined) {
                return res.status(404).end()
            }
            return res.json(photos)
        } catch (e) { res.status(400).end() }
    })
    app.post("/photos/", (req, res) => {
        const photos = req.body
        if (!svc.isValid(photos))  {
            return res.status(400).end()
        }
        svc.dao.insert(photos)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
    app.delete("/photos/:id", async (req, res) => {
        const photos = await svc.dao.getById(req.params.id)
        if (photos === undefined) {
            return res.status(404).end()
        }
        svc.dao.delete(req.params.id)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
    app.put("/photos", async (req, res) => {
        const photos = req.body
        console.log(photos)
        if ((photos.id === undefined) || (photos.id == null) || (!svc.isValid(photos))) {
            return res.status(400).end()
        }
        if (await svc.dao.getById(photos.id) === undefined) {
            return res.status(404).end()
        }
        svc.dao.update(photos)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
}
