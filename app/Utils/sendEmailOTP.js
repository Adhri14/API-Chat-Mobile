const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
require('dotenv').config();

const rootDir = path.resolve(__dirname, '../../');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'eu-north-1',
});

const aws = new AWS.SES();

// Load email template
const loadTemplate = (templateName, variables) => {
    const templatePath = path.join(rootDir, 'public/templates', `${templateName}.ejs`);
    const template = fs.readFileSync(templatePath, 'utf-8');
    return ejs.render(template, variables);
};

// Create reusable transporter object using the default SMTP transport
// const transporter = nodemailer.createTransport({
//     host: process.env.MAIL_HOST,
//     port: process.env.MAIL_PORT,
//     secure: false,
//     auth: {
//         user: process.env.MAIL_USERNAME,
//         pass: process.env.MAIL_PASSWORD
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });

// Function to send an email
// const sendEmailOTP = async (toEmail, subject, templateName, variables) => {
//     const html = loadTemplate(templateName, variables);

//     const mailOptions = {
//         from: process.env.MAIL_FROM_ADDRESS,
//         to: toEmail,
//         subject: subject,
//         html: html,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully');
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// };

const sendEmailOTP = async (toEmail, subject, templateName, variables) => {
    try {
        const html = loadTemplate(templateName, variables);
        // console.log(html);
        const data = await aws.sendEmail({
            Source: 'info@appsku.cloud',
            Destination: {
                ToAddresses: [toEmail],
            },
            Message: {
                Subject: {
                    Data: subject
                },
                Body: {
                    Html: {
                        Data: html
                    }
                }
            }
        }).promise();
        console.log('Send Email : ', data)
    } catch (error) {
        console.log('Error Send Email : ', error);
        throw error;
    }
}

// Example usage
// const toEmail = 'recipient@example.com';
// const subject = 'Welcome to Our Service';
// const templateName = 'welcome';
// const variables = { name: 'John Doe', otp: '123456' };

// sendEmail(toEmail, subject, templateName, variables);

module.exports = sendEmailOTP;
