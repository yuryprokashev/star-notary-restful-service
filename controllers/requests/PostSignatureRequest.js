const InvalidInputError = require('../InvalidInputError');

module.exports = class PostSignatureRequest {
    constructor(address, signature) {
        this.address = address;
        this.signature = signature;
    }
    isValid(){
        let error = new InvalidInputError();
        try {
            this.address.isValid();
        } catch(e) {
            e.userMessages.forEach(message => {
                error.addUserMessage(message);
            });
        }
        try {
            this.signature.isValid();
        } catch (e) {
            e.userMessages.forEach(message => {
                error.addUserMessage(message);
            });
        }
        if(error.userMessages.length > 0) throw error;
    }
};