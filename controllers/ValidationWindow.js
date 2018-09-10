module.exports = class ValidationWindow {
    constructor(address, requestTimestamp, message, windowSize){
        this.address = address;
        this.requestTimestamp = requestTimestamp;
        this.message = message;
        this.validationWindow = windowSize;
    }
};