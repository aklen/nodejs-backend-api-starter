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

var http = require("http");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var expressValidator = require('express-validator');
var jwt = require('jsonwebtoken');
var expressJWT = require('express-jwt');
var auth = require('./modules/auth/auth.js');
var errorMap = require('./modules/utils/errors.js');
var logger = require('./modules/log_manager/log_manager.js');
var resp = require('./modules/response_manager/response_manager.js');
var pluginManager = require('./modules/plugin_manager/plugin_manager.js');
var db = require('./modules/db_manager/db_manager.js');

var host = "0.0.0.0" || process.env.VCAP_APP_HOST || process.env.HOST || 'localhost';
var port = process.env.VCAP_APP_PORT || process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator({
	customValidators: {
		isBoolean: function(value) {
			return typeof bool === 'boolean' || (typeof bool === 'object' && typeof bool.valueOf() === 'boolean');
		},
		isArray: function(value) {
			return Array.isArray(value);
		},
		gte: function(param, num) {
			return param >= num;
		}
	}
}));
app.use(auth.initHeaders());
app.use('/api', auth.useExpressJwt());

var router = express.Router();
router.use(require('./api/core/index.js'));
router.use(require('./api/core/auth.js'));
router.use(require('./api/core/errors.js'));
router.use(require('./api/users.js'));
router.use(require('./api/fallback.js'));
app.use('/api', router);

app.listen(port, host, function() {
	logger.debug('Node.js version: ' + process.version);
	logger.debug('Listening on ' + host + ':' + port);

	// start plugins
	pluginManager.loadPlugins(app, express);
});
