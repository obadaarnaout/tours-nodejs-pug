class appErrors extends Error {
    constructor(errorCode,message){
        super(message);
        this.statusCode = errorCode;
        this.status = `${errorCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this,this.constructor);
    }
}

module.exports = appErrors;