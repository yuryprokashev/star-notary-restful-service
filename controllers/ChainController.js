const Controller = require('./Controller');
const Chain = require("./responses/Chain");
module.exports = class ChainController extends Controller {
    constructor(blockService) {
        super();
        this.blockService = blockService;
    }
    async getChain(request, response) {
        try {
            let height = await this.blockService.getBlockHeight();
            let isValid = await this.blockService.validateChain();
            response.json(new Chain(height, isValid));
        } catch (e) {
            this.onError(e);
        }
    }
};