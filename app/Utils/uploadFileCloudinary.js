const Cloudinary = require('cloudinary').v2;
require('dotenv/config');

Cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const uploadFile = async (filePath) => {
    try {
        const result = await Cloudinary.uploader.upload(filePath, {
            folder: 'uploads', // Ganti dengan folder yang diinginkan, jika perlu
            use_filename: true, // Menggunakan nama file asli
            unique_filename: false, // Menjaga nama file unik di folder
            resource_type: "auto",
        });
        return result;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

module.exports = uploadFile;