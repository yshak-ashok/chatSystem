const User = require('../models/userModel');
const Room = require('../models/roomModel');
const Message = require('../models/messageModel');

const createChatRoom = async (req, res) => {
    try {
        const data = req.body;
        const userIds = [data.receiverID, data.senderID].sort();
        const existingData = await Room.find({ users: userIds });
        if (existingData.length == 0) {
            const roomData = await Room.create({
                users: userIds,
            });
            res.status(201).json([roomData]);
        } else {
            res.status(201).json(existingData);
        }
    } catch (err) {
        console.error(err);
    }
};

const saveMessage = async (roomId, user, message, id, timestamp) => {
    try {
        // Find a message with the given roomId
        let chatMessage = await Message.findOne({ roomId });
        // If message with roomId doesn't exist, create a new one
        if (!chatMessage) {
            chatMessage = new Message({
                roomId,
                chats: [{ user, message, id, timestamp }],
            });
        } else {
            // If message with roomId exists, push new chat to the chats array
            chatMessage.chats.push({ user, message, id, timestamp });
        }

        // Save the message to the database
        await chatMessage.save();
        return chatMessage;
    } catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
};

const getMessages = async (req, res) => {
    try {
        const roomid = req.query.id;
        const roomData = await Message.findOne({ roomId: roomid }).lean(); // Using lean() here
        console.log(roomData);
        if (!roomData) {
            return res.status(204).send()
        }
        const chats = roomData.chats.map((chat) => ({
            user: chat.user,
            message: chat.message,
            id: chat.id,
            timestamp: chat.timestamp,
        }));
        return res.status(200).json(chats);
    } catch (error) {
        console.log(error);
    }
};
module.exports = { createChatRoom, saveMessage, getMessages };
