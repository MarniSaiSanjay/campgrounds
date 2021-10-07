const mongoose = require('mongoose');

const Campground = require('../models/campground'); // here in path we are using one extra '.' bcz we have to move one folder back.
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');

mongoose.Promise = global.Promise;

// we will run this file separately when we want to know about database, so we do this in separate file.
// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology:true
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0;i<100;i++){
        var a = Math.floor(Math.random() *18 + 1);
        const newCamp = new Campground({
            author: "61250398ef036789454c8658", // for seeds only
             title: `${descriptors[a]} ${places[a]}`,
             location: `${cities[i].city} , ${cities[i].state}`,
             image:[
                {
                    url: 'https://res.cloudinary.com/diaeuyinc/image/upload/v1629949306/Campground/ahc5x6ksnvdk3cjuzfjm.jpg',
                    filename: 'Campground/ahc5x6ksnvdk3cjuzfjm'
                }
             ],
             description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore porro placeat ab, officia excepturi odit sit quae iusto maxime doloremque omnis nihil dolor magni odio.",
             price: 140+a,
             geometry : { 
                 type : "Point",
                 coordinates : [
                     cities[i].longitude,
                     cities[i].latitude
                 ]
                
             }
        })
        await newCamp.save();
    }
}
seedDB().then( () => {
    mongoose.connection.close(); // This is to close the connection after completing the required tasks. We can see it closing if we run this seed.js using node instead of nodemon as in nodemon it runs continously till we stop.
})
