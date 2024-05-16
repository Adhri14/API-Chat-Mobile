const { Schema, model } = require('mongoose');

const OtpSchema = new Schema({
    otp: {
        type: String,
        required: true,
        max: 6
    },
    userId: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    expiredAt: {
        type: Date,
    }
}, { timestamps: true });

const otpModel = model('OtpLog', OtpSchema);
module.exports = otpModel;