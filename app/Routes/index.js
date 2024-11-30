const authRouter = require('./auth');
const userRouter = require('./user');
const chatRouter = require('./chat');
const deviceInfoRouter = require('./deviceinfo');
const mediaRouter = require('./media');

module.exports = {
    authRouter,
    userRouter,
    chatRouter,
    deviceInfoRouter,
    mediaRouter
}