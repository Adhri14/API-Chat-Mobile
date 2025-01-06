const deviceInfoModel = require("../Models/deviceInfo");
const generateOtp = require("../Utils/generateOtp");
const sendEmailOTP = require("../Utils/sendEmailOTP");

module.exports = {
    register: async (req, res) => {
        try {
            const getDeviceInfo = await deviceInfoModel.findOne({ deviceId: req.body.deviceId });

            if (!getDeviceInfo) {
                const deviceInfo = new deviceInfoModel({ ...req.body, headers: JSON.stringify(req.headers) });
                await deviceInfo.save();

                return res.status(201).json({
                    status: 201,
                    message: 'Register device has been successfully!',
                });
            }

            await getDeviceInfo.updateOne({ ...req.body, headers: JSON.stringify(req.headers) });

            return res.status(201).json({
                status: 201,
                message: 'Already register device!',
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!',
            });
        }
    },
    testEmail: async (req, res) => {
        try {
            const otp = generateOtp(6);
            sendEmailOTP('adhri.adly@gmail.com', 'Testing Email', 'otp', { otp });
            return res.status(200).json({
                status: 200,
                message: 'Send Email Success!'
            })
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!',
            });
        }
    }
}