const { Schema, model } = require('mongoose');

const DeviceInfoSchema = new Schema({
    deviceId: {
        type: String,
        required: true,
    },
    device: {
        type: String,
        required: true,
    },
    deviceName: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    firstInstallTime: {
        type: String,
        required: true
    },
    systemName: {
        type: String,
        required: true
    },
    systemVersion: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true,
    },
    headers: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const deviceInfoModel = model('DeviceInfo', DeviceInfoSchema);
module.exports = deviceInfoModel;