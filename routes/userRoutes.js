const express = require('express');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');

const userRouter = express.Router();


userRouter.route('/register').post(authController.registerBody,authController.register);
userRouter.route('/login').post(authController.loginBody,authController.login);
userRouter.route('/logout').get(authController.logout);
userRouter.route('/forgot').post(authController.forgot);
userRouter.route('/resetpassword/:token').patch(authController.reset);
userRouter.route('/updatepassword').post(authController.checkLoggedIn,usersController.updatePassword);
userRouter.route('/updateuser').post(authController.checkLoggedIn,usersController.uploadImage,usersController.resizeUserPhoto,usersController.updateUserData);
userRouter.route('/deleteuser').delete(authController.checkLoggedIn,usersController.deleteUser);
userRouter.route('/').get(usersController.getAllUsers);

module.exports = userRouter;