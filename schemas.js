const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

//defining an extension on Joi.string() to escape html in inputs.
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) { //This needs to have a function called validate, Joi will automatically call this function with the value it receives. 
                const clean = sanitizeHtml(value, { // We use a package called 'sanitize-html'. This sanitizes html input by removing all html content if entered in input.
                    allowedTags: [], // we are not allowing any tags(h1,p,img...tags)
                    allowedAttributes: {}, // not allowing any attributes. 
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value }) // if cleaned and original value are not equal we return an error we defined above.
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension); 
const campgroundSchema =  Joi.object({  // Note: this is not a mongoose shcema, this is a schema made to validate the data before we handle it to monggose. This is done to prevent errors.
    campground: Joi.object({  // we expect this campground to be object. So we use '.object' .
        title: Joi.string().required().escapeHTML().min(5).max(100),
        location: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML().min(100).max(1000)
    }).required() // i.e. campground muste be required.
})



const campfoundSchema =  Joi.object({  // Note: this is not a mongoose shcema, this is a schema made to validate the data before we handle it to monggose. This is done to prevent errors.
    campFound: Joi.object({  // we expect this campground to be object. So we use '.object' .
        title: Joi.string().required().escapeHTML().min(5).max(100),
        location: Joi.string().required().escapeHTML(),
       // image: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML().min(100).max(1000)
    }).required(), // i.e. campground muste be required.
    deleteImages: Joi.array() // this is for deleteImages array while editing the campGround, so this may/ maynot be there as user may/ may-not delete the previous images, so it is not required.
})

const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})

module.exports.campgroundSchema = campgroundSchema;
module.exports.campfoundSchema = campfoundSchema;
module.exports.reviewSchema = reviewSchema;


