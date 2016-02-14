var testTeacher = require('./courseTests').testTeacher,
	testStudent = require('./courseTests').testStudent,
	expect = require('chai').expect,
    async = require('async');

var mongoose = require('mongoose'),
	Submission = mongoose.model('Submission');

describe('Assignment', function(){

	describe('creation', function(){
		it('should create an assignment given the right info', function(done){
			var newAssignment = {
				name: 'Hello World!',
				description: 'Hello Dank memer',
				pointsWorth: 20,
				pointLoss: 10
			}

			testTeacher
			.post('/api/course/smushdapcs/assignment/create')
			.send(newAssignment)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				assignment = res.body;
				done();
			});
		});
	});


	describe('question', function(){
		it('should create a question', function(done){
			testTeacher
			.post('/api/course/smushdapcs/assignment/' + assignment._id + '/question/create')
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should create two other questions', function(done){
			async.parallel([
				function(callback){
					testTeacher
					.post('/api/course/smushdapcs/assignment/' + assignment._id + '/question/create')
					.end(function(err, res){
						callback(err, res.status);
					})
				},
				function(callback){
					testTeacher
					.post('/api/course/smushdapcs/assignment/' + assignment._id + '/question/create')
					.end(function(err, res){
						callback(err, res.status);
					});
				},
				function(callback){
					testTeacher
					.post('/api/course/smushdapcs/assignment/' + assignment._id + '/question/create')
					.end(function(err, res){
						callback(err, res.status);
					});
				}
			], function(err, results){
				expect(results[0]).to.equal(200);
				expect(results[1]).to.equal(200);
				expect(results[1]).to.equal(200);
				done();
			});
		});


		it('should set the first to be a fill in the blank question', function(done){
			var questionEdit = {
				questionNum: 0,
				question: 'Programming is ___',
				questionType: 'fillblank',
				pointsWorth: 5,
				answerOptions: 'DANK, MEMES',
				triesAllowed: 3
			}

			testTeacher
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/edit')
			.send(questionEdit)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should set the second to be a multiple choice question', function(done){
			var questionEdit = {
				questionNum: 1,
				question: 'How dank are memes?',
				questionType: 'mc',
				pointsWorth: 5,
				answerOptions: [
						'Extremely',
						'Quite',
						'Very',
						'Indubitibly' 
					],
				mcAnswer: 3,
				triesAllowed: 3
			}

			testTeacher
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/edit')
			.send(questionEdit)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should set the third to be an frq', function(done){
			var questionEdit = {
				questionNum: 2,
				question: 'Type some long boring shit here:',
				questionType: 'frq',
				pointsWorth: 5,
				bIsHomework: true,
				triesAllowed: 'unlimited'
			}

			testTeacher
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/edit')
			.send(questionEdit)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should set the fourth to be an mc', function(done){
			var questionEdit = {
				questionNum: 3,
				question: 'What\'s the dankest letter?',
				questionType: 'mc',
				pointsWorth: 5,
				answerOptions: [
						'A',
						'B',
						'C',
						'D' ,
						'E'
					],
				mcAnswer: 0,
				triesAllowed: 3
			}

			testTeacher
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/question/edit')
			.send(questionEdit)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});
	});

	describe('edit', function(){
		it('should save new info about assignment', function(done){
			var edit = {
				name: 'Unit 1 Lab 1',
				description: 'dank memes',
				pointsWorth: 25,
				pointLoss: 5
			}

			testTeacher
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/edit')
			.send(edit)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});

		it('should open the assignment', function(done){
			var edit = {
				dueDate: new Date (2025, 1, 17),
				deadlineType: 'strict',
			}

			testTeacher
			.put('/api/course/smushdapcs/assignment/' + assignment._id + '/open')
			.send(edit)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});
	});

	describe('retrieval', function(){
		it ('should redirect and create a new submission on first time', function(done){
			testStudent
			.get('/api/course/smushdapcs/assignment/' + assignment._id)
			.end(function(err, res){
				expect(res.status).to.equal(302);
				testStudent
				.post(res.header.location)
				.end(function(err, res){
					expect(res.status).to.equal(200);
					done();
				})
			});
		});

		it('should create a new submission on first try', function(done){
			Submission.findOne({ assignmentID: assignment._id }, function(err, sub){
				expect(sub).to.exist;
				done();
			});
		});

		//wtf? index isn't fully created
		it('should not create duplicate submissions', function(done){
			testStudent
			.post('/api/course/smushdapcs/assignment/' + assignment._id + '/submission/create')
			.end(function(err, res){
				expect(res.status).to.equal(400);
				expect(res.body.errorCode).to.equal(3000);
				done();
			});
		});

		it('should simply return it every time after', function(done){
			testStudent
			.get('/api/course/smushdapcs/assignment/' + assignment._id)
			.end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			});
		});
	});
});

//Ensure tests run in order we want
module.exports.testTeacher = testTeacher;
module.exports.testStudent = testStudent;