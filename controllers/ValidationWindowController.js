const Controller = require('./Controller');
const WalletAddress = require("./requests/WalletAddress");

module.exports = class ValidationWindowController extends Controller {
    constructor(validationWindowService) {
        super();
        this.validationWindowService = validationWindowService;
    }
    async openValidationWindow(request, response) {
        let address = new WalletAddress(request.body.address);
        try {
            address.isValid();
            let validationWindow = await this.validationWindowService.createValidationWindow(address.get());
            return response.json(validationWindow);
        } catch (e) {
            this.onError(e, response);
        }
    }
};