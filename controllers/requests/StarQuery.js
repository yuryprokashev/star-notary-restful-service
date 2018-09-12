const InvalidInputError = require('../InvalidInputError');
const BlockHash = require('./BlockHash');
const WalletAddress = require('./WalletAddress');

module.exports = class StarQuery {
    constructor(query) {
        this.query = query;
    }
    resolveToAddress() {
        return WalletAddress.from(this.query).get();
    }

    resolveToHash(query) {
        return BlockHash.from(this.query).get();
    }
    resolveQueryType(){
        if(this.query === undefined || this.query === "") throw new InvalidInputError("Query is empty");
        let errors = [false, false];
        let invalidInputError = new InvalidInputError();
        try {
            this.isValidHash();
        } catch (e) {
            errors[0] = true;
        }
        try {
            this.isValidAddress();
        } catch (e) {
            errors[1] = true;
        }
        if(errors[0] === false && errors[1] === true) return "hash";
        if(errors[1] === false && errors[0] === true) return "address";

        invalidInputError.addUserMessage(`Unable to resolve Query type of '${this.query}'.`);

        throw invalidInputError;
    }
    isValidHash() {
        let hash = BlockHash.from(this.query);
        return hash.isValid();
    }

    isValidAddress() {
        let address = WalletAddress.from(this.query);
        return address.isValid();
    }
};