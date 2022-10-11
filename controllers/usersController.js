const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const validator = require('validator');
const appError = require('./../utils/appErrors');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req,file,cb) => {
//         cb(null,'public/img/users');
//     },
//     filename: (req,file,cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null,`user-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null,true);
    }
    else{
        cb(new appError('Not an image',400),false);
    }
}



const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadImage = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req,res,next) => {
    if (!req.file) {
        return next();
    }
    req.file.filename = `user-${Date.now()}.jpeg`;
    await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`);
    next();
})

exports.updatePassword = catchAsync(async (req,res,next) => {
    if (!req.body.currentPassword || !req.body.confirmPassword || !req.body.newPassword) {
        return next(new appError(400,'currentPassword , newPassword , confirmPassword are required'));
    }
    const currentPassword = req.body.currentPassword;

    const foundUser = await User.findOne({'_id':req.loggedUser.id}).select('+password');
    if (!foundUser) {
        return next(new appError(400,'user not found'));
    }


    passwordValid = await bcrypt.compare(currentPassword, foundUser.password);

    if (!passwordValid) {
        return next(new appError(400,'password is invalid'));
    }

    if(!validator.equals(req.body.newPassword,req.body.confirmPassword)){
        return next(new appError(400,'confirmPassword , newPassword not matching'));
    }

    const {newPassword,confirmPassword} = req.body;
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await User.findOneAndUpdate({
        _id:  req.loggedUser.id
     },{
        'password': passwordHash
     },{
        new: true
     });

     res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
    });

});

exports.updateUserData = catchAsync(async (req,res,next) => {
    if (req.body.username) {
        if (!validator.isAlphanumeric(req.body.username)) {
            return next(new appError(400,'username is invalid'));
        }
        req.loggedUser.username = req.body.username;
    }
    if (req.body.email) {
        if (!validator.isEmail(req.body.email)) {
            return next(new appError(400,'email is invalid'));
        }
        req.loggedUser.email = req.body.email;
    }
    if (req.file && req.file.filename) {
        req.loggedUser.image = req.file.filename;
    }
    await req.loggedUser.save();

    res.status(200).json({
        status: 'success',
        message: 'user data updated successfully'
    });
});

exports.deleteUser = catchAsync(async (req,res,next) => {
    await req.loggedUser.delete();
    res.status(204).json({
        status: 'success',
        message: 'user deleted successfully'
    });
});

exports.getAllUsers = (req,res) => {
    res.status(200).json({
        status: 'success',
        data: users
    });
}