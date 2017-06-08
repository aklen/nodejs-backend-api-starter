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

exports.setMessage = function(name, msg) {
	if (this.items.hasOwnProperty(name))
		utils.items[name].msg = msg;
}

exports.getByName = function(name) {
	return utils.items[name];
}

exports.items = {
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
		message: 'Resource not found under this URL.',
		code: 4,
		httpStatusCode: 404
	},
	noToken: {
		name: 'noToken',
		message: 'No token provided.',
		code: 5,
		httpStatusCode: 401
	},
	invalidToken: {
		name: 'invalidToken',
		message: 'Invalid token provided.',
		code: 6,
		httpStatusCode: 401
	},
	zeroLength: {
		name: 'zeroLength',
		message: 'Data has zero length.',
		code: 7,
		httpStatusCode: 7
	},
	noTokenPayload: {
		name: 'noTokenPayload',
		message: 'No token payload provided.',
		code: 8,
		httpStatusCode: 401
	},
	UnauthorizedError: {
		name: 'UnauthorizedError',
		message: 'Unauthorized token provided.',
		code: 9,
		httpStatusCode: 401
	},
	ReferenceError: {
		name: 'ReferenceError',
		message: 'ReferenceError.',
		code: 10,
		httpStatusCode: 404
	}
}
