const Controller = require('./Controller');
const WalletAddress = require("./requests/WalletAddress");
const Signature = require('./requests/Signature');
const PostSignatureRequest = require('./requests/PostSignatureRequest');

module.exports = class SignatureController extends Controller {
    constructor(signatureService) {
        super();
        this.signatureService = signatureService;
    }
    async postSignature(request, response) {
        let address = new WalletAddress(request.body.address);
        let signature = new Signature(request.body.signature);
        let postSignatureRequest = new PostSignatureRequest(address, signature);
        try {
            postSignatureRequest.isValid();
            let signatureValidationStatus = await this.signatureService.validateSignature(address.get(), signature.get());
            response.json(signatureValidationStatus);
        } catch (err) {
            this.onError(err, response);
        }
    }
};