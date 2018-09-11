const BlockchainDb = require('../dao/BlockchainDb');
const Blockchain = require('../services/BlockchainService');
const del = require("del");

(function test(){
    console.log("--- creating BlockchainDb instance, which is level DB wrapper.");
    let db = new BlockchainDb("./db");
    console.log("--- creating bc instance and injecting db intance to it.");
    let bc = new Blockchain(db);
    console.log("--- setting test constants.");
    const TOTAL_BLOCKS = 20;
    const ASYNC_WAIT_INTERVAL = 300;
    const INVALID_BLOCK_HEIGHTS = [4, 9, 13];

    console.log("--- adding 20 blocks to the chain. 21 blocks total. 20 is the height of the latest block.");
    for(let i = 1; i <= TOTAL_BLOCKS; i++) {
        let b = "simple " + i;
        setTimeout(async () => {
            try {
                await bc.addBlock(b);
            } catch (e) {
                console.log("block population phase failed.\n");
                console.log(e);
            }
        }, i * ASYNC_WAIT_INTERVAL);
    }
    setTimeout(async () => {
        console.log("--- at this point the chain is valid => validateChain must log success message.");
        try {
            let chainIsValid = await bc.validateChain();
            if(chainIsValid === true) {
                console.log(chainIsValid);
            } else if(chainIsValid.length > 0) {
                chainIsValid.forEach(error => {
                    console.log(error);
                });
            }
        } catch(e) {
            console.log("validation of valid chain phase failed.\n");
            console.log(e);
        }
    }, (TOTAL_BLOCKS + 1) * ASYNC_WAIT_INTERVAL);

    setTimeout(async () => {
        console.log("--- invalidating some blocks in the chain to test validation.");
        INVALID_BLOCK_HEIGHTS.forEach(async index => {
            console.log(`hacking block at ${index}`);
            try {
                let blockToHack = await bc.getChain().getBlock(index);
                blockToHack.body = `hacked block ${index}`;
                return await bc.getChain().getDb().put(index, JSON.stringify(blockToHack));
            } catch (e) {
                console.log("hacking phase failed.\n");
                console.log(e);
            }
        });
    }, (TOTAL_BLOCKS + 2) * ASYNC_WAIT_INTERVAL);

    setTimeout(async () => {
        console.log("--- at this point chain has 3 invalid blocks. => validateChain must return array with errors");
        try {
            let chainIsValid = await bc.validateChain();
            if(chainIsValid === true) {
                console.log(chainIsValid);
            } else if(chainIsValid.length > 0) {
                console.log("printing validation errors\n");
                chainIsValid.forEach(error => {
                    console.log(error.message);
                });
            }
        } catch(e) {
            console.log("validation of invalid chain phase failed.\n");
            console.log(e);
        }
    }, (TOTAL_BLOCKS + 3) * ASYNC_WAIT_INTERVAL);
    setTimeout(() => {
        del.sync(["db"]);
    }, (TOTAL_BLOCKS + 4) * ASYNC_WAIT_INTERVAL);
})();