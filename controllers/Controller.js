const RestApiErrorFactory = require('../services/RestApiErrorFactory');

module.exports = class Controller {
    constructor() {
        this.restApiErrorFactory = new RestApiErrorFactory();
    }
    onError(error, response) {
        let errorResponse = {errors: ""};
        let restApiError = this.restApiErrorFactory.create(error);
        if(restApiError.statusCode === 500) {
            errorResponse.errors = error.message;
        } else {
            errorResponse.errors = restApiError.getUserMessages();
        }
        return response.status(restApiError.getStatusCode()).json(errorResponse);
    }
};