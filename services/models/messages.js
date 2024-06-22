const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactMessageSchema = new Schema ({
    first_name : {
        type: String,
        required: true,
        trim: true
    },
    last_name : {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now // Set default value to the current date and time when the document is created
    },

},
{ timestamps: true }
);

const Contact = mongoose.model("Contact", ContactMessageSchema);

module.exports = Contact;