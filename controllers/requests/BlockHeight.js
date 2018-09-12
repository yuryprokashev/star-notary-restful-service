const InvalidInputError = require('../InvalidInputError');
const ONLY_NUMBERS = /^[0-9]*$/;

module.exports = class BlockHeight {
    constructor(blockHeight) {
        this.height = blockHeight;
    }
    get() {
        return this.height;
    }
    isValid() {
        if(!ONLY_NUMBERS.test(this.height)) throw InvalidInputError("Block Height must be a number");
    }
};