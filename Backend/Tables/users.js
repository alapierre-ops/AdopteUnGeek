module.exports = class Users{
    constructor(nickname, email, phoneNumber, password, bio, birthdate, genre, links, tags, interestedIn, filter_agemin, filter_agemax, filter_dismax, city) {
        this.nickname = nickname
        this.email = email
        this.password = password
        this.bio = bio
        this.birthdate = birthdate
        this.gender = genre
        this.tags = tags
        this.interestedIn = interestedIn
        this.filter_agemin = filter_agemin
        this.filter_agemax = filter_agemax
        this.filter_dismax = filter_dismax
        this.city = city
    }
}