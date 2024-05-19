const admin = require('./adminFirebase');

const sendNotification = async (deviceToken, data) => {
    try {
        const payload = {
            notification: {
                title: data.title,
                body: data.body,
                data: {
                    ...data.data,
                }
            }
        }

        const response = await admin.messaging().sendToDevice(deviceToken, payload);
        console.log('Successfully sent message:', response);
    } catch (error) {
        throw error;
    }
}

module.exports = sendNotification;