const accessTokenModel = require("../Models/accessToken");
const responseError = require("./responseError")

module.exports = {
    saveAccessToken: async (req) => {
        try {
            await accessTokenModel.create(req);
        } catch (error) {
            const response = {
                status: 500,
                message: error.message
            }
            return response;
        }
    },
    getUserIDFromAccessToken: async (req, res) => {
        const response = { status: 500, message: '', data: null };
        try {
            const accessToken = accessTokenModel.findOne({ accessToken: req.accessToken });
            if (!accessToken) {
                response.status = 403;
                response.message = 'Access Denied!';
                return response;
            }

            return {
                ...response,
                status: 200,
                message: 'Get access token has been successfully!',
                data: accessToken
            }
        } catch (error) {
            response.message = error.message || 'Internal server error!';
            return response;
        }
    }
}