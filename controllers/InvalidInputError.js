module.exports = class InvalidInputError extends Error {
    constructor(message){
        super();
        this.userMessages = [];
        if (message) this.userMessages.push(message);
    }
    addUserMessage(message){
        this.userMessages.push(message);
    }
};