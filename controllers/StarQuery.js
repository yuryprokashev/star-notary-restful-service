module.exports = class StarQuery {
    constructor(query) {
        this.query = query;
    }
    resolveToAddress(query) {
        if(this.isAddress()) return this.query.toString().slice(8);
        throw new Error(`${this.query} is not valid address`);
    }

    resolveToHash(query) {
        if(this.isHash()) return this.query.toString().slice(5);
        throw new Error(`${this.query} is not valid hash`);
    }
    isHash() {
        return this.query.length === 69;
    }

    isAddress() {
        return this.query.length === 42;
    }

    isValid() {
        return this.isHash() || this.isAddress();
    }
};