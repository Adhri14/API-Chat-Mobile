const userModel = require("../Models/user");
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { Schema, Types } = require("mongoose");
const sendNotification = require("../Utils/sendNotification");
const uploadFileS3 = require("../Utils/uploadFile");
const { default: axios } = require("axios");
const uploadFile = require("../Utils/uploadFileCloudinary");

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

            let resultUpload;

            if (req.file) {
                const temp_path = req.file.path;
                const result = await uploadFile(temp_path);
                resultUpload = {
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    resource_type: result.resource_type,
                    created_at: result.created_at,
                    bytes: result.bytes,
                    type: result.type,
                    url: result.secure_url,
                };
                updateUser = await userModel.findOneAndUpdate({ _id: user._id }, { image: JSON.stringify(resultUpload), fullName, username, bio });
                delete updateUser._doc.password;
                req.user = updateUser;

                return res.status(200).json({
                    status: 200,
                    message: 'Update profile successfully!',
                    data: updateUser
                })
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
            const { search = '', offset = 0, limit = 10 } = req.query;
            const { _id } = req.user;

            const page = Math.max(0, offset);
            let users = [];

            if (search !== '') {
                users = await userModel
                    .find({
                        "$or": [
                            { fullName: { "$regex": search, $options: "i" } },
                            { username: { "$regex": search, $options: "i" } }
                        ],
                        emailVerifiedAt: { "$type": 'date', "$ne": null }, _id: { "$ne": new Types.ObjectId(_id) }
                    })
                    .sort({ updatedAt: -1 })
                    .skip(page * limit);
            } else {
                users = await userModel
                    .find({
                        emailVerifiedAt: { "$type": 'date', "$ne": null }, _id: { "$ne": new Types.ObjectId(_id) }
                    })
                    .sort({ updatedAt: -1 })
                    .skip(page * limit);
            }

            const users2 = await userModel
                .find({
                    emailVerifiedAt: { "$type": 'date', "$ne": null }, _id: { "$ne": new Types.ObjectId(_id) }
                });

            return res.status(200).json({
                status: 200,
                message: 'Get users successfully',
                data: users,
                pagination: {
                    total: users2.length,
                    totalPages: Math.ceil(users2.length / limit),
                }
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
            const { _id: userId } = req.user;
            const { userId: targetUserId } = req.params;
            // Menambahkan targetUserId ke dalam daftar following dari userId
            await userModel.findByIdAndUpdate(userId, {
                $addToSet: { following: targetUserId }
            });

            // Menambahkan userId ke dalam daftar followers dari targetUserId
            await userModel.findByIdAndUpdate(targetUserId, {
                $addToSet: { followers: userId }
            });

            return res.status(200).json({ status: 200, message: 'User is Following' });

        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error',
            });
        }
    },
    unfollowProfile: async (req, res) => {
        try {
            const { _id: userId } = req.user; // ID pengguna yang melakukan unfollow
            const { userId: targetUserId } = req.params; // ID pengguna yang akan diunfollow

            // Menghapus targetUserId dari daftar following dari userId
            await userModel.findByIdAndUpdate(userId, {
                $pull: { following: targetUserId }
            });

            // Menghapus userId dari daftar followers dari targetUserId
            await userModel.findByIdAndUpdate(targetUserId, {
                $pull: { followers: userId }
            });

            res.status(200).json({ message: 'Berhenti mengikuti pengguna' });
        } catch (error) {
            res.status(500).json({ error: 'Gagal berhenti mengikuti pengguna' });
        }
    }
}