const level = require('level');
const BusinessLogicError = require('./BusinessLogicError');
const InvalidInputError = require('../controllers/InvalidInputError');

module.exports = class StarService {
    constructor(blockService,
                windowService,
                signatureService,
                encoderDecoderService,
                indexByAddress,
                indexByBlockHash) {
        this.blockService = blockService;
        this.windowService = windowService;
        this.signatureService = signatureService;
        this.encoderDecoderService = encoderDecoderService;
        this.indexByAddress = indexByAddress;
        this.indexByBlockHash = indexByBlockHash;
    }

    async registerStar(requestBody) {
        let address = requestBody.address;
        let isWindowValid = this.windowService.isWindowValid(address);
        let isSignatureValid = this.signatureService.isSignatureValid(address);
        let block;
        if(isWindowValid && isSignatureValid) {
            this.encoderDecoderService.encodeProperty(requestBody, "star.story", "star.story");
            try {
                block = await this.blockService.addBlock(requestBody);
                await this._addBlockToAddressIndex(block, address);
                await this._addBlockToHashIndex(block);
            } catch (err) {
                throw new BusinessLogicError(err.message);
            }
        } else if(!isWindowValid) {
            throw new BusinessLogicError("Star registration needs open Validation Window. It is closed now.");
        } else if(!isSignatureValid) {
            throw new BusinessLogicError("Star registration needs valid signature. No valid signature found.");
        }
        this.windowService.closeWindow(address);
        this.signatureService.revokeSignature(address);
        return block;
    }

    async findStarsByQuery(queryType, query) {
        if(queryType === "hash") {
            let hash = query.resolveToHash(query);
            try{
                return await this._findStarByHash(hash);
            } catch (e) {
                throw new BusinessLogicError(e.message);
            }
        } else if(queryType === "address") {
            let address = query.resolveToAddress();
            try {
                return await this._findStarsByAddress(address);
            } catch (e) {
                throw new BusinessLogicError(e.message);
            }
        } else {
            throw new InvalidInputError(`${query} type is invalid. Address or Hash are expected.`);
        }
    }

    async findStarByHeight(height) {
        try {
            let block = await this.blockService.getBlock(height);
            this.encoderDecoderService.decodeProperty(block, "body.star.story", "body.star.storyDecoded");
            return block;
        } catch (e) {
            throw new BusinessLogicError(e.message);
        }
    }

    async _findStarsByAddress(address) {
        let blocks = [];
        let heights;
        try {
            heights = await this._resolveHeightsForAddress(address);
            if(heights.length === 0) return blocks;
        } catch (e) {
            throw e;
        }
        try {
            blocks = await this.blockService.getBlocksForHeights(heights);
            blocks.forEach(block => {
                this.encoderDecoderService.decodeProperty(block, "body.star.story", "body.star.storyDecoded");
            });
            return blocks;
        } catch (e) {
            throw e;
        }
    }

    async _findStarByHash(hash) {
        try {
            let height = await this._resolveHeightForHash(hash);
            let block = await this.blockService.getBlock(height);
            this.encoderDecoderService.decodeProperty(block, "body.star.story", "body.star.storyDecoded");
            return block;
        } catch (e) {
            throw e;
        }
    }

    async _resolveHeightsForAddress(address) {
        try {
            return JSON.parse(await this.indexByAddress.get(address));
        } catch (e) {
            throw e;
        }
    }

    async _resolveHeightForHash(hash) {
        try {
            return JSON.parse(await this.indexByBlockHash.get(hash));
        } catch (e) {
            throw e;
        }
    };

    async _addBlockToAddressIndex(block, address) {
        let heights;
        try {
            heights = JSON.parse(await this.indexByAddress.get(address));
        } catch (e) {
            heights = [];
        }
        try {
            heights.push(block.height);
            await this.indexByAddress.put(address, JSON.stringify(heights));
        } catch (e) {
            throw e;
        }
    }

    async _addBlockToHashIndex(block) {
        try {
            await this.indexByBlockHash.put(block.hash, JSON.stringify(block.height));
        } catch (e) {
            throw  e;
        }
    }
};