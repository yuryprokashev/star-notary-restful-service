const level = require('level');

module.exports = class BlockchainDb {
    constructor(dbDir) {
        this.db = level(dbDir);
    }
    async saveBlock(block) {
        let key = block.height;
        let value = JSON.stringify(block);
        try {
            await this.getDb().put(key, value);
            return block;
        } catch (e) {
            throw e;
        }
    }
    async getBlock(key) {
        try {
            let value = await this.getDb().get(key);
            return JSON.parse(value);
        } catch (e) {
            throw e;
        }
    }
    async getChainLength() {
        let _this = this;
        return new Promise(function(resolve, reject){
            let length = 0;
            _this.db.createReadStream({ keys: true, values: false })
                .on('data', function (data) {
                    length++;
                })
                .on('error', function(err) {
                    reject(`Error in DB Read Stream. ${err.message}`);
                })
                .on('close', function(){
                    resolve(length);
                });
        });
    }
    async isEmpty() {
        try {
            let chainLength = await this.getChainLength();
            return chainLength === 0;
        } catch (e) {
            throw e;
        }
    }
    getDb() {
        return this.db;
    }
};