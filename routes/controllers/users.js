'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Email = require(__base + 'routes/services/email'),
	config = require(__base + 'app/config'),
	DescError = require(__base + 'routes/libraries/errors').DescError,
	passport = require('passport'),
	helper = require(__base + 'routes/libraries/helper');

module.exports.authenticate = function(req, res, next){
	passport.authenticate('local', function(err, user, info) {
		if (err){ 
			return helper.sendError(res, 401, new DescError('An error occured while you were trying to access the database.', 400));
		}

		if (!user){
			return helper.sendError(res, 401, new DescError('That user does not exist or you did not enter the correct password.', 400));
		}

		req.logIn(user, function(err) {
			if (err){ 
				return helper.sendError(res, 401, new DescError('An error occured while you were trying to access the database.', 400));
			}

			return module.exports.getSelf(req, res);
		});
	})(req, res, next);
}

module.exports.getSelf = function(req, res){
	return res.json(req.user.safeSend(req.user));
}

module.exports.logout = function(req, res){
	req.logout();
	return res.sendStatus(200);
}

module.exports.signedIn = function(req, res){
	return res.sendStatus(200);
}

module.exports.create = function(req, res){
	req.checkBody('firstName', 'First name must be between 1-50 characters').isLength({min: 1, max: 50});
	req.checkBody('lastName', 'Last name must be between 1-50 characters').isLength({min: 1, max: 50});
	req.checkBody('password', 'Password must be between 1-25 characters').isLength({min: 1, max: 25});
	req.checkBody('retypePassword', 'Confirmation password must be between 1-25 characters').isLength({min: 1, max: 25});
	req.checkBody('email', 'Email must be valid').isEmail();
	req.checkBody('role', 'Please select an account type').isIn(['student', 'teacher', 'aide']);

	if (req.body.role === 'teacher'){
		req.checkBody('institution', 'Please include the educational institution you a part of.').notEmpty();
	}
	
	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	User.create(req.body, function(err, user){
		if (err){ return helper.sendError(res, 400, err); }

		req.logIn(user, function(err){
			Email.sendActivationEmail(req.user, function(err, activationCode){
				if (err){ return helper.sendError(res, 500, err); }

				//do this so we can easily test if the email activation works.
				if (config.env === 'test'){
					return helper.sendSuccess(res, { activationCode: activationCode });
				}

				return helper.sendSuccess(res, user.safeSend(req.user));
			});
		});
	})
}

module.exports.emailActivation = function(req, res){
	if (!req.isAuthenticated()){
		return helper.sendError(res, 400, new DescError('You must be logged in to activate your account.', 401));
	}

	req.checkBody('activationCode', 'Activation code must be included.').notEmpty();

	var validationErrors = req.validationErrors();
	if (validationErrors){ return helper.sendError(res, 400, validationErrors); }

	req.user.activate(req.body.activationCode, function(err){
		if (err) { helper.sendError(res, 400, err); }
		return helper.sendSuccess(res);
	});
}
