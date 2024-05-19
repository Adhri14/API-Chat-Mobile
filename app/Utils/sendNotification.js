require('dotenv').config();
const sendNotification = async (deviceToken, notificationData = {}) => {
    try {
        const payload = {
            to: deviceToken,
            notification: {
                title: data.title,
                body: data.body,
            },
            data: notificationData,
        }

        const data = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${process.env.FIREBASE_KEY}`,
            },
            body: payload
        });
        const response = await data.json();
        console.log('Notification has been successfully!', response);
    } catch (error) {
        throw error;
    }
}

module.exports = sendNotification;