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
    changePassword
} = require('./user');

module.exports = {
    signUp,
    verificationEmail,
    sendEmailOtp,
    signIn,
    forgotPassword,
    verificationForgotPassword,
    getProfile,
    updateProfile,
    changePassword
}