const RestApiError = require('../controllers/responses/RestApiError');
const InvalidInputError = require('../controllers/InvalidInputError');
const BusinessLogicError = require('./BusinessLogicError');
const StatusCodes = require('./StatusCodes');

module.exports = class RestApiErrorFactory {
    constructor(){
        this.errorTypeToStatusCodeMap = new Map();
    }
    create(error) {
        let statusCode = this._resolveErrorTypeToStatusCode(error);
        return new RestApiError(statusCode, error.userMessages);
    }
    _resolveErrorTypeToStatusCode(error){
        if(error instanceof InvalidInputError) {
            return StatusCodes.BAD_REQUEST;
        } else if(error instanceof BusinessLogicError) {
            return StatusCodes.UNPROCESSABLE_ENTITY;
        } else {
            return StatusCodes.INTERNAL_SERVER_ERROR;
        }
    }
};