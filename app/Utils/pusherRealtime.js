const Pusher = require('pusher');
require("dotenv/config");

const pusherRealtime = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET_KEY,
    cluster: process.env.PUSER_CLUSTER,
    useTLS: true
});

module.exports = pusherRealtime;