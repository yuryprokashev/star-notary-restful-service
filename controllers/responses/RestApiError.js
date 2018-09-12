module.exports = class RestApiError {
    constructor(statusCode,
                userMessages){
        this.statusCode = statusCode;
        this.userMessages = userMessages || [];
    }
    getStatusCode(){
        return this.statusCode;
    }
    getUserMessages() {
        return this.userMessages;
    }
};