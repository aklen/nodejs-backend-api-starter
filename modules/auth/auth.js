/*MIT License

Copyright (c) 2017-2018 Akos Hamori

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

var utils = require('../../modules/utils/utils.js');
var logger = require('../../modules/log_manager/log_manager.js');
var resp = require('../../modules/response_manager/response_manager.js');
var errorMap = require('../../modules/utils/errors.js');
var config = require('./config.json');
var jwt = require('jsonwebtoken');
var expressJWT = require('express-jwt');

exports.signToken = function(data, expireTime) {
	if (!expireTime) {
		expireTime = config.expiresIn;
	}
	return jwt.sign(data, config.secret, {
		expiresIn: expireTime
	});
}

exports.getTokenFromBody = function(req) {
	return req.body.token;
}

exports.getTokenFromQuery = function(req) {
	return req.query.token;
}

exports.getTokenFromAccessTokenHeader = function(req) {
	return req.headers['x-access-token'];
}

exports.getTokenFromAuthorizationHeader = function(req) {
	if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
		return req.headers.authorization.split(' ')[1];
	}
	return null;
}

exports.verifyToken = function(token) {
	if (!token) {
		return null;
	}

	jwt.verify(token, config.secret, function(err, decoded) {
		if (err) {
			return null;
		}

		return decoded;
	});
};

exports.getExpressJWT = function(req, res, next) {
	return expressJWT({
		secret: config.secret,
		getToken: this.verifyToken(req, res, next)
	});
}

exports.initHeaders = function() {
	return function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Origin, Authorization");
		res.header('Access-Control-Allow-Credentials', true);
		next();
	}
}

exports.useExpressJwt = function() {
	return expressJWT({
			secret: config.secret,
			getToken: function(req) {
				var token = null;

				if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
					token = req.headers.authorization.split(' ')[1];
				}
				else if (req.query && req.query.token) {
					token =  req.query.token;
				}
				else if (req.body && req.body.token) {
					token =  req.body.token;
				}
				else if (req.headers) {
					token = req.headers['x-access-token'];
				}

				req.token = token;
				return token;
			}
		}).unless({
			useOriginalUrl: false,
			path: config.unprotectedPath
		});
}
