/**
 * Created by py on 01/09/2018.
 */
const Block = require('../model/Block');
const StatusCodes = require('./StatusCodes.js');

module.exports = class BlockController {
    constructor(starService, blockService){
        this.starService = starService;
        this.blockService = blockService;
    }
    async getBlockByHeight(request, response) {
        let height = request.params.blockHeight;
        let blockPromise = this.blockService.getBlock(height);
        try {
            let block = await this.blockService.getBlock(height);
            response.json(block);
        } catch (e) {
            response.status(StatusCodes.BAD_REQUEST).json({errors: e.message});
        }
    };
    //TODO update README about the error text and conditions.
    async postBlock(request, response) {
        try {
            BlockController.validateRequestBody(request.body);
            let block = await this.starService.registerStar(request.body);
            response.json(block);
        } catch (err) {
            response.status(StatusCodes.BAD_REQUEST).json({errors: err.message});
        }
    }
    static validateRequestBody(requestBody) {
        let errors = [];
        if(requestBody === undefined || requestBody === "") errors.push(new Error("Request body is empty"));
        if(requestBody.address === undefined || requestBody.address === "") errors.push(new Error("Bitcoin address is empty"));
        if(requestBody.star === undefined || requestBody.star === "") {
            errors.push(new Error("Star data is empty"));
        } else {
            if (requestBody.star.ra === undefined || requestBody.star.ra === "") errors.push(new Error("Right Ascend is empty"));
            if (requestBody.star.dec === undefined || requestBody.star.dec === "") errors.push(new Error("Declination is empty"));
            if (requestBody.star.story === undefined || requestBody.star.story === "") {
                errors.push(new Error("Story is empty"));
            } else {
                let storyLengthBytes = Buffer.from(requestBody.star.story, "ascii").toString("hex").length;
                let storyLengthWords = requestBody.star.story.split(" ").length;
                if (storyLengthBytes > 500 || storyLengthWords > 250) errors.push(new Error("Story length must be less than 500 bytes or 250 words"));
            }
        }

        if(errors.length > 0) {
            throw new Error(errors.toString());
        } else {
            return true;
        }
    }
};