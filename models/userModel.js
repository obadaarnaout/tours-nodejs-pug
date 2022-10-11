const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true,'Email address is required'],
        validate: [validator.isEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        select: false
    },
    image: {
        type: String,
        default: 'default.jpg'
    },
    admin:{
        type: Number,
        default: 0
    },
    resetHash:{
        type: String
    },
    resetExpireDate:{
        type: Date
    },
});


userSchema.pre('save', function(next) {
    const self = this;
    if (!self.isModified('password')) return next();

    bcrypt.hash(self.password, 12, function(err, hash) {
        if (err) return next(err);
        // override the cleartext password with the hashed one
        self.password = hash;
        next();
    });
});

const User = mongoose.model('Users',userSchema);



module.exports = User;