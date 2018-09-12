const WALLET_ADDRESS_LENGTH = 34;
const ADDRESS_REGEX = /address:/;
const InvalidInputError = require('../InvalidInputError');

module.exports = class WalletAddress {
    constructor(address) {
        this.address = address;
    }
    static from(query) {
        if(ADDRESS_REGEX.test(query)) {
            let address = query.slice(8);
            return new WalletAddress(address);
        } else {
            throw new InvalidInputError(`query prefix is ${query.slice(0, 5)}. ${ADDRESS_REGEX.toString()} is expected`);
        }
    }
    get() {
        return this.address;
    }
    isValid() {
        if(this.address === undefined || this.address === "") throw new InvalidInputError("Wallet address is undefined");
        if(this.address.length === WALLET_ADDRESS_LENGTH) return true;
        throw new InvalidInputError(`Wallet address length is ${this.address.length}. Length ${WALLET_ADDRESS_LENGTH} is expected.`)
    }
};