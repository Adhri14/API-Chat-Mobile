const router = require('express').Router();

router.get('/', (req, res) => {
    console.log('masuk route /');
    return res.status(200).json({
        message: 'API Mobile Chat App',
    });
});

module.exports = router;