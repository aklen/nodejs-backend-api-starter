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
var errorMap = require('./errors.js');

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
