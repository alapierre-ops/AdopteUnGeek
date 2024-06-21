const chai = require('chai')
const chaiHttp = require('chai-http');
const { app, seedDatabase, usersService} = require("../main");
const {expect} = require("chai");
const should = chai.should();

chai.use(chaiHttp);

describe('API Tests', function() {
    this.timeout(5000);
    let token = '';

    before( (done) => {
        seedDatabase().then( async () => {
            console.log("Creating test user");
            usersService.usersDAO.signUp('User1', 'user1', 'default').then( () =>
                chai.request(app)
                    .post('/api/users/auth/login')
                    .send({email: 'user1', password: 'default'})
                    .end((err, res) => {
                        res.should.have.status(200);
                        token = res.body.token;
                        this.userID1 = res.body.user.id;
                        done();
                    })
            )})
    });

    after( (done) => {
        console.log("Deleting test user")
        usersService.usersDAO.getByEmail('user1').then(
            (user) => {
                usersService.usersDAO.delete(user.id).then(done())
            }
        )
    })

    it('should allow access with valid token', (done) => {
        chai.request(app)
            .get(`/api/users/${this.userID1}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('Object');
                done();
            });
    });

    it('should deny access with invalid token', (done) => {
        chai.request(app)
            .get(`/api/users/${this.userID1}`)
            .set('Authorization', 'Bearer wrongtoken')
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    it('should insert a new user', (done) => {
        chai.request(app)
            .post('/api/users/auth/signup')
            .send({ nickname: 'User2', email: 'user2@example.com', password: 'default' })
            .end((err, res) => {
                res.should.have.status(201);
                this.userID2 = res.body.id;
                done();
            });
    });

    it('should not insert a user with missing fields', (done) => {
        chai.request(app)
            .post('/api/users/auth/signup')
            .send({ email: 'user3@example.com', password: 'default' })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    let user;
    it('should return a specific user by id', (done) => {
        usersService.usersDAO.getByEmail('user1').then((retrievedUser) => {
            chai.request(app)
                .get(`/api/users/${retrievedUser.id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.include({ nickname: 'User1', email: 'user1' });
                    user = res.body;
                    done();
                });
        });
    });

    it('should not return a user with an invalid id', (done) => {
        chai.request(app)
            .get(`/api/users/invalidID`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    it('should not return a user with an unknown id', (done) => {
        chai.request(app)
            .get(`/api/users/12345`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });

    it('should not delete a user with an unknown id', (done) => {
        chai.request(app)
            .delete(`/api/users/12345`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });

    it('should not delete a user with an invalid id', (done) => {
        chai.request(app)
            .delete(`/api/users/invalidID`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    it('should send a message between two users', (done) => {
        chai.request(app)
            .post(`/api/messages/${this.userID1}/${this.userID2}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Hello, User2!' })
            .end((err, res) => {
                res.should.have.status(204);
                done();
            });
    });

    it('should fail to send a message with invalid user ids', (done) => {
        chai.request(app)
            .post(`/api/messages/invalidID/invalidID`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'This should fail' })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    it('should fail to send a message with missing content', (done) => {
        chai.request(app)
            .post(`/api/messages/${this.userID1}/${this.userID2}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: '' })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    it('should retrieve messages between two users', (done) => {
        chai.request(app)
            .get(`/api/messages/${this.userID1}/${this.userID2}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done();
            });
    });

    it('should return 404 for messages between two users with no messages', (done) => {
        chai.request(app)
            .get(`/api/messages/11223/28683`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });

    it('should delete a user', (done) => {
        usersService.usersDAO.getByEmail('user2@example.com').then((retrievedUser) => {
            chai.request(app)
                .delete(`/api/users/${retrievedUser.id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});