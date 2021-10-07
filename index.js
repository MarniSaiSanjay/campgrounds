if (process.env.NODE_ENV != "production") { // if the environment we are running on is not 'production' (i.e. 'development'), then require the 'dotenv' package and take the variables we added there add them into 'process.env' in this node app. In production we don't do in this way.
    require('dotenv').config();
}
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');   // for this we should install method-override ('npm i method-override')
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const passportLocal = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');


const Campground = require('./models/campground');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const { campgroundSchema, campfoundSchema, reviewSchema } = require('./schemas');
const Review = require('./models/review');
const User = require('./models/user');

const campgroundsRoute = require('./routes/campgrounds');
// app.use('/campgrounds', campgroundsRoute); we should use this after app.use(express.urlencoded({ extended: true })); as only when we call uelencoded: true (it will parse the req sent and add it to body), now we are ready to add data to req.body(actually to parse it) and then we call routes. But if we call routes before telling to parse the data we don't get anything as req.body is undefined by default.
const reviewsRoute = require('./routes/reviews');
const authRoute = require('./routes/auth');
mongoose.Promise = global.Promise;

const dburl = process.env.DB_URL || 'mongodb://localhost:27017/camp';
mongoose.connect(dburl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useFindAndModify: false
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true })); //MUST TO PARSE DATA
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', ejsMate);    // tell express to use ejs-mate instead of normal ejs
// To remove data with prohibited characters, use:
app.use(mongoSanitize());
/* // Or, to replace prohibited characters with _, use:
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);*/
const secret = process.env.SECRET || 'asecrethere';
const store = new MongoStore({
    mongoUrl: dburl, // link to db where we want to store these sessions
    secret: secret,
    touchAfter: 24 * 3600 // (in sec) this Avoids unnecessary update of data. If the data is changed it will be updated, but if it is not changed it will not be updated(i.e. even if we send requests to update it will not be updated, will be done after every 24hrs here)
})
store.on("error", function (e) {
    console.log("Session store error!!!", e);
})

const sessionConfiguration = {
    store: store, // now mongo will be used to store sessions.
    name: 'campS', // we use this name to set the name to our cookie instead of using 'connect.sid' which is default.
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,// so not accessible through js
        // secure: true // Only work over http secured servers(https), but in localhost(http) we don't get desired results as it is not secured(https). HTTPS is far more secure than HTTP
    }
}
app.use(session(sessionConfiguration));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.0/mapbox-gl-directions.js",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css",
    "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v4.1.0/mapbox-gl-directions.css"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/diaeuyinc/", //SHOULD MATCH OUR CLOUDINARY ACCOUNT NAME! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//   // AUTHENTICATION:
app.use(passport.initialize());
app.use(passport.session()); //this should be used only after 'app.use(session())'
passport.use(new passportLocal(User.authenticate())); // this authenticate method, serializeUser, deserializeUser is added by passport.local.mongoose to User.
passport.serializeUser(User.serializeUser()); // store in a session. serializeUser(): Generates a function that is used by Passport to serialize users into the session.
passport.deserializeUser(User.deserializeUser()); // unstore in a session

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.message = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//  // ROUTES:
app.use('/campgrounds', campgroundsRoute);//  we should use this after app.use(express.urlencoded({ extended: true }));
app.use('/campgrounds/:id/reviews', reviewsRoute);
app.use('/', authRoute);






app.get('/', (req, res) => {
    res.render('home');
})

//404 ROUTE:
app.all('*', (req, res, next) => {
    // res.send("404 Error!"); // instead of responding we can throw an error.
    next(new ExpressError('Page Not Found!', 404));
})




//   // now any error irrespective of we throw or not, will reach here and be responded as mentioned in error handler.
app.use((err, req, res, next) => {
    if (!err.status) err.status = 500;
    if (!err.message) err.message = 'Something went wrong!';
    res.render('error.ejs', { err });


})

// USING DIFFERENT AVAILABLE SOURCES:
// SEE IN hints.js file 
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`LISTENING ON PORT ${port}!`);
})