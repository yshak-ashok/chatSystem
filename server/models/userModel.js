const mongoose = require('mongoose');
const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    image:{
        type:String,
        default:'',
      }
});
module.exports = mongoose.model('User', userModel);
