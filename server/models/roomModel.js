const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema(
    {
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true },
);

// Define the Room model
const Room = mongoose.model('Room', roomSchema);

// Export the Room model
module.exports = Room;
