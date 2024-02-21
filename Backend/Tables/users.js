module.exports = class Users{
    constructor(nickname, email, phoneNumber, password, bio, birthdate, genre, links, tags) {
        this.nickname = nickname
        this.email = email
        this.phoneNumber = phoneNumber
        this.password = password
        this.bio = bio
        this.birthdate = birthdate
        this.gender = genre
        this.links = links
        this.tags = tags
    }
}