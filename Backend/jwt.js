const jwt = require('jsonwebtoken')
const jwtKey = 'secretKey'
const jwtExpirySeconds = 3600

module.exports = (userAccountService) => {
    return {
        validateJWT(req, res, next) {
            if (req.headers.authorization === undefined) {
                console.log("Authorization header is missing")
                res.status(401).end()
                return
            }
            const token = req.headers.authorization.split(" ")[1];
            jwt.verify(token, jwtKey, {algorithm: "HS256"},  async (err, user) => {
                if (err) {
                    console.log(err)
                    res.status(401).end()
                    return
                }
                console.log(user)
                try {
                    console.log("userAccountService: ")
                    console.log(userAccountService)
                    console.log("userAccountService.usersDAO: ")
                    console.log(userAccountService.usersDAO)
                    req.user = await userAccountService.usersDAO.getByEmail(user.email)
                    return next()
                } catch(e) {
                    console.log(e)
                    res.status(401).end()
                }

            })
        },
        generateJWT(email) {
            return jwt.sign({email}, jwtKey, {
                algorithm: 'HS256',
                expiresIn: jwtExpirySeconds
            })
        }
    }
}