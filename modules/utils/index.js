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

var utils = this;
var util = require('util');
var logger = require('../../modules/log_manager');

String.prototype.format = function(placeholders) {
	var s = this;
	for (var propertyName in placeholders) {
		var re = new RegExp('{' + propertyName + '}', 'gm');
		if (placeholders.hasOwnProperty(propertyName))
			s = s.replace(re, placeholders[propertyName]);
	}
	return s;
};

String.prototype.isEmpty = function() {
	return (this.length === 0 || !this.trim());
}

String.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
}

String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
}

Array.prototype.pushArray = function(arr) {
	this.push.apply(this, arr);
}

exports.roundDecimal = function(num) {
	return Math.round(num * 100) / 100;
}

exports.padStringLeft = function(num) {
	var res;
	var pad = "000";
	var str = '' + num;
	var pointPos = str.indexOf('.');
	if (pointPos > -1) {
		var prefix = str.substring(0, pointPos);
		pad = pad.substring(0, pad.length - str.length) + str;
		return pad;
	}
	return str;
}

exports.isDefined = function(obj) {
	return (typeof obj !== 'undefined');
}

exports.inspect = function(obj) {
	return util.inspect(obj, {
		depth: null
	}); // null = no depth limit
}

exports.nameOf = function(exp) {
	return exp.toString().match(/[.](\w+)/)[1];
}

exports.iterate = function(obj, nameOfObj, stack) {
	logger.debug('');
	logger.debug('[' + nameOfObj + ']');
	for (var property in obj) {
		var fnName = obj[property].toString();
		if (fnName.contains('function')) {
			fnName = fnName.replaceAll('function ', '');
			fnName = fnName.substring(0, fnName.indexOf(' '));
			logger.debug(' - ' + fnName);
		}
	}
	logger.debug('');
};

exports.ObjToSource = function(o) {
	if (!o) return 'null';
	if (typeof(o) == "object") {
		if (!this.ObjToSource.check) this.ObjToSource.check = new Array();
		for (var i = 0, k = this.ObjToSource.check.length; i < k; ++i) {
			if (this.ObjToSource.check[i] == o) {
				return '{}';
			}
		}
		this.ObjToSource.check.push(o);
	}
	var k = "",
		na = typeof(o.length) == "undefined" ? 1 : 0,
		str = "";
	for (var p in o) {
		if (na) k = '"' + p + '":';
		if (typeof o[p] == "string") {
			var val = o[p];
			str += k + '"' + val + '",';
		} else if (typeof o[p] == "object") {
			str += k + this.ObjToSource(o[p]) + ",\n";
		} else {
			var val = o[p] + ' ';
			if (val.indexOf('function') > -1) {
				//val = 'function()';
				//str += k + '"' + val + '",';
			} else {
				str += k + '"' + val + '",';
			}
		}
	}
	if (typeof(o) == "object") this.ObjToSource.check.pop();
	if (na) return "{" + str.slice(0, -1) + "}\n";
	else return "[" + str.slice(0, -1) + "]\n";
};

exports.convertToJsObj = function(obj) {
	return JSON.parse(utils.ObjToSource(obj));
}

exports.errorObj = {
	setMessage: function(name, msg) {
		if (utils.errorObj.items.hasOwnProperty(name))
			utils.errorObj.items[name].msg = msg;
	},
	getByName: function(name) {
		return utils.errorObj.items[name];
	},
	items: {
		validationErrors: {
			name: 'validationErrors',
			msg: 'Some HTTP params are not presented or cannot be validated.',
			code: 1,
			httpStatusCode: 1
		},
		undefinedVariable: {
			name: 'undefinedVariable',
			msg: 'Variable is undefined.',
			code: 2,
			httpStatusCode: 2
		},
		dataNotPresented: {
			name: 'dataNotPresented',
			msg: 'Data object is not presented.',
			code: 3,
			httpStatusCode: 3
		},
		resourceNotFound: {
			name: 'resourceNotFound',
			message: 'Resource not found.',
			code: 4,
			httpStatusCode: 404
		},
		invalidToken: {
			name: 'invalidToken',
			message: 'Token is invalid.',
			code: 5,
			httpStatusCode: 401
		}
	}
};

exports.responseObj = function() {
	return {
		response: {
			result: {
				success: true,
				statuscode: 200,
				url: ''
			},
			token: {
				key: '',
				expires: ''
			},
			errors: {
				count: 0,
				items: []
			},
			events: {
				count: 0,
				items: []
			},
			data: {
				count: 0,
				items: []
			}
		},

		setUrl: function(req) {
			var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
			this.response.result.url = fullUrl;
		},

		getStatusCode: function() {
			return this.response.result.statuscode;
		},
		setStatusCode: function(code) {
			this.response.result.statuscode = code;
		},

		validateHttpParams: function(req, res) {
			this.response.result.url = req.url;
			var errors = req.validationErrors();
			if (errors) {
				var errorObj = utils.errorObj.items.validationErrors;
				errorObj.items = errors;
				this.addErrorItem(errorObj);
				return false;
			} else {
				return true;
			}
		},

		addErrorItem: function(errorObj) {
			this.response.result.success = false;

			if (!utils.isDefined(errorObj)) {
				this.addErrorItem(self.errorObj.items.undefinedVariable);
				return;
			}

			this.response.errors.items.push(errorObj);
			this.response.errors.count = this.response.errors.items.length;

			if (errorObj.hasOwnProperty('httpStatusCode')) {
				this.setStatusCode(errorObj.httpStatusCode);
			}
		},
		setErrorItems: function(items) {
			if (items) {
				this.response.errors.items = items;
				this.response.errors.count = this.response.errors.items.length;
				this.response.result.success = false;
			}
		},

		addEventItem: function(event) {
			if (event) {
				this.response.events.items.push(event);
				this.response.events.count = this.response.events.items.length;
			}
		},
		setEventItems: function(items) {
			if (items) {
				this.response.events.items = items;
				this.response.events.count = this.response.events.items.length;
			}
		},

		addDataItem: function(item) {
			if (item) {
				this.response.data.items.push(item);
				this.response.data.count = this.response.data.items.length;
			}
		},
		setDataItems: function(items) {
			if (items) {
				this.response.data.items = items;
				this.response.data.count = this.response.data.items.length;
			}
		},

		setToken: function(tokenStr) {
			if (tokenStr) {
				this.response.token.key = tokenStr;
			}
		},

		toJSonString: function() {
			if (this.response.errors && this.response.errors.hasOwnProperty('count') && this.response.errors.count == 0) {
				delete this.response.errors;
			}
			if (this.response.events && this.response.events.hasOwnProperty('count') && this.response.events.count == 0) {
				delete this.response.events;
			}
			if (this.response.token) {
				if (!this.response.token.key && !this.response.token.expires) {
					delete this.response.token;
				}
			}
			if (this.response.data && this.response.data.hasOwnProperty('count') && this.response.data.count == 0) {
				delete this.response.data;
			}

			return this.response;
		}
	};
}
