const express = require('express');
const dbConnect = require('./config/dbConnect');
const dotenv = require('dotenv').config();
const bodyparser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');

dbConnect();
const app = express();
const server = http.Server(app);
const socketIO = require('socket.io');
const io = socketIO(server);

// Middleware setup
app.use(
    cors({
        origin: 'http://localhost:4200',
        credentials: true,
    }),
);
app.use(express.static(path.join(__dirname, 'Images')));
app.use(bodyparser.json());
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 10,
        },
    }),
);
app.use(express.json());

// Router setup
const { saveMessage } = require('./controllers/chatController');
const userRouter = require('./routers/userRouter');
const { log } = require('console');
app.use('/user', userRouter);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server Running Port:${PORT}`);
});

io.on('connection', (socket) => {

    socket.on('join', (data) => {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('user joined');
    });

    socket.on('message', async (data) => {
        try {
            await saveMessage(data.room, data.user, data.message, data.id, data.timestamp);
            io.in(data.room).emit('new message', { user: data.user, message: data.message, id: data.id, timestamp: data.timestamp });
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    socket.on('userJoin', (data) => {
        socket.join(data.id);
        socket.broadcast.to(data.id).emit('user connected');
    });
    
    socket.on('status', async (data) => {
        try {
            io.in(data.id).emit('userStatus', { id: data.id, isActive: data.isActive,userId:data.userId });
        } catch (error) {
            console.error(error);
        }
    });
});


