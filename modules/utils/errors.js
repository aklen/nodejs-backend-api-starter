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
