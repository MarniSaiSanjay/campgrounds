const User = require('../models/user');

module.exports.registerUserIn_db = async (req,res,next) => {
    try{
    const { username, email, password } = req.body;
    const makeUser = new User({username, email});
    const result = await User.register(makeUser, password); // this will automatically save it.
   // console.log(result);
    req.login(result, err => { // after succesfully registering we should login the user. So we use 'req.login' as the middleware we use for '/login' (passport.authenticate) this only works only after we created so we use req.login()
        if(err)  return next(err);
        req.flash('success', 'Welcome to CampIt!');
        res.redirect('/campgrounds');
    })
    }catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
   // we do this bcz if we have an error where the username already exists, it is not good to have the error in a seperate page, but it will be better to have a flash message on the top of register page.
   // So I'm trying it and if I get any erro in code(not from mongoose,...) we will get a neat flash message.
}

module.exports.loginForm = (req,res) => {
    res.render('auth/login');
}

module.exports.login = (req,res) =>{ // this route is to authenticate local. to have authentication with google/fb/... we can set up another route to authenticate google/fb
    // if it reach here then the user is authencticated successfully. // failureFlash: true, -> flashes the error msg on failure; failureRedirect: '/login' -> redirects to '/login' on failure.
    
    req.flash('success', `Welcome back ${req.user.username}`);
    //  const redirectURL = req.session.returnTo  || '/campgrounds'; // we set a default value, i.e. if user just clicks on login we don't have any redirectURL, so we should take him to '/campgrounds'.
    //  delete req.session.returnTo; // just delete 'returnTo' from session.
    //  res.redirect(redirectURL);
     res.redirect('/campgrounds');
}

module.exports.logout = (req,res) => {
    req.logOut();
    req.flash('success', 'Good Bye!');
    res.redirect('/campgrounds');
}