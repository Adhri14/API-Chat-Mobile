const AWS = require('aws-sdk');
require('dotenv/config');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Pastikan kunci akses disimpan di variabel lingkungan
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Pastikan kunci rahasia disimpan di variabel lingkungan
    region: process.env.AWS_REGION, // Ubah ini sesuai dengan region AWS Anda,
    signatureVersion: 'v4'
});

const s3 = new AWS.S3();

const uploadFileS3 = (key, type) => {
    const post = s3.createPresignedPost({
        Bucket: process.env.AWS_BUCKET_NAME,
        Fields: {
            key: `${Date.now()}-${key}`
        },
        Expires: 60,
        Conditions: [
            ['content-length-range', 0, 2097152], // up to 1 MB
        ],
    });

    return post;
}

module.exports = uploadFileS3;