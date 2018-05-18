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

const Sequelize = require('sequelize');
const utils = require('../../modules/utils/utils.js');
var resp = require('../../modules/response_manager/response_manager.js');
var logger = require('../../modules/log_manager/log_manager.js');
var config = require('./config.json');

const db = this;
const self = this;

if (config && typeof config.password !== 'undefined') {
	logger.info('DB credentials are presented in configuration files.');
} else {
	logger.error('DB credentials are NOT presented in configuration files.');
	process.exit(1);
}

const sequelize = new Sequelize(config.dbname, config.user, config.password, {
	host: config.host,
	dialect: config.dialect,
	logging: function(msg) {
		logger.debug(msg);
	}
});
sequelize.authenticate()
	.then(function() {
		logger.info("Connection to the DB has been established successfully.");
	})
	.catch(function(err) {
		logger.error('Unable to connect to the DB:', err);
	})
	.done();
exports.sequelize = sequelize;
exports.config = config;

exports.catchError = function(req, res, error) {
	logger.error('db.catchError()', error);

	var result = {
		code: 400,
		message: '',
		items: {}
	};

	if (error) {
		if (error.name) {
			result.name = error.name;
		}
		if (error.message) {
			var errorParts = error.message.split(':');
			if (errorParts.length == 0) {
				result.message = errorParts[0];
			} else {
				if (!error.name) {
					result.name = errorParts[0];
				}
				result.message = errorParts[1];
			}
		}
		if (error.original) {
			result.items.original = error.original;
		}
		if (error.parent) {
			result.items.parent = error.parent;
		}
		if (error.sql) {
			result.sql = error.sql;
		}
	}

	logger.debug('Error message: ' + result.message);
	return result;
};

exports.handleQuery = function(req, res, queryStr, sendResponse, queryOptions, cb) {
	logger.debug('db.handleQuery(): queryStr: ' + queryStr);
	var result = new resp(req);

	sequelize.query(queryStr, queryOptions)
		.then(function(data) {
			result.setDataItems(data);
			if (sendResponse) res.send(result.toJSonString());
			if (cb) cb(null, result);
		})
		.error(function(error) {
			result.addErrorItem(error);
			if (sendResponse) res.send(result.toJSonString());
			if (cb) cb(error, result);
		})
		.catch(function(error) {
			result.addErrorItem(self.catchError(req, res, error));
			if (sendResponse) res.send(result.toJSonString());
			if (cb) cb(error, result);
		});
};

exports.checkErrors = function(req, res) {
	logger.debug('db.checkErrors()');
	var result = new resp(req);
	var errors = req.validationErrors();
	if (errors) {
		result.response.errors.items = errors;
		res.send(result.response);
		return true;
	}
	return false;
};
