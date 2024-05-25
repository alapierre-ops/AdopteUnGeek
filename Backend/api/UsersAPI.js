const jwt = require('jsonwebtoken')
const jimp = require('jimp')
const {rows} = require("pg/lib/defaults");

module.exports = (app, svc) => {
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

    app.get("/users/:id", async (req, res) => {
        try {
            const user = await svc.dao.getById(req.params.id)
            if (user === undefined) {
                return res.status(404).end()
            }
            return res.json(user)
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
            const newUser = await svc.dao.getByEmail(email);
            const token = svc.generateToken(newUser.id);
            return res.status(201).json({ message: "Votre compte a été créé avec succès.",token: token});
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Erreur interne, veuillez réessayer plus tard." });
        }
    });

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
            .then(_ => res.status(204).end())
            .catch(e => {
                console.log(e);
                res.status(500).end();
            });
    });

    app.patch("/users/:id/photo", async (req, res) => {
        const userId = req.params.id;
        const photo = req.body;

        if (!userId) {
            return res.status(400).end();
        }
        svc.dao.addPhoto(userId, photo)
            .then(_ => res.status(204).end())
            .catch(e => {
                console.log(e);
                res.status(500).end();
            })
    });

    app.get("/users/:id/photos", async (req, res) => {
        try {
            const photo = await svc.dao.getPhotos(req.params.id)
            if (photo === undefined) {
                return res.status(404).end()
            }

            let imgJpeg = await jimp.read(photo)

            const width = imgJpeg.bitmap.width;
            const height = imgJpeg.bitmap.height;

            if (width >= 1024 && height >= 1024) {
                const centerX = width / 2 - 512;
                const centerY = height / 2 - 512;
                imgJpeg = imgJpeg.crop(centerX, centerY, 1024, 1024);
            } else {
                imgJpeg = imgJpeg.contain(1024, 1024);
            }

            const photoBinary = await imgJpeg.getBufferAsync("image/jpeg")

            res.setHeader('Content-Type', 'image/jpeg')
            res.send(photoBinary)
        } catch (e) {
            console.log("Error sending cropped photo: " + e)
            res.status(400).end()
        }
    })

    app.delete("/users/:id/photos", async (req, res) => {
        svc.dao.deletePhoto(req.params.id)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })

    app.get("/users/messages/:sender_id/:receiver_id", async (req, res) => {
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

    app.post("/users/messages/:sender_id/:receiver_id", async (req, res) => {
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
