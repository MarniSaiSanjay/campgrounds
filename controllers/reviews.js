const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req,res) => {
    const camp = await Campground.findById(req.params.id);
    const review  = new Review(req.body.review); // we stored the input in obj named review. As we used review[body],...
    review.author = req.user._id;
    camp.reviews.push(review);
    await camp.save();
    await review.save();
    req.flash('success', 'Successfully added a new review!');
    res.redirect(`/campgrounds/${camp.id}`);
}

module.exports.deleteReview = async (req,res)=> {
    await Campground.findByIdAndUpdate(req.params.id, {$pull: { reviews: req.params.reviewId }}); 
    // we need not save above campgound by saving in a variable and .save() to it. As $pull directly removes it. 
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted a review!');
   res.redirect(`/campgrounds/${req.params.id}`)

}