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
        const { date, userWhoInteracted, userShown, liked } = req.body;
        svc.dao.add(date, userWhoInteracted, userShown, liked)
            .then(_ => {
                res.status(200).json({});
            })
            .catch(e => {
                console.log(e);
                res.status(500).end();
            });
    });

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
        if ((interactions.id === undefined) || (interactions.id == null)) {
            return res.status(400).end()
        }
        if (await svc.dao.getById(interactions.id) === undefined) {
            return res.status(404).end()
        }
        svc.dao.insert(interactions)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.post("/users/nextUser/:id", async (req, res) => {
        try {
            console.log("nextUser/:id : id == " + req.params.id);
            const currentUser = await svc.dao.getById(req.params.id);

            console.log("shownUserIds == " + req.body)

            const user = await svc.dao.getNext(currentUser, req.body);
            console.log("nextUser/:id == ", user);
            if (!user) {
                console.log("nextUser/:id : user is empty");
                return res.status(301).end();
            }
            if (!user === undefined) {
                console.log("nextUser/:id : user is undefined");
                return res.status(407).end();
            }
            return res.json(user);
        } catch (e) {
            console.log(e);
            res.status(400).end();
        }
    });

    app.get("/users/getLikedMe/:id", async (req, res) => {
        try {
            const users = await svc.dao.getLikedMe(req.params.id)
            if (users === undefined) {
                return res.status(404).end()
            }
            return res.json(users)
        } catch (e) { res.status(400).end() }
    })

    app.get("/users/getILiked/:id", async (req, res) => {
        try {
            const users = await svc.dao.getILiked(req.params.id)
            if (users === undefined) {
                return res.status(404).end()
            }
            return res.json(users)
        } catch (e) { res.status(400).end() }
    })

    app.get("/users/getMatches/:id", async (req, res) => {
        try {
            const users = await svc.dao.getMatches(req.params.id);
            if (!users) {
                return res.status(404).end();
            }
            return res.json(users);
        } catch (e) {
            console.error(e);
            res.status(400).end();
        }
    });
}
