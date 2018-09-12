const BLOCK_HASH_LENGTH = 64;
const HASH_REGEX = /hash:/;
const InvalidInputError = require('../InvalidInputError');

module.exports = class BlockHash {
    constructor(hashValue){
        this.hash = hashValue;
    }
    static from(query) {
        if(HASH_REGEX.test(query)) {
            let hashValue = query.slice(5);
            return new BlockHash(hashValue);
        } else {
            throw new InvalidInputError(`query prefix is ${query.slice(0, 8)}. ${HASH_REGEX.toString()} is expected`);
        }
    }
    get() {
        return this.hash;
    }
    isValid() {
        if(this.hash === undefined || this.hash === "") throw new InvalidInputError("Block Hash is undefined");
        if(this.hash.length === BLOCK_HASH_LENGTH) return true;
        throw new InvalidInputError(`Invalid Block Hash length ${this.hash.length}. ${BLOCK_HASH_LENGTH} is expected.`);
    }
};