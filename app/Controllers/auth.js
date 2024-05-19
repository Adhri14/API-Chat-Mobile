const userModel = require("../Models/user");
const generateOtp = require("../Utils/generateOtp");
const otpModel = require("../Models/otp");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendNotification = require("../Utils/sendNotification");

const response = { status: 200, message: '' };
const baseTime = new Date();
const expiredAt = baseTime.getTime() + 60 * 1000;

module.exports = {
    signUp: async (req, res) => {
        try {
            const { fullName, username, email, password, deviceToken } = req.body;

            const user = new userModel({ fullName, username, email, password, deviceToken });
            await user.save();

            const otp = generateOtp(6);
            const otpResult = await otpModel.create({ otp, expiredAt, email: user.email, userId: user._id });

            // const bodyEmail = {
            //     name: user.fullName,
            //     otp: otpResult
            // }
            // await sendEmailOTP(user.email, "Verification Email", "otp", bodyEmail);

            const payload = {
                title: 'Econify Notification',
                body: `Kode verifikasi Econify anda adalah: ${otpResult.otp}`,
                data: {},
            };
            await sendNotification(user.deviceToken, payload);

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

            // const bodyEmail = {
            //     name: user.fullName,
            //     otp: otpResult
            // }
            // await sendEmailOTP(user.email, "Verification Email", "otp", bodyEmail);

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

            const user = await userModel.findOne({ email });
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
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error'
            });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email, password, confirmPassword } = req.body;

            const user = await userModel.findOne({ email });

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
}