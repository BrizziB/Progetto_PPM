var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
	username: String,
	password: String,
	admin : { type: Boolean, default: false},
	votato : {type: Boolean, default: false}

},{collection: 'User'});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);