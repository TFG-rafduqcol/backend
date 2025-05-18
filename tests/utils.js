const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
 
async function authorizedRequestWithBadToken(endpoint, method) {
    const token = 'invalid.token.value'
    
    return request(app)
        [method](endpoint)
        .set('Authorization', `Bearer ${token}`);
}

async function authorizedRequestWithOutToken(endpoint, method, payload) {

    let req = request(app)[method](endpoint)
        .set('Authorization', ``);

    if (payload != null) {  
        req = req.send(payload);
    }

    return req;
}





module.exports = { authorizedRequestWithBadToken, authorizedRequestWithOutToken };