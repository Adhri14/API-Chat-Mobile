const userModel = require("../Models/user");
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { Schema, Types } = require("mongoose");
const sendNotification = require("../Utils/sendNotification");

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

            console.log(req.file);

            if (req.file) {
                const temp_path = req.file.path;
                const originalExt = req.file.originalname.split(".")[
                    req.file.originalname.split(".").length - 1
                ];
                let filename = req.file.filename + "." + originalExt;

                let target_path;

                if (process.env.ENV === 'production') {
                    console.log('masuk kondisi production');
                    // target_path = path.resolve(rootDir, `tmp/uploads/${filename}`)
                    target_path = path.resolve(rootDir, `public/uploads/${filename}`)
                } else {
                    target_path = path.resolve(rootDir, `public/uploads/${filename}`)
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
            console.log(error);
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
    },
    getListUsers: async (req, res) => {
        try {
            const { search = '' } = req.query;
            const { _id } = req.user;
            let users = [];
            if (search !== '') {
                users = await userModel.find({
                    "$or": [
                        { fullName: { "$regex": search, $options: "i" } },
                        { username: { "$regex": search, $options: "i" } }
                    ],
                    emailVerifiedAt: { "$type": 'date', "$ne": null }, _id: { "$ne": new Types.ObjectId(_id) }
                });
            }
            users = await userModel.find({
                emailVerifiedAt: { "$type": 'date', "$ne": null }, _id: { "$ne": new Types.ObjectId(_id) }
            });
            return res.status(200).json({
                status: 200,
                message: 'Get users successfully',
                data: users,
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error',
            });
        }
    },
    getProfileById: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await userModel.findOne({ _id: userId });

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found',
                });
            }

            delete user._doc.password;
            delete user._doc.device_token;
            return res.status(200).json({
                status: 200,
                message: 'Get user by id successfully',
                data: user,
            })
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error',
            });
        }
    },
    followProfile: async (req, res) => {
        try {
            const { _id } = req.user;
            const { userId } = req.params;
            const userFollow = await userModel.findOne({ _id });
            const userFollowing = await userModel.findOne({ _id: userId });

            console.log(_id, userId);

            if (!userFollowing.followers.length && !userFollow.following.length) {
                console.log('masuk sini');
                await userFollow.updateOne({ following: [...userFollow.following, userFollowing._id] });
                await userFollowing.updateOne({ followers: [...userFollow.followers, userFollow._id] });

                const payload = {
                    title: 'Econify Notification',
                    body: `${userFollow.fullName} mengikuti anda`,
                    data: {},
                };
                sendNotification(userFollowing.deviceToken, payload);
                return res.status(200).json({
                    status: 200,
                    message: 'User is following',
                });
            }

            const following = userFollow._doc.following.filter(item => item.valueOf() !== userId.toString());
            const followers = userFollowing._doc.followers.filter(item => item.valueOf() !== _id.valueOf());
            await userFollow.updateOne({ following });
            await userFollowing.updateOne({ followers });

            const payload = {
                title: 'Econify Notification',
                body: `${userFollow.fullName} berhenti mengikuti anda`,
                data: {},
            };
            sendNotification(userFollowing.deviceToken, payload);

            return res.status(200).json({
                status: 200,
                message: 'User is following',
                // data: {
                //     following,
                //     followers,
                // }
            });

        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error',
            });
        }
    }
}