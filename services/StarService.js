const level = require('level');

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
                await this.addBlockToAddressIndex(block, address);
                await this.addBlockToHashIndex(block);
            } catch (err) {
                throw err;
            }
        } else if(!isWindowValid) {
            throw new Error("Star registration needs open Validation Window. It is closed now.");
        } else if(!isSignatureValid) {
            throw new Error("Star registration needs valid signature. No valid signature found.");
        }
        this.windowService.closeWindow(address);
        this.signatureService.revokeSignature(address);
        console.log(this.indexByAddress);
        console.log(this.indexByBlockHash);
        return block;
    }

    async findStarsByQuery(query) {
        if(query.isAddress()) {
            try{
                return await this.findStarsByAddress(query.resolveToAddress())
            } catch (e) {
                throw e;
            }
        } else if(query.isHash()) {
            try {
                return await this.findStarByHash(query.resolveToHash());
            } catch (e) {
                throw e;
            }
        }
    }

    async findStarsByAddress(address) {
        let blocks = [];
        let heights;
        try {
            heights = await this.resolveHeightsForAddress(address);
            console.log(heights);
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

    async findStarByHash(hash) {
        try {
            let height = await this.resolveHeightForHash(hash);
            console.log(height);
            let block = await this.blockService.getBlock(height);
            this.encoderDecoderService.decodeProperty(block, "body.star.story", "body.star.storyDecoded");
            return block;
        } catch (e) {
            throw e;
        }
    }

    async findStarByHeight(height) {
        return await this.blockService.getBlock(height);
    }

    async resolveHeightsForAddress(address) {
        try {
            return JSON.parse(await this.indexByAddress.get(address));
        } catch (e) {
            throw e;
        }
    }

    async resolveHeightForHash(hash) {
        try {
            return JSON.parse(await this.indexByBlockHash.get(hash));
        } catch (e) {
            throw e;
        }
    };

    async addBlockToAddressIndex(block, address) {
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

    async addBlockToHashIndex(block) {
        try {
            await this.indexByBlockHash.put(block.hash, JSON.stringify(block.height));
        } catch (e) {
            throw  e;
        }
    }
};