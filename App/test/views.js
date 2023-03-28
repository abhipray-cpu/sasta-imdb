const expect = require('chai').expect
const { response } = require('express')
const request = require('request')

describe('Status', function() {
    describe ('Login page', function() {
        it('status', function(done){
            request('http://localhost:4000/login', function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });



        
    });
    describe ('Signup page', function() {
        it('status', function(done){
            request('http://localhost:4000/signup', function(error, response, body) {
                expect(response.statusCode).to.equal(200);
                done();
            });
        });

    });
});