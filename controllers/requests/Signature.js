const InvalidInputError = require('../InvalidInputError');
const SIGNATURE_LENGTH = 88;
module.exports = class Signature {
    constructor(signature) {
        this.signature = signature;
    }
    get() {
        return this.signature;
    }
    isValid() {
        if(this.signature === undefined || this.signature === "") throw new InvalidInputError("Signature is undefined");
        if(this.signature.length !== SIGNATURE_LENGTH) throw new InvalidInputError(`Signature has ${this.signature.length}. ${SIGNATURE_LENGTH} is expected.`);
        return true;
    }
};