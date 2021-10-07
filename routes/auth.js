const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');

const { isLoggedIn } = require('../middleware');
const authController = require('../controllers/auth');

router.route('/register')
    .get((req, res) => { res.render('auth/register'); }) // form to register
    .post(catchAsync(authController.registerUserIn_db)); //  registering in db
router.route('/login')
    .get(authController.loginForm) //  login form
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), authController.login); // login using passport
// logout
router.get('/logout', isLoggedIn, authController.logout);

module.exports = router;
// we have 'isAunthenticated' method that comes from passport which is added to the request object. So we use them to check if user is authenticated or not.
