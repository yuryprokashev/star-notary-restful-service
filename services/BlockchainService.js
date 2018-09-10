/**
 * Created by py on 01/09/2018.
 */

/* ===== SHA256 with Crypto-js ===============================
 |  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
 |  =========================================================*/
const SHA256 = require('crypto-js/sha256');

const Block = require('../model/Block');

const timeStamp = require('../utils/timeStamp');
class Blockchain{
    constructor(db){
        this.storage = db;
        this.genesisBlock = new Block("First block in the chain - Genesis block");
    }

    async init() {
        try {
            let isEmpty = await this.storage.isEmpty();
            if(isEmpty) {
                console.log("Blockchain DB is empty. Creating new Blockchain with 1 genesis block...");
                return await this.addBlock(this.genesisBlock);
            } else {
                console.log("Blockchain DB has blocks. Reading Blockchain from DB...");
            }
        } catch (e) {
            throw e;
        }
    }

    async addBlock(blockData){
        let previousBlock, chainLength;
        // creating new Block from blockData.
        let newBlock = new Block(blockData);
        // timestamping the new Block with current time.
        newBlock.time = timeStamp();
        // getting current chain length.
        try{
            chainLength = await this.storage.getChainLength();
        } catch (e) {
            throw e;
        }
        // new Block height is equal to the current ChainLength.
        newBlock.height = chainLength;
        // getting the hash of the previous Block in Blockchain to assign it to new Block.
        if(chainLength === 0) {
            newBlock.previousBlockHash = "";
        } else {
            try {
                previousBlock = await this.storage.getBlock(chainLength - 1);
                newBlock.previousBlockHash = previousBlock.hash;
            } catch (e) {
                throw e;
            }
        }
        // calculating new Block hash right before saving it to Blockchain.
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        // saving the new Block to Blockchain.
        try {
            return await this.storage.saveBlock(newBlock);
        } catch (e) {
            throw e;
        }
    }

    async getBlockHeight() {
        try {
            return await this.storage.getChainLength()
        } catch (e) {
            throw e;
        }
    }

    async getBlock(blockHeight){
        try {
            return await this.storage.getBlock(blockHeight);
        } catch (e) {
            throw e;
        }
    }

    validateBlock(blockHeight){
        let _this = this;
        return new Promise(function(resolve, reject){
            _this.storage.getBlock(blockHeight).then(block => {
                let blockHash = block.hash;
                block.hash = '';
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                if (blockHash === validBlockHash) {
                    resolve(true);
                } else {
                    reject(new Error('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash));
                }
            });
        });
    }

    validateChain() {
        let errors = [];
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.storage.getChainLength()
                .then(currentLength => {
                    let allBlockValidations = [];
                    for(let i = 0; i < currentLength; i++) {
                        allBlockValidations.push(
                            _this.validateBlock(i)
                                .catch(err => {
                                    errors.push(err);
                                })
                        );
                    }
                    return Promise.all(allBlockValidations);
                })
                .then(value => {
                    if(errors.length > 0) {
                        reject(errors);
                    } else {
                        resolve(true);
                    }
                })
                .catch(err => {
                    reject(err.message);
                });
        });
    }

    async getBlocksForHeights(heights) {
        try {
            let blockPromises = [];
            heights.forEach(height => {
                blockPromises.push(this.getBlock(height));
            });
            return await Promise.all(blockPromises);
        } catch (e) {
            throw e;
        }
    }
}

module.exports = Blockchain;