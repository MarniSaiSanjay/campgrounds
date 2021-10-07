// USING DIFFERENT AVAILABLE SOURCES:
/* For Authentication we use 'passport' also we can use 'passport-local' and 'passport-local-mangoose'. 'Passport-local' require 'passport' and 'passport-local-mongoose' requires 'passport-local' So we should install all 3 npm's*/
{/* For STORING IMAGES: 
We need to use enctype: "multipart/form-data" to support form to take files, enctype='multipart/form-data' is an encoding type that allows files to be sent through a POST
 In order to parse that file taken we need to use 'multer' middleware. Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
 Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
 Now to store images/files we use 'cloudinary', it stores images and sends back the url of file it stored and that url is stored in our mongo database 
 Now we have the api key and others which we need to make use of 'cloudinary', but we shouldn't include them in code. So we use  ENV, it is dotenv (.env) So we should make a .env file on the top level of application and put our secrets there. To get access of this .env inside of our application we should install an npm named 'dotenv' 
    and the add if condiiton on the top of index.js file 
 Now to store the files that multer is parsing in cloudinary we use 'Multer Storage Cloudinary' for that we need to install 'cloudinary' and 'multer-storage-cloudinary'
 When we use cloudinary storage we get req.files as an array with elements similar to below:
    {"fieldname":"image","originalname":"Screenshot 2021-08-16 at 9.30.08 AM.png",
    "encoding":"7bit","mimetype":"image/png",
    "path":"https://res.cloudinary.com/diaeuyinc/image/upload/v1629915013/Campground/dnhahacfgu4vwmefeb2y.png",
    "size":194906,"filename":"Campground/dnhahacfgu4vwmefeb2y"
    }
    Now the files are stored in cloudinary and the path to that image is added to req.files (if we google the path we get the image too) we can even delete uploads folder now.
 
    For MAPS:
    We use mapbox-sdk, in order to easily use mapbox instead of using syntaxes provided in docs. For that we should install it( npm install @mapbox/mapbox-sdk ).
We use mapbox marker(to get pin on maps), navigation(to get zoom options and compass), pop-up(to display msg when done an action on pin).
We use mapbox-clusters to get a count of places on whole in entire map. 

SECURITY ISSUES:
 If the user enters username as { "$gt": ""}, and when we use db.db_name.find({username: { "$gt": ""}}) we get al users which is not required, so we shoudn't allow users to enter $, . ,.... or any query that we generally use. 
    So for this we use npm 'Express Mongoose Sanitize': This module searches for any keys in objects that begin with a '$' sign or contain a '.', from req.body, req.query or req.params. 
    It can then either: completely remove these keys and associated data from the object, or replace the prohibited characters with another allowed character.

    // To remove data with prohibited characters, use:
    app.use(mongoSanitize()); -> this won't add the data with prohibited characters to req.body/req.params,...just ignores it. 

     // Or, to replace prohibited characters with '_' use: -> replaces only probhited characters but not entire data. ex:  If we have $gt=dbdbjkb; then we will get _gt="dbdbjkb" (in req.respective_field)
    app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
    );
  Cross site scripting(XSS): One can insert their own script in others web publications which does fraud. They can direclty add them as a query string in others web and perform acitvites they need.
    Cross-Site Scripting (XSS) attacks are a type of injection, in which malicious scripts are injected into trusted websites. -> https://xss-game.appspot.com 
 If we enter any html tags in iput,(say in new campground) those are not treated as html bcz we use '=' in ejs(<%= %>) to display them on page and this ignores any html in the content it validates. Ex: If we enter something like <h1>Ok</h1>, then these <h1> is not treated as html, but treated as '<, >' -> entities. 
 But we are not escaping in every scenario. That is in show.ejs we use <%- %> to make a js variable(so it don't skip any html), so if we use scripts(like <script>alert("hi")</script> which is also html), it will be treated as html only which is not desired.SO we don't want to allow user to allow user to enter any sort of script anywhere.
 So we use express-validator tool. Actually we can replace JOI with it as this does all JOI does and also offers sanitization i.e. html escaping. We can even write our own validator(or)methods in JOI to get desired results. So I defined escapeHTML for this.

 Hemltet:
 Helmet helps you secure your Express apps by setting various HTTP headers.
    Content Security Policy(CSP): It is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement to distribute malware.
    We can set what is allowed and what is not. CSP allows us to specify on a particular application, what sources we use, what scripts to use.(we can set that, we are allowed only to use images from this website, fonts from that website and scripts from this end....). We can seta a list of acceptable sources.
    So as in helmet we have this CSP we should mention all resources we use so that is allows them, else they will not be allowed. I mean we should tell to allow unsplash images, cloudinary, mapbox, bootstrap,.... 

connect-mongo: 
 We use mongo for session store. That is the session information is stored in mongo.   
*/
}