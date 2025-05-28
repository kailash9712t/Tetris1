class ApiError extends Error{
    constructor(statusCode, location , message){
        super(message);
        this.statusCode = statusCode;
        this.location = location
    }
}

export {ApiError};