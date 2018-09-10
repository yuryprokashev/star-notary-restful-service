/**
 * Created by py on 02/09/2018.
 */

module.exports = class ChainController {
    constructor(blockService) {
        this.blockService = blockService;
    }
    getChain(request, response) {
        let heightPromise = this.blockService.getBlockHeight();
        let validChainPromise = this.blockService.validateChain();
        Promise.all([heightPromise, validChainPromise])
            .then(values => {
                response.json({
                    height: values[0],
                    isValid: values[1]
                });
            })
            .catch(err => {
                response.json({
                    error: err.message
                });
            });
    }
};