const formateValidationError = (errors = []) => {
    console.log(errors);
    const formattedErrors = {};

    errors.forEach(error => {
        if (!formattedErrors[error.path]) {
            formattedErrors[error.path] = '';
        }
        formattedErrors[error.path] = error.msg;
    });

    console.log(formattedErrors);

    return formattedErrors;
}

module.exports = formateValidationError;