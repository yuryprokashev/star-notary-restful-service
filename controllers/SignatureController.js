module.exports = class SignatureController {
    constructor(signatureService) {
        this.signatureService = signatureService;
    }
    async postSignature(request, response) {
        let address = request.body.address;
        let signature = request.body.signature;
        try {
            let signatureValidationStatus = await this.signatureService.validateSignature(address, signature);
            response.json(signatureValidationStatus);
        } catch (err) {
            response.json({
                error: err.message
            });
        }

    }
};