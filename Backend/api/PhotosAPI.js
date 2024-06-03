const jimp = require("jimp");
const jwt = require("jsonwebtoken");
module.exports = (app, svc) => {

    const validateTokenMiddleware = (req, res, next) => {
        const token = req.headers.authorization.substring(7);
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: Token is missing" });
        }

        try {
            const decoded = jwt.verify(token, "secretKey");
            req.userId = decoded.userId;
            next();
        } catch (error) {
            console.error("Error verifying token:", error);
            return res.status(401).json({ error: "Unauthorized: " + error.message });
        }
    };

    app.patch("/photos/:id", validateTokenMiddleware, async (req, res) => {
        const userId = req.params.id;
        const photo = req.body;

        if (!userId) {
            return res.status(400).end();
        }

        console.log("userId = ", userId, " photo = ", photo, "type = ", photo.type)

        svc.dao.addPhoto(userId, photo)
            .then(() => res.status(204).end())
            .catch(e => {
                console.error(e);
                res.status(500).end();
            });
    });

    app.get("/photos/:id", validateTokenMiddleware, async (req, res) => {
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

    app.delete("/photos/:id", validateTokenMiddleware, async (req, res) => {
        svc.dao.deletePhoto(req.params.id)
            .then(_ => res.status(200).end())
            .catch(e => {
                console.log(e)
                res.status(500).end()
            })
    })
}
