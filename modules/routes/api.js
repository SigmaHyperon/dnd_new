const express = require("express");
const log = require('./../log.js');
var apiRouterV1 = express.Router();
apiRouterV1.use(function(req, res, next){
    log.log(`Call `+req.originalUrl, ['API', 'v1']);
    //console.log(`[`+(new Date()).toISOString()+`] [API] [v1] Call `+req.originalUrl);
    next();
});
apiRouterV1.get(`/inv`, (req, res) => {
    res.send(`list of inventories`);
});
apiRouterV1.get(`/inv/:invId`, (req, res) => {
    res.json({
        id: "c6754d2d-ee14-4e85-86ca-35dbfbbb9024",
        name: "backpack",
        user: "42"
    });
    //res.send(`Inventory #${req.params.invId} Overview`);
});
apiRouterV1.get(`/inv/:invId/item`, (req, res) => {
    res.send(`Inventory #${req.params.invId} Item Overview`);
});
apiRouterV1.get(`/inv/:invId/item/:itemId`, (req, res) => {
    res.json({
        id: "9792c4f0-3038-466c-b657-d0b8e58ca041",
        name: "Pretty cool Sword",
        amount: 1,
        description: "a pretty cool sword",
        icon: "42",
        Inventory: "42"
    });
    //res.send(`Inventory #${req.params.invId} Item #${req.params.itemId}`);
});

var apiRouter = express.Router();
apiRouter.use("/v1", apiRouterV1);

module.exports = apiRouter;
