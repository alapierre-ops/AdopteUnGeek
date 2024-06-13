const jwt = require('jsonwebtoken')

module.exports = (app, svc, jwtFunc) => {

    app.get("/api/users/:id", jwtFunc.validateJWT, async (req, res) => {
        try {
            const user = await svc.usersDAO.getById(req.params.id);
            if (user === undefined) {
                return res.status(404).end();
            }
            return res.json(user);
        } catch (e) {
            console.error(e);
            res.status(400).end();
        }
    });

    /*app.delete("/api/users/:id", jwtFunc.validateJWT, async (req, res) => {
        if(isNaN(req.params.id)){
            return res.status(400).end();
        }
        const users = await svc.usersDAO.getById(req.params.id);
        if (users === undefined) {
            return res.status(404).end();
        }
        svc.usersDAO.delete(req.params.id)
            .then(() => res.status(200).end())
            .catch(e => {
                console.error(e);
                res.status(500).end();
            });
    });*/

    app.put("/api/users", jwtFunc.validateJWT, async (req, res) => {
        const users = req.body;
        if ((users.id === undefined) || (users.id == null) || (!svc.isValid(users))) {
            return res.status(400).end();
        }
        if (await svc.usersDAO.getById(users.id) === undefined) {
            return res.status(404).end();
        }
        svc.usersDAO.update(users)
            .then(() => res.status(200).end())
            .catch(e => {
                console.error(e);
                res.status(500).end();
            });
    });

    app.post("/api/users/auth/verify", async (req, res) => {
        const token = req.body.token;
        console.log("token being verified: " + token);
        if (!token) {
            return res.status(400).json({ message: "Token is missing" });
        }

        try {
            const decoded = jwt.verify(token, "secretKey");
            const userId = decoded.userId;
            console.log("verify : userId = " + userId);
            return res.status(200).json({ message: "Token is valid", decoded, userId });
        } catch (error) {
            console.error("Error verifying token:", error);
            return res.status(401).json({ message: "Token is invalid" });
        }
    });

    app.post("/api/users/auth/login", async (req, res) => {
        const { email, password } = req.body;
        console.log('back logIn');
        try {
            const response = await svc.usersDAO.authenticate(email, password);
            if (response.err === "404") {
                return res.status(404).json({ message: "Aucun utilisateur avec cette adresse email" });
            }
            else if (response.err === "401") {
                return res.status(401).json({ message: "Identifiants invalides" });
            }
            if (!response.err) {
                console.log("usersAPI res: " + response.token);
                return res.status(200).json({ message: "Connexion réussie", user: response.user, token: response.token });
            }
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Erreur interne, veuillez réessayer plus tard" });
        }
    });

    app.post("/api/users/auth/signup", async (req, res) => {
        const { nickname, email, password } = req.body;

        if(!nickname || !email || !password) {
            return res.status(400).end();
        }
        try {
            const existingUser = await svc.usersDAO.getByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: "Un compte existe déjà avec cette adresse mail. Veuillez vous connecter." });
            }
            await svc.usersDAO.signUp(nickname, email, password);
            const newUser = await svc.usersDAO.getByEmail(email);
            const token = svc.generateToken(newUser.id);
            return res.status(201).json({ message: "Votre compte a été créé avec succès.", token, id: newUser.id });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Erreur interne, veuillez réessayer plus tard." });
        }
    });

    app.patch("/api/users/:id", jwtFunc.validateJWT, async (req, res) => {
        const userId = req.params.id;
        const userData = req.body;

        if (!userId || !svc.isValid(userData)) {
            return res.status(400).end();
        }

        const existingUser = await svc.usersDAO.getById(userId);
        if (!existingUser) {
            return res.status(404).end();
        }

        const updatedUser = { ...existingUser, ...userData };
        svc.usersDAO.update(userId, updatedUser)
            .then(() => res.status(204).end())
            .catch(e => {
                console.error(e);
                res.status(500).end();
            });
    });
}