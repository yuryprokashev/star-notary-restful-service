const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const SignatureValidationStatus = require('../controllers/SignatureValidationStatus');
const timeStamp = require('../utils/timeStamp');

module.exports = class SignatureService {
    constructor(validationWindowService) {
        this.validationWindowService = validationWindowService;
        this.validSignatures = new Map();
    }

    async validateSignature(address, signature) {
        let validationWindow = this.validationWindowService.getValidationWindow(address);
        if(validationWindow !== undefined) {
            let _this = this;
            let isSignatureValid = false;
            let message = validationWindow.message;
            try {
                isSignatureValid = bitcoinMessage.verify(message, address, signature);
            } catch (err) {
                throw new Error(`Signature validation error: ${err.message}`);
            }
            let status = isSignatureValid ? "valid" : "invalid";
            if(status) this.validSignatures.set(address, signature);
            setTimeout(() => {
                _this.revokeSignature();
            }, validationWindow.validationWindow * 1000);
            return new SignatureValidationStatus(validationWindow, "registerStar", status);
        } else {
            throw new Error(`Validation window for ${address} has expired`);
        }
    }

    isSignatureValid(address) {
        return this.validSignatures.has(address);
    }

    revokeSignature(address) {
        if(this.validSignatures.has(address)) this.validSignatures.delete(address);
    }
};