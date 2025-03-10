const userModel = require("../Models/user");
const generateOtp = require("../Utils/generateOtp");
const otpModel = require("../Models/otp");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendNotification = require("../Utils/sendNotification");
const sendEmailOTP = require("../Utils/sendEmailOTP");
const { validationResult } = require("express-validator");
const formateValidationError = require("../Utils/formatValidationErrors");

const response = { status: 200, message: '' };
const baseTime = new Date();
const expiredAt = baseTime.getTime() + 2 * 60 * 1000;

module.exports = {
    signUp: async (req, res) => {
        try {
            const { fullName, username, email, password, deviceToken } = req.body;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({
                    status: 422,
                    message: 'Validation Error',
                    errors: formateValidationError(errors.array()),
                });
            }

            // if (!fullName || !username || !email || !password || !deviceToken) {
            //     console.log('masuk sini kah?');
            //     return res.status(400).json({
            //         status: 400,
            //         message: 'Bad request'
            //     });
            // }

            const checkUserExist = await userModel.findOne({ email });

            if (checkUserExist) {
                return res.status(403).json({
                    status: 403,
                    message: 'User already exist, please log in!'
                });
            }

            const newPassword = bcrypt.hashSync(password, 10);

            const user = new userModel({ fullName, username, email, password: newPassword, deviceToken, typeLogin: 'email-and-password' });
            await user.save();

            const otp = generateOtp(6);
            const otpResult = await otpModel.create({ otp, expiredAt, email: user.email, userId: user._id });

            const bodyEmail = {
                otp: otpResult
            }
            sendEmailOTP(user.email, "Verification Email", "otp", bodyEmail);

            // const payload = {
            //     title: 'Econify Notification',
            //     body: `Kode verifikasi Econify anda adalah: ${otpResult.otp}`,
            //     data: {},
            // };
            // sendNotification(user.deviceToken, payload);

            response.status = 201;
            response.message = 'Sign up has been successfully!. Please Login';
            return res.status(201).json({
                status: 201,
                message: 'Sign up has been successfully!. Please Login',
                data: otpResult.otp,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error'
            });
        }
    },
    verificationEmail: async (req, res) => {
        try {
            const { otp, email } = req.body;

            const findAuth = await otpModel.findOne({ otp, email });
            console.log('cek : ', findAuth);
            console.log('cek body : ', req.body);

            if (!findAuth) {
                // responseError({ res, status: 403, message: 'Access denied!' });
                return res.status(403).json({
                    status: 403,
                    message: 'Access denied, OTP not found!',
                });
            }

            const user = await userModel.findOne({ email });

            if (findAuth.userId !== user._id.valueOf()) {
                return res.status(403).json({
                    status: 403,
                    message: 'Access denied, user not found!',
                });
            }

            if (findAuth.expiredAt < baseTime) {
                return res.status(403).json({
                    status: 403,
                    message: 'OTP expired!',
                });
            }

            await user.updateOne({ emailVerifiedAt: baseTime });
            // await userModel.findOneAndUpdate({ _id: user._id }, { emailVerifiedAt: baseTime });

            return res.status(200).json({
                status: 200,
                message: 'Verification has been successfully!',
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!',
            });
        }
    },
    sendEmailOtp: async (req, res) => {
        try {
            const { email } = req.body;

            const user = await userModel.findOne({ email });

            if (!user) {
                return res.status(403).json({
                    status: 403,
                    message: 'Access denied!',
                });
            }

            const otp = generateOtp(6);
            const otpResult = await otpModel.create({ otp, expiredAt, email: user.email, userId: user._id });

            const bodyEmail = {
                otp: otpResult
            }
            sendEmailOTP(user.email, "Verification Email", "otp", bodyEmail);

            // const payload = {
            //     title: 'Econify Notification',
            //     body: `Kode verifikasi Econify anda adalah: ${otpResult.otp}`,
            //     data: {},
            // };
            // sendNotification(user.deviceToken, payload);

            response.status = 201;
            response.message = 'OTP has been send in email!';
            return res.status(201).json({
                status: 201,
                message: 'OTP has been send in email!',
                data: otpResult.otp
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error'
            });
        }
    },
    signIn: async (req, res) => {
        try {
            const { email, password, deviceToken } = req.body;

            const errors = validationResult(req);

            const user = await userModel.findOne({ $or: [{ email }, { username: email }] });
            console.log('cek : ', user);
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found!',
                });
            }

            if (!user.emailVerifiedAt) {
                return res.status(403).json({
                    status: 403,
                    message: 'User is not verified, please for verification again!',
                });
            }

            if (!bcrypt.compareSync(password, user.password)) {
                return res.status(400).json({
                    status: 400,
                    message: 'Sorry password is wrong, please try again!',
                });
            }

            if (user && user.typeLogin !== 'email-and-password') {
                return res.status(400).json({
                    status: 400,
                    message: 'Sorry this user is log in to social auth!',
                });
            }

            await user.updateOne({ deviceToken });

            const token = jwt.sign({
                user_id: user._id,
                email: user.email,
            }, process.env.APP_JWT, { expiresIn: '1d' });

            req.token = token;

            return res.status(200).json({
                status: 200,
                message: 'Sign in is successfully!',
                data: token
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error'
            });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email, password, confirmPassword, otp } = req.body;

            const findAuth = await otpModel.findOne({ otp, email });
            const user = await userModel.findOne({ email });

            if (!findAuth) {
                // responseError({ res, status: 403, message: 'Access denied!' });
                return res.status(403).json({
                    status: 403,
                    message: 'Access denied',
                });
            }

            if (findAuth.userId !== user._id.valueOf()) {
                return res.status(403).json({
                    status: 403,
                    message: 'Access denied',
                });
            }

            if (findAuth.expiredAt < baseTime) {
                return res.status(403).json({
                    status: 403,
                    message: 'OTP expired!',
                });
            }

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found!',
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    status: 404,
                    message: "Password doesn't match",
                });
            }

            await user.updateOne({ password: bcrypt.hashSync(password, 10) });

            return res.status(200).json({
                status: 200,
                message: 'Forgot password has been successfully!',
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error'
            });
        }
    },
    verificationForgotPassword: async (req, res) => {
        try {
            const { otp, email } = req.body;

            const findAuth = await otpModel.findOne({ otp, email });

            if (!findAuth) {
                // responseError({ res, status: 403, message: 'Access denied!' });
                return res.status(403).json({
                    status: 403,
                    message: 'Access denied',
                });
            }

            const user = await userModel.findOne({ email });

            if (findAuth.userId !== user._id.valueOf()) {
                return res.status(403).json({
                    status: 403,
                    message: 'Access denied',
                });
            }

            if (findAuth.expiredAt < baseTime) {
                return res.status(403).json({
                    status: 403,
                    message: 'OTP expired!',
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Verification has been successfully!',
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!',
            });
        }
    },
    signInGoogle: async (req, res) => {
        try {
            const { email, fullName, deviceToken, accessToken, typeLogin } = req.body;

            if (!fullName || !email || !deviceToken || !accessToken) {
                return res.status(400).json({
                    status: 400,
                    message: 'Bad request'
                });
            }

            const user = await userModel.findOne({ email, typeLogin: 'google-signin' });
            if (!user) {
                console.log('masuk sini nggk?');
                const newUser = new userModel({ fullName, email, deviceToken, typeLogin: 'google-signin', accessToken, emailVerifiedAt: new Date() });
                await newUser.save();
                const token = jwt.sign({
                    user_id: newUser._id,
                    email: newUser.email,
                }, process.env.APP_JWT, { expiresIn: '1d' });

                req.token = token;
                return res.status(200).json({
                    status: 200,
                    message: 'Sign in is successfully!',
                    data: token
                });
            }

            if (user && user.typeLogin !== 'google-signin') {
                return res.status(400).json({
                    status: 400,
                    message: 'Sorry this user is log in to email and password!',
                });
            }

            await user.updateOne({ deviceToken, accessToken });

            const token = jwt.sign({
                user_id: user._id,
                email: user.email,
            }, process.env.APP_JWT, { expiresIn: '1d' });

            req.token = token;

            return res.status(200).json({
                status: 200,
                message: 'Sign in is successfully!',
                data: token
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error'
            });
        }
    }
}