const StarQuery = require('./StarQuery');
module.exports = class StarController {
    constructor(starService) {
        this.starService = starService;
    }
    async getBlockByHeight(request, response) {
        let height = request.params.blockHeight;
        if(request.params.blockHeight === undefined) return response.status(400).json({
            error: "Block Height is undefined"
        });
        try {
            let block = await this.starService.findStarByHeight(height);
            response.json(block);
        } catch (err) {
            response.status(429).json(err);
        }
    }

    async getStarByQuery(request, response) {
        let query = new StarQuery(request.params.query);
        console.log(query);
        if (!query.isValid()) return response.status(400).json({
            errors: `Star Query is invalid: must be either hash or address`
        });
        try {
            let blocks = await this.starService.findStarsByQuery(query);
            response.json(blocks);
        } catch (err) {
            response.status(422).json({
                errors: err.message
            });
        }
    }
};