/**
 *Created by py on 01/09/2018
 */
    //    TODO When Done With Project. Add 400 and 429 Errors.
    //    TODO When Done With Project. Refactor to async/await instead of Promises
    //    TODO When Done With Project. Move base error responding and successful responding to Controller class
const express = require('express');
const bodyParser = require('body-parser');

const BlockDb = require('./dao/BlockchainDb');
const level = require('level');

const BlockService = require('./services/BlockchainService');
const ValidationWindowService = require('./services/ValidationWindowService');
const SignatureService = require('./services/SignatureService');
const StarService = require('./services/StarService');
const EncoderDecoderService = require('./services/EncoderDecoderService');

const BlockController = require('./controllers/BlockController');
const ChainController = require('./controllers/ChainController');
const ValidationWindowController = require('./controllers/ValidationWindowController');
const SignatureController = require('./controllers/SignatureController');
const StarController = require('./controllers/StarController');

const Resources = require("./controllers/Resourses");

const app = express();
const PORT = 8000;
const VALIDATION_WINDOW_SIZE = 300; // seconds

let blockDb = new BlockDb("./db/blocks");
let indexByAddress, indexByHash;

try {
    indexByAddress = level("./db/stars/indexByAddress");
    indexByHash = level("./db/stars/indexByHash");
} catch (e) {
    console.log(e);
    process.exit(1);
}


let blockService = new BlockService(blockDb);
let validationWindowService = new ValidationWindowService(VALIDATION_WINDOW_SIZE);
let signatureService = new SignatureService(validationWindowService);
let encoderDecoderService = new EncoderDecoderService();
let starService = new StarService(
    blockService,
    validationWindowService,
    signatureService,
    encoderDecoderService,
    indexByAddress,
    indexByHash);

let blockController = new BlockController(starService, blockService);
let chainController = new ChainController(blockService);
let validationWindowController = new ValidationWindowController(validationWindowService);
let signatureController = new SignatureController(signatureService);
let starController = new StarController(starService);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post(Resources.BLOCKS, blockController.postBlock.bind(blockController));

app.get(Resources.CHAINS, chainController.getChain.bind(chainController));

app.post(Resources.VALIDATION_WINDOW, validationWindowController.openValidationWindow.bind(validationWindowController));

app.post(Resources.SIGNATURES, signatureController.postSignature.bind(signatureController));

app.get(Resources.STARS_BY_QUERY, starController.getStarByQuery.bind(starController));

app.get(Resources.BLOCK_BY_HEIGHT, starController.getBlockByHeight.bind(starController));

app.listen(PORT, () => {
    console.log(`app is listening on port ${PORT}\n`);
});