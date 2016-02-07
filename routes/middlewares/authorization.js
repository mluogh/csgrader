var mongoose = require('mongoose'),
	Course = mongoose.model('Course'),
	helper = require(__base + '/routes/libraries/helper');

module.exports.requiresLogin = function(req, res, next){
	if (req.isAuthenticated()) return next();
	if (req.method == 'GET') req.session.returnTo = req.originalUrl;
	return res.send(401);
}

module.exports.requiresTeacher = function(req, res, next){
	if (req.user.bIsTeacher) return next();
	return res.send(401);
}

module.exports.requiresEnrollment = function(req, res, next){
	Course.findOne({courseID: req.params.courseID}, function(err, course){
		if (err) return res.send(401);
		if (!course) return res.send(401);

		//If the student is not enrolled in this course, don't let them view it
		if (req.user.courses.indexOf(course._id) === -1) res.send(401);

		res.locals.course = course;
		return next();
	});
}

module.exports.requiresAssignmentExistance = function(req, res, next){
	var aIndex = parseInt(req.params.assignmentID, 10);

	if (typeof res.locals.course.assignments[aIndex] == 'undefined'
		|| (!res.locals.course.assignments[aIndex].bIsOpen && !req.user.bIsTeacher)){
		return res.send(401);
	}
	res.locals.aIndex = aIndex;
	return next();
};