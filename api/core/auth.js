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
var logger = require("../../modules/log_manager");
var db = require('../../modules/db_manager');
var auth = require('../../modules/auth');
var validator = require('../../modules/validator_manager');
var validatorSchema = validator.validators;
var utils = require('../../modules/utils');

var secret = 'mysecretsalttext';
app.post('/authenticate', function(req, res, next) {
	logger.debug('authenticate.post()');
	var responseObj = new utils.responseObj();
	responseObj.setUrl(req, res);

	req.check(validatorSchema.usernameValidator);
	req.check(validatorSchema.passwordValidator);
	if (!responseObj.validateHttpParams(req, res)) {
		logger.debug(responseObj.toJSonString());
		res.json(responseObj.toJSonString());
		return;
	}

	var username = req.body.username;
	var password = req.body.password;
	var queryStr = "CALL loginUser('{uname}', '{pwd}');".format({ uname: username, pwd: password });

	db.handleQuery(req, res, queryStr, false, null, function(err, resObj) {
		if (err) {
			logger.error(err);
			res.json(resObj.toJSonString());
			return;
		}

		resObj.setToken(auth.signToken(resObj.response.data.items[0]));
		res.json(resObj.toJSonString());
		return;
	});
});

app.get('/authenticate/test', function(req, res, next) {
	logger.debug('authenticate.test()');

	var responseObj = new utils.responseObj();
	responseObj.setUrl(req, res);

	res.json(responseObj.toJSonString());
});

module.exports = app;
