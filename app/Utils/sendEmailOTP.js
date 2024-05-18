const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const rootDir = path.resolve(__dirname, '../../');

// Load email template
const loadTemplate = (templateName, variables) => {
    const templatePath = path.join(rootDir, 'public/templates', `${templateName}.ejs`);
    const template = fs.readFileSync(templatePath, 'utf-8');
    return ejs.render(template, variables);
};

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Function to send an email
const sendEmailOTP = async (toEmail, subject, templateName, variables) => {
    const html = loadTemplate(templateName, variables);

    const mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: toEmail,
        subject: subject,
        html: html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Example usage
// const toEmail = 'recipient@example.com';
// const subject = 'Welcome to Our Service';
// const templateName = 'welcome';
// const variables = { name: 'John Doe', otp: '123456' };

// sendEmail(toEmail, subject, templateName, variables);

module.exports = sendEmailOTP;
