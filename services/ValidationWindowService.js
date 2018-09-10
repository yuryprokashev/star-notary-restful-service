const timeStamp = require('../utils/timeStamp');
const ValidationWindow = require('../controllers/ValidationWindow');

module.exports = class ValidationWindowService {
    constructor(validationWindowSize) {
        this.windows = new Map();
        this.validationWindowSize = validationWindowSize || 60;
    }
    //TODO handle the case, when window for key already exists.
    createValidationWindow(key) {
        let _this = this;
        let walletAddress = key;
        let requestTimestamp = timeStamp();
        let message = `${walletAddress}:${requestTimestamp}:starRegistry`;
        let validationWindow = new ValidationWindow(walletAddress, requestTimestamp, message, this.validationWindowSize);
        this.windows.set(walletAddress, validationWindow);
        setTimeout(() => {
            _this.closeWindow(walletAddress);
        }, this.validationWindowSize * 1000);
        return validationWindow;
    }

    isWindowValid(key) {
        return this.windows.has(key);
    }

    getValidationWindow(key) {
        let window = this.windows.get(key);
        if(window !== undefined) window.validationWindow = this.validationWindowSize - (timeStamp() - window.requestTimestamp);
        return window;
    }
    closeWindow(key) {
        if(this.windows.has(key)) this.windows.delete(key);
    }
};