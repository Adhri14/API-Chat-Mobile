const userModel = require("../Models/User");
const path = require('path');
const fs = require('fs');

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

            if (req.file) {
                const temp_path = req.file.path;
                const originalExt = req.file.originalname.split(".")[
                    req.file.originalname.split(".").length - 1
                ];
                let filename = req.file.filename + "." + originalExt;
                const target_path = path.resolve(rootDir, `public/uploads/${filename}`);

                const src = fs.createReadStream(temp_path);
                const dest = fs.createWriteStream(target_path);

                src.pipe(dest);
                src.on('end', async () => {
                    const current_image = `${rootDir}public/uploads/${user.image}`;

                    if (fs.existsSync(current_image)) {
                        fs.unlinkSync(current_image);
                    }

                    updateUser = await userModel.findOneAndUpdate({ _id: user._id }, { image: filename, fullName, username });

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

            updateUser = await userModel.findOneAndUpdate({ _id: user._id }, { fullName, username });

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
    }
}