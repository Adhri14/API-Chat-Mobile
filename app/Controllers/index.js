const { signUp, verificationEmail, sendEmailOtp, signIn, forgotPassword, verificationForgotPassword } = require('./auth');

module.exports = {
    signUp,
    verificationEmail,
    sendEmailOtp,
    signIn,
    forgotPassword,
    verificationForgotPassword
}