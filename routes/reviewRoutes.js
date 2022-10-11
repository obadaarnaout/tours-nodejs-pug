const express = require('express');

const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const reviewRouter = express.Router({mergeParams: true});


reviewRouter.route('/').get(reviewController.getAllReviews).post(authController.checkAdminLoggedIn,reviewController.createReview);
reviewRouter.route('/:reviewId').delete(authController.checkLoggedIn,reviewController.deleteReview);


module.exports = reviewRouter;