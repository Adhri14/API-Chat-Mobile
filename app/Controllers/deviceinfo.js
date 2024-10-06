const deviceInfoModel = require("../Models/deviceInfo");

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
    }
}