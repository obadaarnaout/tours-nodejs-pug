const mongoose = require('mongoose');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appErrors');
const Tour = require('./../models/tourModel');
const Review = require('./../models/reviewModel');

exports.createReview = catchAsync(async (req,res,next) => {

    if (!req.params.tourId || !req.body.text || !req.body.rating) {
        return next(new appError(400,'tour , text , rating can not be empty'));
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.tourId)) {
        return next(new appError(400,'tour id is not valid'));
    }

    // const reviewed = await Review.findOne({
    //     tour: req.params.tourId,
    //     user: req.loggedUser._id
    // });

    // if (reviewed) {
    //     return next(new appError(400,'you have revied this tour before'));
    // }

    const tourData = await Tour.findById(req.params.tourId);
    if (!tourData) {
        return next(new appError(400,'tour not found'));
    }

    const createdReview =  await Review.create({
        text: req.body.text,
        rating: req.body.rating,
        tour: req.params.tourId,
        user: req.loggedUser._id
    });

    res.status(200).json({
        status: 'success',
        data: createdReview
    });

});

exports.getAllReviews = catchAsync(async (req,res,next) => {
    let filter = {};
    if (req.params.tourId) {
        if (!mongoose.Types.ObjectId.isValid(req.params.tourId)) {
            return next(new appError(400,'tour id is not valid'));
        }
        filter = {
            tour: req.params.tourId
        }
    }
    const reviews = await Review.find(filter).populate('user tour');
    res.status(201).json({
        status: 'success',
        data: reviews
    });
});

exports.deleteReview = catchAsync(async (req,res,next) => {
    const reviewed = await Review.findOne({
        _id: req.params.reviewId,
        user: req.loggedUser._id
    });

    if (!reviewed) {
        return next(new appError(400,'review not found'));
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.status(204).json({
        status: 'success',
        message: 'Review deleted successfully'
    });
});
