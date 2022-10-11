const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const viewRouter = express.Router();

viewRouter.use(authController.checkViewLoggedIn);
viewRouter.route('/').get(viewController.getOverview);
viewRouter.route('/tour/:slug').get(viewController.getTour);
viewRouter.route('/login').get(viewController.showLogin);
viewRouter.route('/profile').get(viewController.profile);

module.exports = viewRouter;