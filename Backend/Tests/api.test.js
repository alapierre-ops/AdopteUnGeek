const chai = require('chai')
const chaiHttp = require('chai-http');
const { app, seedDatabase, usersServices} = require("../main");
const {expect} = require("chai");
const should = chai.should();

chai.use(chaiHttp);

describe('API Tests', function() {
    this.timeout(5000);
    let token = '';

    before( (done) => {
        seedDatabase().then( async () => {
            console.log("Creating test user");
            usersServices.insert('User1', 'user1', 'default').then( () =>
                chai.request(app)
                    .post('/users/auth/login')
                    .send({email: 'user1', password: 'default'})
                    .end((err, res) => {
                        res.should.have.status(200);
                        token = res.body.token;
                        done();
                    })
            )})
    });

    after( (done) => {
        console.log("Deleting test user")
        usersServices.get('user1').then(
            (user) => {
                usersServices.dao.delete(user.id).then(done())
            }
        )
    })

    it('should allow access with valid token', (done) => {
        chai.request(app)
            .get('/users/getMatches/1')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.should.have.lengthOf(0);
                done();
            });
    });

    it('should deny access with invalid token', (done) => {
        chai.request(app)
            .get('/users/getMatches/1')
            .set('Authorization', 'Bearer wrongtoken')
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    // Tests insertion de données
    it('should insert a new user', (done) => {
        chai.request(app)
            .post('/users/add')
            .send({ nickname: 'User2', email: 'user2@example.com', password: 'default' })
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('should not insert a user with missing fields', (done) => {
        chai.request(app)
            .post('/users/add')
            .send({ email: 'user3@example.com', password: 'default' })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    // Tests sélection de données
    let user;
    it('should return a specific user by id', (done) => {
        usersServices.getByEmail('user1@example.com').then((retrievedUser) => {
            chai.request(app)
                .get(`/users/${retrievedUser.id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.include({ nickname: 'User1', email: 'user1@example.com' });
                    user = res.body;
                    done();
                });
        });
    });

    it('should not return a user with an invalid id', (done) => {
        chai.request(app)
            .get(`/users/invalidID`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });

    it('should not return a user with an unknown id', (done) => {
        chai.request(app)
            .get(`/users/12345`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });

    // Tests suppression de données
    it('should delete a user', (done) => {
        usersServices.getByEmail('user2@example.com').then((retrievedUser) => {
            chai.request(app)
                .delete(`/users/${retrievedUser.id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    it('should not delete a user with an unknown id', (done) => {
        chai.request(app)
            .delete(`/users/12345`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });

    it('should not delete a user with an invalid id', (done) => {
        chai.request(app)
            .delete(`/users/invalidID`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
    });
});