const router = require('express').Router();
const { signUp, verificationEmail, sendEmailOtp, signIn, verificationForgotPassword, forgotPassword, signInGoogle } = require('../Controllers');
const { authSignInValidation, authSignUpValidation } = require('../Middleware/validation/auth');

router.post('/sign-up', [authSignUpValidation], signUp);
router.post('/verification', verificationEmail);
router.post('/send-otp', sendEmailOtp);
router.post('/sign-in', [authSignInValidation], signIn);
router.post('/sign-in/google', signInGoogle);
router.post('/verification-forgot-password', verificationForgotPassword);
router.post('/forgot-password', forgotPassword);

module.exports = router;