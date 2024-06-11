
module.exports = (app, svc, jwtFunc) => {

    app.post("/api/interactions/", jwtFunc.validateJWT, (req, res) => {
        const { date, userWhoInteracted, userShown, liked } = req.body;
        svc.dao.addInteraction(date, userWhoInteracted, userShown, liked)
            .then(_ => {
                res.status(200).json({});
            })
            .catch(e => {
                console.log(e);
                res.status(500).end();
            });
    });

    app.put("/api/interactions", jwtFunc.validateJWT, async (req, res) => {
        const interactions = req.body;
        console.log(interactions);
        if ((interactions.id === undefined) || (interactions.id == null)) {
            return res.status(400).end();
        }
        if (await svc.dao.getById(interactions.id) === undefined) {
            return res.status(404).end();
        }
        svc.dao.insertInteraction(interactions)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e);
                res.status(500).end();
            });
    });

    app.post("/api/interactions/nextUser/:id", jwtFunc.validateJWT, async (req, res) => {
        try {
            console.log("nextUser/:id : id == " + req.params.id);
            const currentUser = await svc.usersDAO.getById(req.params.id);

            console.log("shownUserIds == " + req.body);

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

    app.get("/api/interactions/getLikedMe/:id", jwtFunc.validateJWT, async (req, res) => {
        try {
            const users = await svc.dao.getLikedMe(req.params.id);
            if (users === undefined) {
                return res.status(404).end();
            }
            return res.json(users);
        } catch (e) {
            res.status(400).end();
        }
    });

    app.get("/api/interactions/getILiked/:id", jwtFunc.validateJWT, async (req, res) => {
        try {
            const users = await svc.dao.getILiked(req.params.id);
            if (users === undefined) {
                return res.status(404).end();
            }
            return res.json(users);
        } catch (e) {
            res.status(400).end();
        }
    });

    app.get("/api/interactions/getMatches/:id", jwtFunc.validateJWT, async (req, res) => {
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
};