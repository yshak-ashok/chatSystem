const Otp = require('../models/otpModel');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const JWT = require('jsonwebtoken');
const { isErrored } = require('nodemailer/lib/xoauth2');
const sharp = require('sharp');

const generateOTP = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email });
        if (user.isVerified == false) {
            const otp = otpGenerator.generate(4, {
                upperCaseAlphabets: false,
                specialChars: false,
                lowerCaseAlphabets: false,
            });
            const existingOtp = await Otp.findOne({ email });
            const expiryTime = Date.now() + 1 * 60 * 1000;
            if (existingOtp) {
                await existingOtp.updateOne({ otp, expiry: expiryTime });
            } else {
                const newOtp = new Otp({ email, otp, expiry: expiryTime });
                await newOtp.save();
            }
            res.status(201).json({ message: 'OTP successfully sent to your email', success: true });
            await sendOtpEmail(req, email, otp);
        } else {
            res.status(409).json({ message: 'User already verified', success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function sendOtpEmail(req, email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASS,
            },
            secure: true,
        });
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Verify Email',
            text: `Hi Customer, Please enter the OTP ${otp} to create your account.`,
        };
        //await transporter.sendMail(mailOptions);

        return otp;
    } catch (emailError) {
        res.status(500).json({ error: 'Internal server error' });
        throw new Error('Email sending error: ' + emailError.message);
    }
}

const verifyOTP = async (req, res) => {
    try {
        const { otp, email } = req.body;
        const user = await User.findOne({ email: email });
        if (user.isVerified == false) {
            const otpRecord = await Otp.findOne({ email });
            if (!otpRecord || otpRecord.expiry < Date.now() || otpRecord.otp !== otp) {
                return res.status(401).json({ error: 'Invalid OTP or expired' });
            }
            await User.updateOne({ email }, { $set: { isVerified: true } });
            await otpRecord.deleteOne();
            res.status(201).json({ message: 'OTP verified' });
        } else {
            res.status(409).json({ message: 'User already verified', success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const userRegister = async (req, res) => {
    try {
        const { name, email } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            const newUser = new User({ name: name, email: email });
            await newUser.save();
            res.status(201).json({ message: 'Registration completed', success: true });
        } else {
            res.status(409).json({ message: 'User already exist', success: false });
        }
    } catch (error) {
        console.error(error);
    }
};
const userVerified = async (req, res) => {
    try {
        const email = req.query.email;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'User not registered', success: false });
        } else {
            if (user.isVerified) {
                if (!user.isActive) {
                    await User.updateOne({ email }, { $set: { isActive: true } });
                    user.isActive = true;
                    const userID = { _id: user._id };
                    const userImage = { profilePicture: user.image };
                    const userStatus = { isActive: user.isActive };
                    const token = JWT.sign({ email }, process.env.TOKEN_SECRET_KEY);
                    res.status(201).json({ message: 'User Verified', success: true, token, userID, userImage, userStatus });
                } else {
                    res.status(409).json({ message: 'User already loggedin', success: false });
                }
            } else {
                res.status(403).json({ message: 'User Not Verified', success: false });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

const userStatus = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await User.findOne({ _id: id });
        if (user) {
            if (user.isActive == true) {
                res.status(201).json({ message: 'user active', success: true });
            }
        }
    } catch (error) {
        console.error(isErrored);
    }
};

const uploadImage = async (req, res) => {
    try {
        const { id } = req.body;
        const imgName = req.file.originalname;
        const user = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    image: `http://localhost:5000/${imgName}`,
                },
            },
            { new: true },
        );
        if (user) {
            const profilePicture = user.image;
            res.status(201).json({ profilePicture });
        }
    } catch (err) {
        console.error(err);
    }
};

const logout = async (req, res) => {
    try {
        const userId = req.body._id;
        const authData = await User.findOneAndUpdate(
            { _id: userId },
            { $set: { isActive: false } }, // Set isActive to true
            { new: true }, // To return the updated document
        );
        res.status(200).json({ message: 'Successfully Logout', success: true });
    } catch (error) {
        console.error(error);
    }
};
const userData = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findOne({ _id: id });
        if (userData) {
            res.status(201).json({ userData });
        }
    } catch (err) {
        console.error(err);
    }
};
const getUsers = async (req, res) => {
    try {
        const id = req.query.id;
        const users = await User.find({ _id: { $ne: id }, isVerified: { $ne: false } });
        res.status(201).json({ users });
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    generateOTP,
    verifyOTP,
    userRegister,
    userVerified,
    userStatus,
    logout,
    uploadImage,
    userData,
    getUsers,
};
