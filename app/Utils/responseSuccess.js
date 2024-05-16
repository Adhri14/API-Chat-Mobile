const responseSuccess = (response) => {
    const { res, status = 200, message = '', data = null } = response;
    return res.status(status).json({
        status,
        message,
        data
    });
}

module.exports = responseSuccess;