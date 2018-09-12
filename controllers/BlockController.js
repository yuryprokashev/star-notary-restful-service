const Controller = require('./Controller');
const WalletAddress = require("./requests/WalletAddress");
const Star = require("./requests/Star");
const PostStarRequest = require("./requests/PostStarRequest");
const BlockHeight = require('./requests/BlockHeight');

module.exports = class BlockController extends Controller {
    constructor(starService, blockService){
        super();
        this.starService = starService;
        this.blockService = blockService;
    }
    async getBlockByHeight(request, response) {
        let height = request.params.blockHeight;
        let blockHeight = new BlockHeight(request.params.blockHeight);
        try {
            blockHeight.isValid();
            let block = await this.blockService.getBlock(height);
            response.json(block);
        } catch (e) {
            this.onError(e, response);
        }
    };

    async postBlock(request, response) {
        let address = new WalletAddress(request.body.address);
        let star = new Star(request.body.star);
        let postStarRequest = new PostStarRequest(address, star);
        try {
            postStarRequest.isValid();
            let block = await this.starService.registerStar(request.body);
            response.json(block);
        } catch (e) {
            this.onError(e, response);
        }
    }
};