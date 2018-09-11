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

    async validateBlock(blockHeight){
        try{
            // getting Block at given height;
            let block = await this.storage.getBlock(blockHeight);
            // storing its hash in local variable for further comparison.
            let blockHash = block.hash;
            // removing current hash from the Block.
            block.hash = "";
            // now calculate hash of the Block without its hash. It is the hash value, that we obtain before this block was saved to Blockshain.
            let validBlockHash = SHA256(JSON.stringify(block)).toString();
            // now compare the current block hash, stored in blockHash variable, with valid hash.
            if(blockHash === validBlockHash) return true;
            throw new Error('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
        } catch (e) {
            throw e;
        }
    }

    async validateChain() {
        let errors = [];
        let chainLength;
        let allBlockValidations = [];
        try {
            chainLength = await this.storage.getChainLength();
        } catch (e) {
            throw e;
        }

        for(let i = 0; i < chainLength; i++) {
            try {
                let blockValidationPromise = await this.validateBlock(i);
                allBlockValidations.push(blockValidationPromise);
            } catch (e) {
                errors.push(e);
            }
        }

        if(errors.length > 0) {
            return errors;
        } else {
            return true;
        }
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

    getChain() {
        return this.storage;
    }
}

module.exports = Blockchain;