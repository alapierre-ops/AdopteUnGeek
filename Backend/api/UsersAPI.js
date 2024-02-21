const jwt = require('jsonwebtoken')

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
            return res.status(200).json({ message: "Token is valid", decoded });
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
            if (!response.user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            console.log("usersAPI res: " + response.token)
            return res.status(200).json({ message: "Login successful", user: response.user, token: response.token });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

    app.post("/users/auth/signup", async (req, res) => {
        const { nickname, email, password } = req.body;
        try {
            const existingUser = await svc.dao.getByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: "You already have an account, please log in" });
            }
            await svc.dao.signUp(nickname, email, password);
            return res.status(201).json({ message: "User registered successfully" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
