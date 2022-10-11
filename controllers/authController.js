const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const validator = require('validator');
const appError = require('./../utils/appErrors');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('./../utils/email');

exports.checkViewLoggedIn = catchAsync(async (req,res,next) => {

    if (req.cookies.jwt) {
        const token = req.cookies.jwt;
        if (!token) {
            return next();
        }

        const validToken = await JWT.verify(token, process.env.JWT_SECRET);

        const loggedUser = await User.findOne({'_id':validToken.id});

        if (!loggedUser) {
            return next();
        }
        res.locals.loggedUser = loggedUser;
    }
    next();
});

exports.checkLoggedIn = catchAsync(async (req,res,next) => {

    let token = undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new appError(400,'You are not logged in'));
    }

    const validToken = await JWT.verify(token, process.env.JWT_SECRET);

    req.loggedUser = await User.findOne({'_id':validToken.id});

    if (!req.loggedUser) {
        return next(new appError(400,'user not found'));
    }
    next();
});

exports.checkAdminLoggedIn = catchAsync(async (req,res,next) => {

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return next(new appError(400,'You are not logged in'));
    }

    const token = req.headers.authorization.split(' ')[1];

    const validToken = await JWT.verify(token, process.env.JWT_SECRET);
    console.log(validToken);

    const foundUser = await User.findOne({'_id':validToken.id});

    if (!foundUser) {
        return next(new appError(400,'please login'));
    }

    if (foundUser.admin && foundUser.admin === 0) {
        return next(new appError(400,'You do not have permission'));
    }
    req.loggedUser = foundUser;
    next();
});

exports.registerBody = catchAsync(async (req,res,next) => {
    if (!req.body.confirmPassword || !req.body.password || !req.body.username) {
        next(new appError(400,'confirmPassword , password , username are required'));
    }
    if(!validator.equals(req.body.password,req.body.confirmPassword)){
        next(new appError(400,'confirmPassword , password not matching'));
    }
    if(!validator.isAlphanumeric(req.body.username)){
        next(new appError(400,'username is invalid'));
    }
    next();
});

exports.loginBody = catchAsync(async (req,res,next) => {
    console.log(req);
    if (!req.body.password || !req.body.username) {
        next(new appError(400,'password , username are required'));
    }
    if(!validator.isAlphanumeric(req.body.username) && !validator.isEmail(req.body.username)){
        next(new appError(400,'username is invalid'));
    }
    next();
});

exports.register = catchAsync(async (req,res,next) => {
    const newUser = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        image: req.body.image
    });
    const token = JWT.sign({id: newUser._id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRE});
    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE * 60 * 60 * 24 * 1000)),
        httpOnly:true
    };
    if (process.env.NODE_ENV != 'development') {
        cookieOptions.secure = true;
    }
    res.cookie('jwt',token,cookieOptions);
    newUser.password = "";
    res.status(201).json({
        status: 'success',
        token: token,
        data: newUser
    });
});

exports.login = catchAsync(async (req,res,next) => {
    const {username,password} = req.body;

    const foundUser = await User.findOne({
        $or: [
            {
               'username':  username
            },
            {
               'email':  username
            }
        ]
    }).select('+password');

    passwordValid = await bcrypt.compare(password, foundUser.password);

    if (!passwordValid) {
        return next(new appError(400,'password is invalid'));
    }
    
    const token = JWT.sign({id: foundUser._id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRE});
    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE * 60 * 60 * 24 * 1000)),
        httpOnly:true
    };
    if (process.env.NODE_ENV != 'development') {
        cookieOptions.secure = true;
    }
    res.cookie('jwt',token,cookieOptions);
    foundUser.password = "";
    res.status(201).json({
        status: 'success',
        token: token,
        data: foundUser
    });
});

exports.logout = catchAsync(async (req,res,next) => {
    const cookieOptions = {
        expires: new Date(Date.now() + (10 * 1000)),
        httpOnly:true
    };
    if (process.env.NODE_ENV != 'development') {
        cookieOptions.secure = true;
    }
    res.cookie('jwt','',cookieOptions);
    res.status(200).json({
        status: 'success'
    });
});

exports.forgot = catchAsync(async (req,res,next) => {
    if (!req.body.email) {
        return next(new appError(400,'email is required'));
    }
    if(!validator.isEmail(req.body.email)){
        return next(new appError(400,'email is invalid'));
    }
    const {email} = req.body;

    const hashForgot = crypto.randomBytes(32).toString('hex');
    const resetExpireDate = Date.now() + (60 * 60 * 1000);

    const foundUser = await User.findOneAndUpdate({
        'email':  email
     },{
        'resetHash': hashForgot,
        'resetExpireDate': resetExpireDate
     },{
        new: true
     });

    if (!foundUser) {
        return next(new appError(400,'user not found'));
    }

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${hashForgot}`;
    const message = `reset password link : ${resetUrl}`;

    await sendEmail({
        to: 'obadaarnaout@gmail.com',
        subject: 'Reset Password',
        text: message
    });

    res.status(201).json({
        status: 'success',
        message: 'Please check your email inbox'
    });
});

exports.reset = catchAsync(async (req,res,next) => {
    if (!req.params.token || !req.body.password || !req.body.confirmPassword) {
        return next(new appError(400,'token , password , confirmPassword are required'));
    }
    if(!validator.equals(req.body.password,req.body.confirmPassword)){
        return next(new appError(400,'confirmPassword , password not matching'));
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const foundUser = await User.findOneAndUpdate({
        resetHash:  req.params.token,
        resetExpireDate: {$gte: Date.now()}
     },{
        'password': passwordHash,
        'resetHash': '',
        'resetExpireDate': Date.now()
     },{
        new: true
     });

    if (!foundUser) {
        return next(new appError(400,'user not found'));
    }
    const token = JWT.sign({id: foundUser._id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRE});
    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE * 60 * 60 * 24 * 1000)),
        httpOnly:true
    };
    if (process.env.NODE_ENV != 'development') {
        cookieOptions.secure = true;
    }
    res.cookie('jwt',token,cookieOptions);
    res.status(200).json({
        status: 'success',
        token: token,
        data: foundUser
    });
});

