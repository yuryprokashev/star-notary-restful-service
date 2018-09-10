module.exports = class SignatureValidationStatus {
    constructor(validationWindow, registerName, signatureStatus) {
        this[registerName] = true;
        this.status = {
            address: validationWindow.address,
            requestTimestamp: validationWindow.requestTimestamp,
            message: validationWindow.message,
            validationWindow: validationWindow.validationWindow,
            messageSignature: signatureStatus
        }
    }
};