const router = require('express').Router();
const { signUp, verificationEmail, sendEmailOtp, signIn, verificationForgotPassword, forgotPassword } = require('../Controllers');

router.post('/sign-up', signUp);
router.post('/verification', verificationEmail);
router.post('/send-otp', sendEmailOtp);
router.post('/sign-in', signIn);
router.post('/verification-forgot-password', verificationForgotPassword);
router.post('/forgot-password', forgotPassword);

module.exports = router;