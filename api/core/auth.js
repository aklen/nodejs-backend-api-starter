/*MIT License

Copyright (c) 2017 Akos Hamori

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

var express = require('express');
var app = express();
var util = require('util');
var utils = require('../../modules/utils');
var errorMap = require('../../modules/utils/errors.js');
var resp = require('../../modules/response_manager');
var logger = require("../../modules/log_manager");
var db = require('../../modules/db_manager');
var auth = require('../../modules/auth');
var validator = require('../../modules/validator_manager');
var validatorSchema = validator.validators;

app.get('/authenticate', function(req, res, next) {
	logger.debug('authenticate()');

	var resObj = new resp(req);
	res.json(resObj.toJSonString());
});

app.post('/authenticate', function(req, res, next) {
	logger.debug('authenticate.post()');

	// req.check(validatorSchema.usernameValidator);
	// req.check(validatorSchema.passwordValidator);

	var resObj = new resp(req);

	if (!resObj.validateHttpParams(req)) {
		res.json(resObj.toJSonString());
		return;
	}

	var username = req.body.username;
	var password = req.body.password;
	var queryStr = util.format("CALL loginUser('%s', '%s');", username, password);

	db.handleQuery(req, res, queryStr, false, null, function(err, innerResObj) {
		if (err) {
			logger.error(err);
			res.json(innerResObj.toJSonString());
			return;
		}

		var payload = innerResObj.getDataItems()[0];
		logger.debug('payload: ' + payload);

		if (payload) {
			innerResObj.setToken(auth.signToken(payload));
			res.json(innerResObj.toJSonString());
			return;
		}
		else {
			throw errorMap.items.noTokenPayload;
		}
	});
});

app.get('/authenticate/test', function(req, res, next) {
	logger.debug('authenticate.test()');

	var resObj = new resp(req);
	res.json(resObj.toJSonString());
});

module.exports = app;
