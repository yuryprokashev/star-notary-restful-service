const InvalidInputError = require('../InvalidInputError');

module.exports = class PostStarRequest {
    constructor(address, star) {
        this.address = address;
        this.star = star;
    }
    isValid() {
        let error = new InvalidInputError();
        try {
            this.address.isValid();
        } catch (e) {
            e.userMessages.forEach(message => {
                error.addUserMessage(message);
            });
        }
        try {
            this.star.isValid();
        } catch (e) {
            e.userMessages.forEach(message => {
                error.addUserMessage(message);
            });
        }
        if(error.userMessages.length > 0) throw error;
    }

};