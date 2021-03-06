const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
})
//  // We are free to define our User how we like. Passport-Local Mongoose will add a 'username', hash and salt field to store the username, the hashed password and the salt value.
userSchema.plugin(passportLocalMongoose); // this will add on 'username' and 'passwords' fields for our schema. Apart from those two we need to add on what we need in 'userSchema'. 
module.exports = mongoose.model('User', userSchema);