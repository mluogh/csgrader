(function(){
	'use strict';

	angular.module('submissions')
	.factory('SubmissionsFactory', function($http) {
		var courseCode = '';
		var assignmentID = '';

		return {
			setParams: setParams,
			getClassesWithProgress: getClassesWithProgress,
			getSubmissions: getSubmissions
		}

		function setParams(setCourseCode, setAssignmentID){
			courseCode = setCourseCode;
			assignmentID = setAssignmentID;
		}

		function getClassesWithProgress(regInfo){
			return $http.get('/api/course/' + courseCode + '/assignment/' + assignmentID + '/submission').then(
				function Success(res){
					return res.data;
				}
			)
		}

		function getSubmissions(classCode){
			return $http.get('/api/course/' + courseCode + '/assignment/' + assignmentID + '/submission/classroom/' + classCode).then(
				function Success(res){
					return res.data;
				}
			)
		}
	})

	.factory('SubmissionFactory', function($http){
		var courseCode = '';
		var assignmentID = '';
		var submissionID = '';

		return {
			setParams: setParams,
			saveComment: saveComment,
			gradeContent: gradeContent
		}

		function setParams(setCourseCode, setAssignmentID, setSubmissionID){
			courseCode = setCourseCode;
			assignmentID = setAssignmentID;
			submissionID = setSubmissionID;
		}

		function saveComment(contentType, contentID, text){
			const comment = {
				contentType: contentType,
				contentID: contentID,
				text: text
			}

			const commentURL = '/api/course/' + courseCode + '/assignment/' + assignmentID + '/submission/' + submissionID + '/comment';
			
			return $http
			.put(commentURL, comment)
			.then(
				function Success(res){
					return res.data;
				}
			)
		}

		function gradeContent(contentType, contentIndex, points){
			const grade = {
				contentType: contentType,
				contentIndex: contentIndex,
				points: points
			}

			const commentURL = '/api/course/' + courseCode + '/assignment/' + assignmentID + '/submission/' + submissionID + '/grade';
			
			return $http
			.put(commentURL, grade)
			.then(
				function Success(res){
					return res.data;
				}
			)
		}

	})
})();