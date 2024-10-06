const authRouter = require('./auth');
const userRouter = require('./user');
const chatRouter = require('./chat');
const deviceInfoRouter = require('./deviceinfo');

module.exports = {
    authRouter,
    userRouter,
    chatRouter,
    deviceInfoRouter
}