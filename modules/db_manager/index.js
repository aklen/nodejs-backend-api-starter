const Sequelize = require('sequelize');
const utils = require('../../modules/utils');
var logger = require('../../modules/log_manager');
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
	var result = new utils.responseObj();

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
	var result = new utils.responseObj();
	var errors = req.validationErrors();
	if (errors) {
		result.response.errors.items = errors;
		res.send(result.response);
		return true;
	}
	return false;
};

exports.init = function() {

}
