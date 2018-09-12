module.exports = class BusinessLogicError extends Error {
    constructor(message) {
        super();
        this.userMessages = [];
        if(message) this.userMessages.push(message);
    }
};