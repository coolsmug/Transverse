const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = ({
    img:{
        url: String,       // Cloudinary URL
        publicId: String,
    },
    image:{
        url: String,       // Cloudinary URL
        publicId: String,
    },
    heading: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    about: {
        type: String,
        required: true,
        trim: true
    }
})

const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;