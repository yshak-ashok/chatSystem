const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    roomId: String,
    chats: [{
        user: String,
        message: String,
        id:String,
        timestamp:String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);