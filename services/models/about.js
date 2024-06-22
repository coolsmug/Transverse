const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AboutSchema = new Schema({
    img:{
        url: String,       // Cloudinary URL
        publicId: String,
    },

    heading: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now 
    },
},
{ timestamps: true }
);

const Vision = mongoose.model("Vision", AboutSchema);
module.exports = Vision;