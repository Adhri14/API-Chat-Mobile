const userModel = require("../Models/user");
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const rootDir = path.resolve(__dirname, '../../');

module.exports = {
    getProfile: async (req, res, next) => {
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
            const { fullName, username, bio } = req.body;
            const { _id } = req.user;

            let updateUser;
            const user = await userModel.findOne({ _id });

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found!'
                });
            }

            if (req.file) {
                const temp_path = req.file.path;
                const originalExt = req.file.originalname.split(".")[
                    req.file.originalname.split(".").length - 1
                ];
                let filename = req.file.filename + "." + originalExt;

                let target_path;
                if (!fs.existsSync(`${rootDir}/public/uploads`)) {
                    fs.mkdirSync(`${rootDir}/public/uploads`, { recursive: true });
                    target_path = path.resolve(rootDir, `public/uploads/${filename}`);
                } else {
                    target_path = path.resolve(rootDir, `public/uploads/${filename}`);
                }

                const src = fs.createReadStream(temp_path);
                const dest = fs.createWriteStream(target_path);

                src.pipe(dest);
                src.on('end', async () => {
                    const current_image = `${rootDir}public/uploads/${user.image}`;

                    if (fs.existsSync(current_image)) {
                        fs.unlinkSync(current_image);
                    }

                    updateUser = await userModel.findOneAndUpdate({ _id: user._id }, { image: filename, fullName, username, bio });

                    req.user = updateUser;
                    return res.status(200).json({
                        status: 200,
                        message: 'Update profile successfully!',
                        data: updateUser
                    });
                });
                src.on('error', () => {
                    next();
                });
                return;
            }

            updateUser = await userModel.findOneAndUpdate({ _id: user._id }, { fullName, username, bio });

            delete updateUser._doc.password;
            req.user = updateUser;

            return res.status(200).json({
                status: 200,
                message: 'Update profile successfully!',
                data: updateUser
            })

        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!'
            });
        }
    },
    changePassword: async (req, res) => {
        try {
            const { _id } = req.user;
            const { oldPassword, newPassword, confirmPassword } = req.body;

            const user = await userModel.findOne({ _id });

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found!'
                });
            }

            if (!bcrypt.compareSync(oldPassword, user.password)) {
                return res.status(400).json({
                    status: 400,
                    message: "Current Password doesn't match!"
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    status: 400,
                    message: "New Password doesn't match!"
                });
            }

            await user.updateOne({ password: bcrypt.hashSync(newPassword, 10) });
            return res.status(200).json({
                status: 200,
                message: 'Update password has been successfully!'
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error',
            });
        }
    }
}