const { campgroundSchema, campfoundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

const isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){ // this isAuthenticated is coming from passport
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    } next();
}
module.exports.isLoggedIn = isLoggedIn;

module.exports.campValidator = (req,res,next) => {
    // console.dir(req.body);
     const { error } = campgroundSchema.validate(req.body);
     if( error ){
         const msg = error.details.map(el => el.message).join(',');
         throw new ExpressError(msg, 400);
     }else{
         next();    // i.e. if there is no error call next middleware, i.e. middleware defined in route directly.
     }
  }

 module.exports.campfoundValidator = (req,res,next) => {
    // console.dir(req.body);
     const { error } = campfoundSchema.validate(req.body);
     if( error ){
         const msg = error.details.map(el => el.message).join(',');
         throw new ExpressError(msg, 400);
     }else{
         next();    // i.e. if there is no error call next middleware, i.e. middleware defined in route directly.
     }
 }
 
 module.exports.isAuthor = async(req,res,next) => {
     const { id } = req.params;
     const campground = await Campground.findById(id);
     if(!campground.author.equals(req.user._id)){
         req.flash('error', 'Not allowed to do that!');
         return  res.redirect(`/campgrounds/${id}`);
     }
     next();
 }
 
 module.exports.reviewValidator = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if( error ){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();    // i.e. if there is no error call next middleware, i.e. middleware defined in route directly.
    }
} 

module.exports.isReviewAuthor = async(req,res,next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'Not allowed to do that!');
        return  res.redirect(`/campgrounds/${id}`);
    }
    next();
}