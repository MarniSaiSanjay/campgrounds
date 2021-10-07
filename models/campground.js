const mongoose = require('mongoose');
const { campfoundSchema } = require('../schemas');
const Schema = mongoose.Schema;
const Review = require('./review');
const User = require('./user');

// https://cloudinary.com/documentation/image_transformations -> Now to apply image transformation, we can use transformation by applying them after upload in the url.
// Transformation URL structure ->  https://res.cloudinary.com/<cloud_name>/<asset_type>/<delivery_type>/<transformations>/<version>/<public_id>.<extension>
// Ex: https://res.cloudinary.com/demo/image/upload/c_crop,g_face,h_400,w_400/r_max/c_scale,w_200/lady.jpg 
// Ex: https://res.cloudinary.com/diaeuyinc/image/upload/w_300/v1630058360/Campground/kw09g7ncpbm4wzpz41nt.jpg
// As we are already storing url images, we can use a virtual to add these transformations in url after /uploads. But we can only add virtuals to schema. Here we want virtual property to each image.
// So for this reason we define a seperate image schema. So we move image model to a seperate schema and we then define a virtual on it

const opt = { toJSON: { virtuals: true } };

const ImageSchema = new Schema(
  {
    url: String,
    filename: String
  }
)

ImageSchema.virtual('thumbnail').get(function () { // we name virtual as 'thumbnail'
  return this.url.replace('/upload', '/upload/w_210,h_200'); // 'this' refers to particular image. 
}) // we don't need to store this in db, but just modifying the url is enough. So every time we call this thumbnail it will replace the '/upload' with 'upload/w_200' . 

const campgroundSchema = new Schema({
  title: String,
  location: String,
  price: {
    type: Number,
    min: 0
  },
  description: String,
  // image: String, as we are using multiple images we are using array.
  // image: [
  //   {
  //     url: String,
  //     filename: String
  //   }
  // ], we moved this into seperate schema so that we can define a virtual on it to apply transformation on it.
  image: [ImageSchema],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  geometry: { // refer https://mongoosejs.com/docs/geojson.html. We will store 'geometry' in db, which is of format { "type" : "Point", "coordinates" : [ -122.5, 37.7 ] } 
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  } // this is GeoJSON format, we use this format as MongoDB supports the GeoJSON object types. Refer: https://docs.mongodb.com/v4.4/reference/geojson/ . We need to follow this GeoJSON of we need to follow these operators later on. And also many use this geoJSON for these purposes. 
}, opt);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `
  <h5> <a href = "/campgrounds/${this._id}"> ${this.title} </a> </h5>
  <h6>${this.location}</h6>
  <p>${this.description.substring(0,34)}...</p>
  `
})


campgroundSchema.post('findOneAndDelete', async function (doc) { // Even if we called 'findByIdAndDelete',it triggers the 'findOneAndDelete' middleware. So we set post middleware for 'findOneAndDelete'.
  // as this is post, we have access to complete data(here complete campground object) that is deleted. We named it as 'doc' by passsing it as argument to function.
  console.log(doc);
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews }
    }) // This we are telling to delete all reviews whose ID is in the array, 'document.reviews' .
  }

}) // This is actually a query a middleware, passes the document that is delated to the callback function. And also if we change the way to delete the campground, i.e. instead of using a  method that triggers 'findOneAndDelete' middleware if we use anything else then this post middleware won't work for them.

module.exports = mongoose.model('Campground', campgroundSchema); // directly making and exporting model at once.


{/*   Mapbox stores dataset features as collections of GeoJSON features.
//   Geometry: This describes the shape and the location of each feature. You can specify Points, LineStrings, Polygons. The location and the exact shape of each feature is determined by the coordinates that are specified.
//   Properties: This can contain any JSON object. Some examples of common properties that are applied to Mapbox datasets include title and description to include in popups in a web application.
//   {
//   "type": "FeatureCollection",
//   "features": [
//     {
//       "type": "Feature",
//       "properties": {
//         "id": "marker-iv1qi3x10",
//         "title": "Burnham Park",
//         "description": "A lakefront park on Chicago's south side.",
//         "marker-size": "medium",
//         "marker-color": "#1087bf",
//         "marker-symbol": "marker-blue"
//       },
//       "geometry": {
//         "coordinates": [
//           -87.603735,
//           41.829985
//         ],
//         "type": "Point"
//       },
//       "id": "0de616c939ce2f31676ff0294c78321b"
//     }
//   ]
// }  So all our matter for popuo should be in properties object. Instead of changing whole db, we can define a virtual and add virtual to res.JSON() 
To do that we should pass the option  toJSON: { virtuals: true } to schema*/ 
}