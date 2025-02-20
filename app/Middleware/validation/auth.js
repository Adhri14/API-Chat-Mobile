const { body } = require('express-validator');

const authSignInValidation = [
    body('email')
        .isEmail()
        .withMessage('Email tidak valid')
        .isEmpty()
        .withMessage('Email wajib diisi')
        .escape()
        .trim(),
    body('password')
        .isEmpty()
        .withMessage('Password wajib diisi')
];

const authSignUpValidation = [
    body('fullName')
        .isLength({ min: 3 }).withMessage('Nama minimal 3 karakter')
        // .isEmpty().withMessage('Nama wajib diisi')
        .escape(),
    body('username')
        .isLength({ min: 3 }).withMessage('Username minimal 3 karakter')
        // .isEmpty().withMessage('Username wajib diisi')
        .escape(),
    body('email')
        .isEmail().withMessage('Email tidak valid')
        // .isEmpty().withMessage('Email wajib diisi')
        .escape()
        .trim(),
    body('password')
        .isStrongPassword({ minLength: 8, minLowercase: 2, minNumbers: 2, minSymbols: 1, minUppercase: 1 }).withMessage('Password minimal 8 karakter, huruf kecil, huruf besar dan simbol')
    // .isEmpty().withMessage('Password wajib diisi')
];

module.exports = {
    authSignInValidation,
    authSignUpValidation
}