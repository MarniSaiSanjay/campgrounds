const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, campValidator, campfoundValidator } = require('../middleware');
const campgoundController = require('../controllers/campground');
const multer = require('multer');

const { storage } = require('../cloudinary/index');
const upload = multer({storage}); // now those are stored in 'storage' we made. Now we have no use of uploads folder, so can delete it.

// NOW I'LL GROUP TOGETHER FEW ROUTES.
router.route('/')
    .get(catchAsync(campgoundController.index)) // all campgrounds
    .post(isLoggedIn, upload.array('image'), campValidator, catchAsync(campgoundController.addCampground)) // add new campground to db   
    // new campground form
router.get('/new', isLoggedIn, catchAsync(campgoundController.newCampForm)); // this must be before '/:id' as if we don't then 'new' is treated as 'id'. 

router.route('/:id')
    .get(catchAsync(campgoundController.showCamp)) // show
    .put(isLoggedIn, isAuthor, upload.array('image'), campfoundValidator, catchAsync(campgoundController.updateCamp)) // update in db
    .delete(isLoggedIn, isAuthor, catchAsync(campgoundController.delteCamp)) // delete

// edit form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgoundController.editForm));

module.exports = router;
