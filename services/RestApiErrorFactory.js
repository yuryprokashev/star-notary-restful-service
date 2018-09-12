const RestApiError = require('../controllers/responses/RestApiError');
const InvalidInputError = require('../controllers/InvalidInputError');
const BusinessLogicError = require('./BusinessLogicError');

module.exports = class RestApiErrorFactory {
    constructor(){
        this.errorTypeToStatusCodeMap = new Map();
    }
    create(error) {
        let statusCode = this.resolveErrorTypeToStatusCode(error);
        return new RestApiError(statusCode, error.userMessages);
    }
    resolveErrorTypeToStatusCode(error){
        if(error instanceof InvalidInputError) {
            return 400;
        } else if(error instanceof BusinessLogicError) {
            return 422;
        } else {
            return 500;
        }
    }
};