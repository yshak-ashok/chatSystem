const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expiry: { type: Date, required: true, expires: 0 }, 
});

module.exports = mongoose.model('Otp', otpSchema);
