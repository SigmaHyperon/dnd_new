const express = require("express");
const log = require('./../log.js');
const bodyParser = require('body-parser');
const {Inventory, Item} = require('./../mongo.js');
var apiRouterV1 = express.Router();
apiRouterV1.use(bodyParser.json());
apiRouterV1.use(function(req, res, next){
    log.log(`Call `+req.originalUrl, ['API', 'v1']);
    //console.log(`[`+(new Date()).toISOString()+`] [API] [v1] Call `+req.originalUrl);
    next();
});

function sendResponse(err, doc){
    if(!err){
        res.json(JSON.stringify(doc));
    } else {
        log.debugError(err, ['API', 'MONGO']);
        res.status(400).send("you are bad and you should feel bad");
    }
}

apiRouterV1.get(`/inv`, (req, res) => {
    let tempInvs = new Inventory();
    tempInvs.findMany().lean().exec(sendResponse);
});
apiRouterV1.get(`/inv/:invId`, (req, res) => {
    let tempInv = new Inventory();
    tempInv.findOne({id: req.params.invId}).lean().exec(sendResponse);
});

apiRouterV1.get(`/inv/:invId/item`, (req, res) => {
    let tempItems = new Item();
    tempItems.findMany({inventory: req.params.invId}).lean(sendResponse);
});
apiRouterV1.get(`/inv/:invId/item/:itemId`, (req, res) => {
    let tempItem = new Item();
    tempItem.findOne({id: req.params.itemId, inventory: req.params.invId}).lean(sendResponse);
});

apiRouterV1.get(`/item`, (req, res) => {
    let tempItem = new Item();
    tempItem.findMany().lean().exec(sendResponse);
});
apiRouterV1.get(`/item/:itemId`, (req, res) => {
    let tempItems = new Item();
    tempItems.findOne({id: req.params.itemId}).lean().exec(sendResponse);
});

apiRouterV1.post(`/inv/:invId`, (req, res) => {
    let tempInv = new Inventory();
    tempInv.findOne({id: req.params.invId},(err, doc){
        if(err) return;

    });
})


var apiRouter = express.Router();
apiRouter.use("/v1", apiRouterV1);

module.exports = apiRouter;
