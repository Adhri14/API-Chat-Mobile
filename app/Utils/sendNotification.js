const axios = require('axios').default;
require('dotenv/config');
const sendNotification = (deviceToken, notificationData = {}) => {
    const payload = {
        "to": deviceToken,
        "notification": {
            "title": notificationData.title,
            "body": notificationData.body,
            "mutable_content": true,
            "sound": 'default',
            "imageURL": 'https://8a0c-182-0-102-253.ngrok-free.app/logo.png'
        },
        "data": notificationData.data,
        "priority": "high",
    }
    axios.post('https://fcm.googleapis.com/fcm/send', payload, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${process.env.FIREBASE_KEY}`
        }
    }).then(res => {
        console.log('Notification has been successfully!', res.data);
    }).catch(err => {
        console.log(err.response);
    })
}

module.exports = sendNotification;