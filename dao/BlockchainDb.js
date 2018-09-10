/**
 * Created by py on 01/09/2018.
 */

const level = require('level');

module.exports = class BlockchainDb {
    constructor(dbDir) {
        this.db = level(dbDir);
    }
    saveBlock(block) {
        let _this = this;
        let key = block.height;
        return new Promise(function(resolve, reject) {
            _this.db.put(key, JSON.stringify(block), function(err){
                if(err) {
                    reject(new Error(`Block ${key} submission failed. ${err.message}`));
                }
                resolve(block);
            })
        });
    }
    getBlock(key) {
        let _this = this;
        return new Promise(function(resolve, reject) {
            _this.db.get(key, function(err, value) {
                if(err) {
                    reject(new Error(`Can not get Block at key = ${key}. ${err.message}`));
                } else {
                    resolve(JSON.parse(value));
                }
            });
        });
    }
    getChainLength() {
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
    isEmpty() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            let length = _this.getChainLength();
            length.then(result => {
                if(result === 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(err => {
                reject(new Error(`Can not determine, if DB is empty. ${err.message}`));
            });
        });
    }
};