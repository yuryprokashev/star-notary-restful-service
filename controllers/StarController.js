const StarQuery = require('./requests/StarQuery');
const Controller = require('./Controller');
const BlockHeight = require('./requests/BlockHeight');

module.exports = class StarController extends Controller {
    constructor(starService) {
        super();
        this.starService = starService;
    }
    async getBlockByHeight(request, response) {
        let height = new BlockHeight(request.params.blockHeight);
        try {
            height.isValid();
            let block = await this.starService.findStarByHeight(height.get());
            response.json(block);
        } catch (e) {
            this.onError(e, response);
        }
    }

    async getStarByQuery(request, response) {
        let query = new StarQuery(request.params.query);
        try {
            let queryType = query.resolveQueryType();
            let blocks = await this.starService.findStarsByQuery(queryType, query);
            response.json(blocks);
        } catch (e) {
            this.onError(e, response);
        }
    }
};