const userModel = require("../Models/User");

module.exports = {
    getProfile: async (req, res) => {
        try {
            return res.status(200).json({
                status: 200,
                message: 'Get Profile successfully!',
                data: req.user,
            })
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!'
            });
        }
    },
    updateProfile: async (req, res) => {
        try {
            const { fullName, username } = req.body;
            const { _id } = req.user;

            let updateUser;
            const user = await userModel.findOne({ _id });

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found!'
                });
            }

            updateUser = await userModel.findOneAndUpdate({ _id: user._id }, { fullName, username });

            delete updateUser._doc.password;
            req.user = updateUser;

            return res.status(200).json({
                status: 200,
                message: 'Update profile successfully!',
            })

        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!'
            });
        }
    }
}