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
var utils = require('./modules/utils');

var logger = require('./modules/log_manager');
var auth = require('./modules/auth');
var plugins = require('./modules/plugin_manager');
var db = require('./modules/db_manager');

exports.initHeaders = function(app) {
	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Origin, Authorization");
		res.header('Access-Control-Allow-Credentials', true);
		next();
	});
}

exports.initModules = function() {
	logger.init();
	db.init();
}

exports.initJwt = function(app) {
	app.use('/', function(req, res, next) {
		auth.getExpressJWT(req).unless({path: ['/authenticate', '/registration']});
		next();
	});
}

exports.initRouter = function(app) {
	var router = express.Router();
	// core routes
	router.use(require('./api/core/index.js'));
	router.use(require('./api/core/auth.js'));

	// specific routes
	// ...

	// fallback route - this must be the last one
	router.use(require('./api/core/fallback.js'));
	app.use('/api', router);
}

exports.init = function(app, host, port) {
	this.initHeaders(app);
	this.initModules();
	this.initJwt(app);
	this.initRouter(app);

	logger.debug('Listening on ' + host + ':' + port);

	plugins.init();
}
