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
} = require('./user');

const {
    listChats,
    sendChat,
    updateStatusRead,
    listMessage
} = require('./chat')

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
}