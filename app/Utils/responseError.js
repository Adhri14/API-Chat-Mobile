const responseError = (response) => {
    const { res, status, message } = response;
    return res.status(status).json({
        status,
        message,
    });
}

module.exports = responseError;