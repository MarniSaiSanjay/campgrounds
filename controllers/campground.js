const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding"); // there are multiple services, we can require which one we want.
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeoCoding({ accessToken: mbxToken });
const { ExpressError } = require('../utilities/ExpressError');

module.exports.index = async (req, res) => {
    const campList = await Campground.find({});
    res.render('campgrounds/index', { campList });
} // this is named index as this shows all campgrounds 

module.exports.addCampground = async (req, res, next) => {     // to parse body we should app.use(express.urlencoded({ extended:true }))

    if(req.body.campground.title.trim() === "" || req.body.campground.location.trim() === "" || req.body.campground.description.trim() === ""){
        req.flash('error', 'Please enter valid inputs. Try again!');
        res.redirect('/campgrounds/new');
    }else {
    try{
const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
}).send()
  /* mapBox:
  // console.log(geoData.body.features[0]);  
  // res.send(geoData.body.features[0].geometry.coordinates); -> now we get co-ordinates of place( to get this, just see in req.body, then we will find smtg related to required in features,..... to get correct path to that )
  // The co-ordinates are [longitude, latitude].  
  */
 // geoData.body.features[0].geometry -> we get in the format { "type" : "Point", "coordinates" : [ -122.5, 37.7 ] } we will save this in db
    const newCamp = new Campground(req.body.campground);  // req.body is, for example: {"campground":{"title":"dcvdscvs","location":"vascvad"}}
        newCamp.geometry = geoData.body.features[0].geometry; // Now we save the geometry in campground object.  
        newCamp.image = req.files.map(f => ({ url: f.path, filename: f.filename })); // map in each element of array(req.files array) and take path and filename, put that in object. As map returns an array, here it returns the array of all these objects made for each element of array of req.files . So now each campground will have an array of filename and path of each image uplpoaded.
        //  console.log(newCamp.image);
        newCamp.author = req.user.id; // adding owner to campground
        await newCamp.save();
        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${newCamp.id}`);
    }catch(e) {
        if(e.message == `Cannot read property 'geometry' of undefined`){
            req.flash('error', 'Please enter a valid location. Try Again');
        }else  req.flash('error', e.message);
            res.redirect('/campgrounds/new');
    }
}
}

module.exports.editForm = async (req, res) => {
    const campFound = await Campground.findById(req.params.id);
    if (!campFound) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campFound });
}

module.exports.updateCamp = async (req, res) => { // we should even use 'isLoggedIn' here too as no one should update campground from server side(using postman...), so we apply here too. LLY at 'post req of new form', delete request...
    const { id } = req.params;   // now req.body is {"campFound":{"title":"KKD123","location":"Andhra  "}} as I used campFound[title],...
    // console.log(req.body);
    if(req.body.campFound.title.trim() === "" || req.body.campFound.location.trim() === "" || req.body.campFound.description.trim() === ""){ // If input is/are only space/s . 
        req.flash('error', 'Please enter valid inputs. Try again!');
        res.redirect(`/campgrounds/${id}`);
    }else{
    const c = await Campground.findByIdAndUpdate(id, { ...req.body.campFound }, { new: true });   // ... -> spread operator
   try {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campFound.location,
        limit: 1
    }).send()
    c.geometry = geoData.body.features[0].geometry; // updating 'geometry' of campground.
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    c.image.push(...imgs);    
    await c.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        } // removing each image in deleteImages array from cloudinary.
        await c.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } }); // removing each image based on 'filename' in 'deleteImages' array from that campground in db . 
    }
    //  console.log(`Updated document is ${c}`);
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${c.id}`);
}catch(e){
    if(e.message == `Cannot read property 'geometry' of undefined`){
        req.flash('error', 'Please enter a valid location. Try Again');
    }else  req.flash('error', e.message);
        res.redirect(`/campgrounds/${c.id}`);
}
}
}

module.exports.delteCamp = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    console.log("Deleted a document.");
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}

module.exports.showCamp = async (req, res) => {
    const { id } = req.params;
    //   const camp = await Campground.findById(id).populate('reviews').populate('author') ; // populated author to display the username who created the campground. And even the reviews had the author in it which means who created the review, so display that we need to populate author in reviews too. So I commented this to see the difference how to populate author in reviews

    const camp = await Campground.findById(id)
        .populate({
            path: 'reviews', // populate all reviews from reviews array for the campground.
            populate: {
                path: 'author' // also populate the 'author' of each review. This is nested populate
            }
        })
        .populate('author'); // populate author of the campground
    // console.log(camp);

    if (!camp) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    // console.log(camp);
    res.render('campgrounds/show', { camp });
}

module.exports.newCampForm = async (req, res) => {
    res.render('campgrounds/new');
}