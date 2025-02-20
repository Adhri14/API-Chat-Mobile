const mediaModel = require("../Models/media");
const uploadFile = require("../Utils/uploadFileCloudinary");

module.exports = {
    uploadMedia: async (req, res) => {
        try {
            // const { _id } = req.user;
            if (req.file) {
                const temp_path = req.file.path;
                const result = await uploadFile(temp_path);
                const resultUpload = {
                    userId: null,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    resource_type: result.resource_type,
                    created_at: new Date(result.created_at),
                    bytes: result.bytes,
                    type: result.type,
                    url: result.secure_url,
                };

                const media = new mediaModel(resultUpload);
                await media.save();

                return res.status(200).json({
                    status: 200,
                    message: 'Upload successfully!',
                    data: resultUpload,
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal Server Error!',
            });
        }
    }
}