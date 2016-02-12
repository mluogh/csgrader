'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var deadlineTypes = 'strict pointloss lenient'.split(' ');

var assignmentSchema = new Schema({
	courseID: { type: Schema.Types.ObjectId, required: true },
	//whether the assignment is up and viewable
	bIsOpen: { type: Boolean, default: false },
	name: { type: String, required: true},
	description: String,

	deadlineType: { type: String, enum: deadlineTypes, required: true },
	dueDate: { type: Date, required: true },

	pointsWorth: { type: Number, required: true },

	//# of points lost due to lateness
	pointLoss: Number,

	questions: [mongoose.model('Question').schema],
	exercises: [mongoose.model('Exercise').schema],

	studentSubmissions: [Schema.Types.ObjectId]
});

assignmentSchema.pre('validate', function(next) {
	//If the assignment is being opened, it must contain a due date
    if (this.bIsOpen && (typeof this.dueDate === 'undefined' || this.dueDate < Date.now())){
        return next(Error('Due date must be in the future.'));
    }else if (this.pointsWorth <= this.pointLoss){
        return next(Error('Amount of points lost due to tardiness must be less than total points.'));
    }else{
    	return next();
    }
});

mongoose.model('Assignment', assignmentSchema);
