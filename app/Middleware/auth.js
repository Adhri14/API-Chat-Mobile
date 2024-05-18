const jwt = require('jsonwebtoken');
const userModel = require('../Models/user');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null;

        if (!token) {
            return res.status(401).json({
                status: 401,
                message: 'User is not authorized!',
            });
        }

        const data = jwt.verify(token, process.env.APP_JWT);

        const user = await userModel.findOne({ _id: data.user_id });

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: 'User is not authorized!',
            });
        }

        delete user._doc.password;
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 401,
            message: 'User is not authorized!',
        });
    }
}

module.exports = authMiddleware;