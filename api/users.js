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
var async = require('async');
var util = require('util');
var utils = require('../modules/utils/utils.js');
var resp = require('../modules/response_manager/response_manager.js');
var logger = require('../modules/log_manager/log_manager.js');
var db = require('../modules/db_manager/db_manager.js');

// list
app.get('/users', function(req, res) {
	logger.debug('users.list()');

	var resObj = new resp(req);
	resObj.setTitle('API');
	resObj.setDescription('This route shows a list of users.');
	res.send(resObj.toJSonString());
});

module.exports = app;
