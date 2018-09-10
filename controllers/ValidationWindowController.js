const StatusCodes = require("./StatusCodes");

module.exports = class ValidationWindowController {
    constructor(validationWindowService) {
        this.validationWindowService = validationWindowService;
    }
    openValidationWindow(request, response) {
        let address = request.body.address;
        if(address === undefined) response.status(StatusCodes.BAD_REQUEST).json({
            error: "address can not be empty"
        }); else {
            let validationWindow = this.validationWindowService.createValidationWindow(address);
            response.json(validationWindow);
        }
    }
};