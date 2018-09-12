const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const SignatureValidationStatus = require('../controllers/responses/SignatureValidationStatus');
const Signature = require('../controllers/requests/Signature');
const timeStamp = require('../utils/timeStamp');
const BusinessLogicError = require('./BusinessLogicError');
const InvalidInputError = require('../controllers/InvalidInputError');

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
                throw new InvalidInputError(`Signature validation error: ${err.message}`);
            }
            let status = isSignatureValid ? "valid" : "invalid";
            if(status === "valid") this.validSignatures.set(address, signature);
            setTimeout(() => {
                _this.revokeSignature();
            }, validationWindow.validationWindow * 1000);
            return new SignatureValidationStatus(validationWindow, "registerStar", status);
        } else {
            throw new BusinessLogicError(`Validation window for ${address} does not exist. Open new validation window.`);
        }
    }

    isSignatureValid(address) {
        return this.validSignatures.has(address);
    }

    revokeSignature(address) {
        if(this.validSignatures.has(address)) this.validSignatures.delete(address);
    }
};