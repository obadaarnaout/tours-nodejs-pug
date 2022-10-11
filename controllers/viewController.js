const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appErrors');

exports.getOverview =  catchAsync(async (req,res,next) => {
    const tours = await Tour.find();

    res.status(200).render('overview',{
		title: 'All Tours',
        tours:tours
	});
}); 
exports.getTour = catchAsync(async (req,res,next) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate([{
        path: 'guides',
        select: '-__v'
    },
    {
        path: 'reviews',
        select: '-__v'
    }
    ]);

    res.status(200).render('tour',{
		title: tour.name,
        tour:tour
	});
});
exports.showLogin =  catchAsync(async (req,res,next) => {

    res.status(200).render('login',{
		title: 'Login'
	});
}); 
exports.profile =  catchAsync(async (req,res,next) => {

    res.status(200).render('profile',{
		title: 'Profile'
	});
}); 