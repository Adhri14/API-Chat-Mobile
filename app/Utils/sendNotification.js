const axios = require('axios').default;
require('dotenv/config');
const sendNotification = (deviceToken, notificationData = {}) => {
    const payload = {
        to: deviceToken,
        notification: {
            title: notificationData.title,
            body: notificationData.body,
            mutable_content: true,
            sound: 'default',
        },
        data: notificationData.data,
    }

    console.log(payload);

    console.log('============= Send notification ===============')
    // const data = await fetch('https://fcm.googleapis.com/fcm/send', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `key=${process.env.FIREBASE_KEY}`,
    //     },
    //     body: payload
    // });
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