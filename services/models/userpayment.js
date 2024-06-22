const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserPaymentSchema = new Schema({
    paymentId: {
        type: String,
        required: true,
        trim: true,
    },
    house_name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    paymentStatus: {
        type: String,
        required: true,
        trim: true,
    },
    propertyId: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Payment = mongoose.model('Payment', UserPaymentSchema);

module.exports = Payment;
