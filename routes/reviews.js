const express = require('express');
const router = express.Router({ mergeParams: true }); // Express router keeps the params separate, as prefix url has 'id' in it, by default we don't have access to that 'id' here but we need it here. (Routers get seperate params.) So we pass { mergeParams: true } to merge all the params. So now we have access to 'id' here.

const Campground = require('../models/campground');
const Review = require('../models/review');

const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');

// const { reviewSchema } = require('../schemas'); 
const { reviewValidator, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviewController = require('../controllers/reviews');

// create review
router.post('/', isLoggedIn, reviewValidator ,catchAsync(reviewController.createReview));
// delete review
router.delete('/:reviewId',  isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));


module.exports =router;
