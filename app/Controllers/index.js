const {
    signUp,
    verificationEmail,
    sendEmailOtp,
    signIn,
    forgotPassword,
    verificationForgotPassword
} = require('./auth');

const {
    getProfile,
    updateProfile,
    changePassword,
    getListUsers,
    getProfileById,
    followProfile,
    unfollowProfile,
} = require('./user');

const {
    listChats,
    sendChat,
    updateStatusRead,
    listMessage
} = require('./chat');

const {
    register: registerDevice
} = require("./deviceinfo");

module.exports = {
    signUp,
    verificationEmail,
    sendEmailOtp,
    signIn,
    forgotPassword,
    verificationForgotPassword,
    getProfile,
    updateProfile,
    changePassword,
    listChats,
    sendChat,
    updateStatusRead,
    listMessage,
    getListUsers,
    getProfileById,
    followProfile,
    unfollowProfile,
    registerDevice
}