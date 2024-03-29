var mongoose = require('mongoose'),
	Course = mongoose.model('Course'),
	Assignment = mongoose.model('Assignment'),
	DescError = require(__base + '/routes/libraries/errors').DescError;
	helper = require(__base + '/routes/libraries/helper');

module.exports.requiresLogin = function(req, res, next){
	if (req.isAuthenticated() && req.user.bHasActivatedAccount){
		return next();
	}

	return helper.sendError(res, 401, new DescError('Please log in or activate your account.', 401));
}

module.exports.requiresStudent = function(req, res, next){
	if (req.user.role === 'student') return next();

	return helper.sendError(res, 401, new DescError('You must be a student to access this.', 401));
}

module.exports.requiresTeacher = function(req, res, next){
	if (req.user.role === 'teacher') return next();

	return helper.sendError(res, 401, new DescError('You must be a teacher to access this.', 401));
}

module.exports.requiresTeacherOrAide = function(req, res, next){
	if (req.user.role === 'teacher' || req.user.role === 'aide') return next();

	return helper.sendError(res, 401, new DescError('You must be a teacher or an aide to access this.', 401));
}

module.exports.requiresEnrollment = function(req, res, next){
	if (typeof req.session.authorizedCourses === 'undefined' || 
		req.session.authorizedCourses.indexOf(req.params.courseCode) === -1){

		Course.findOne({courseCode: req.params.courseCode}, { _id: 1 }).lean().exec(function(err, course){
			if (err){
				return helper.sendError(res, 500, new DescError(
					'An error occured while you were trying to access the database. Please try again.', 400));
			}
			if (!course){ 
				return helper.sendError(res, 404, new DescError('That course does not exist.', 400));
			}
			//If the student is not enrolled in this course, don't let them view it
			if (req.user.courses.indexOf(course._id) === -1){
				return helper.sendError(res, 401, new DescError('You must be enrolled in this course to access it.', 400));
			}

			if (typeof req.session.authorizedCourses === 'undefined'){
				req.session.authorizedCourses = [];
			}

			req.session.authorizedCourses.push(req.params.courseCode);
			req.session.save();

			return next();
		});	
	}else{
		return next();
	}
}

module.exports.requiresCourseOwnership = function(req, res, next){
	if (typeof req.session.ownedCourses === 'undefined' || 
		req.session.ownedCourses.indexOf(req.params.courseCode) === -1){

		Course.findOne({ courseCode : req.params.courseCode }, { owner: 1 }).lean().exec(function(err, course){
			if (err){
				return helper.sendError(res, 500, new DescError(
					'An error occured while you were trying to access the database. Please try again.', 400));
			}

			if (!course){ 
				return helper.sendError(res, 404, new DescError('That assignment does not exist.', 400));
			}

			if (course.owner.toString() !== req.user._id.toString()){
				return helper.sendError(res, 401, new DescError('You must be the owner to do this.', 400));
			}

			if (typeof req.session.ownedCourses === 'undefined'){
				req.session.ownedCourses = [];
			}

			req.session.ownedCourses.push(req.params.courseCode);
			req.session.save();

			return next();
		});
	}else{
		return next();
	}
}

module.exports.requiresAssignment = function(req, res, next){
	if (typeof req.session.authorizedAssignments === 'undefined' || 
		req.session.authorizedAssignments.indexOf(req.params.assignmentID) === -1){

		Assignment.findOne({ _id : req.params.assignmentID }, { courseID: 1, bIsOpen: 1 }, function(err, assignment){
			if (err){
				return helper.sendError(res, 500, new DescError(
					'An error occured while you were trying to access the database. Please try again.', 400));
			}

			if (!assignment){ 
				return helper.sendError(res, 404, new DescError('That assignment does not exist.', 400));
			}

			if (req.user.courses.indexOf(assignment.courseID) === -1){
				return helper.sendError(res, 401, new DescError('You must be enrolled in this course to access it.', 400));
			}

			if (assignment.isLocked() && req.user.role !== 'teacher'){
				return helper.sendError(res, 404, new DescError('That assignment does not exist or is not available.', 400));
			}

			if (typeof req.session.authorizedAssignments === 'undefined'){
				req.session.authorizedAssignments = [];
			}

			req.session.authorizedAssignments.push(req.params.assignmentID);
			req.session.save();

			return next();
		});
	}else{
		return next();
	}
};

