const express=require('express')
const userRouter=express()
const userControllers=require('../controllers/userController')
const chatControllers=require('../controllers/chatController')
const authentication=require('../middleware/auth')
const multer=require('multer')


// Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'Images/'); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null,file.originalname); // Use the original file name for the uploaded file
  },
});
const upload = multer({ storage: storage });


userRouter.post('/generateOTP',userControllers.generateOTP)
userRouter.post('/verifyOTP',userControllers.verifyOTP)
userRouter.post('/register',userControllers.userRegister)
userRouter.get('/userVerification',userControllers.userVerified)
userRouter.get('/userStatus',userControllers.userStatus)
userRouter.post('/logout',userControllers.logout)
userRouter.post('/uploadImage',authentication,upload.single('img'),userControllers.uploadImage)
userRouter.get('/userData',authentication,userControllers.userData)
userRouter.get('/userList',authentication,userControllers.getUsers)


userRouter.post('/createChatRoom',authentication,chatControllers.createChatRoom)
userRouter.get('/messages',authentication,chatControllers.getMessages)
module.exports=userRouter