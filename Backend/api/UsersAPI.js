const jwt = require('jsonwebtoken')
const {verify} = require("jsonwebtoken");

module.exports = (app, svc) => {
    app.get("/users", async (req, res) => {
        res.json(await svc.dao.getAll())
    })

    app.get("/users/:id", async (req, res) => {
        try {
            const users = await svc.dao.getById(req.params.id)
            if (users === undefined) {
                return res.status(404).end()
            }
            return res.json(users)
        } catch (e) { res.status(400).end() }
    })

    app.post("/users/add", (req, res) => {
        const users = req.body
        if (!svc.isValid(users))  {
            return res.status(400).end()
        }
        svc.dao.insert(users)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.delete("/users/:id", async (req, res) => {
        const users = await svc.dao.getById(req.params.id)
        if (users === undefined) {
            return res.status(404).end()
        }
        svc.dao.delete(req.params.id)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.put("/users", async (req, res) => {
        const users = req.body
        if ((users.id === undefined) || (users.id == null) || (!svc.isValid(users))) {
            return res.status(400).end()
        }
        if (await svc.dao.getById(users.id) === undefined) {
            return res.status(404).end()
        }
        svc.dao.update(users)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.post("/users/auth/verify", async (req, res) => {
        const token = req.body.token;
        console.log("token being verified: " + token)
        if (!token) {
            return res.status(400).json({ message: "Token is missing" });
        }

        try {
            const decoded = jwt.verify(token, "secretKey");
            const userId = decoded.userId
            console.log("verify : userId = " + userId)
            return res.status(200).json({ message: "Token is valid", decoded, userId: userId });
        } catch (error) {
            console.error("Error verifying token:", error);
            return res.status(401).json({ message: "Token is invalid" });
        }
    });

    app.post("/users/auth/login", async (req, res) => {
        const { email, password } = req.body;
        console.log('back logIn')
        try {
            const response = await svc.dao.authenticate(email, password);
            if (response.err === "404") {
                return res.status(404).json({ message: "Aucun utilisateur avec cette adresse email" });
            }
            else if (response.err === "401") {
                return res.status(401).json({ message: "Identifiants invalides" });
            }
            if (!response.err) {
                console.log("usersAPI res: " + response.token)
                return res.status(200).json({message: "Connexion réussie", user: response.user, token: response.token});
            }
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Erreur interne, veuillez réessayer plus tard" });
        }
    });

    app.post("/users/auth/signup", async (req, res) => {
        const { nickname, email, password } = req.body;
        try {
            const existingUser = await svc.dao.getByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: "Un compte existe déjà avec cette adresse mail. Veuillez vous connecter." });
            }
            await svc.dao.signUp(nickname, email, password);
            return res.status(201).json({ message: "Votre compte a été créé avec succès."});
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Erreur interne, veuillez réessayer plus tard." });
        }
    });

    app.get("/users/nextUser/:id", async (req, res) => {
        try {
            console.log("nextUser/:id : id == " +req.params.id)
            const user = await svc.dao.getNext(req.params.id)
            console.log("nextUser/:id == ", user)
            if (!user) {
                console.log("nextUser/:id : user is empty")
                return res.status(301).end()
            }
            if (!user === undefined) {
                console.log("nextUser/:id : user is undefined")
                return res.status(407).end()
            }
            return res.json(user)
        } catch (e) {
            console.log(e)
            res.status(400).end() }
    })

    app.patch("/users/:id", async (req, res) => {
        const userId = req.params.id;
        const userData = req.body;
        if (!userId || !svc.isValid(userData)) {
            return res.status(400).end();
        }
        const existingUser = await svc.dao.getById(userId);
        if (!existingUser) {
            return res.status(404).end();
        }
        const updatedUser = { ...existingUser, ...userData };
        svc.dao.update(userId, updatedUser)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e);
                res.status(500).end();
            });
    });
}
