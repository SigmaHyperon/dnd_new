const express = require("express");
const log = require('./../log.js');
const bodyParser = require('body-parser');
const {Inventory, Item} = require('./../mongo.js');
const uuid = require('uuid/v4');
var apiRouterV1 = express.Router();
apiRouterV1.use(bodyParser.json());
apiRouterV1.use(function(req, res, next){
    log.log(`Call `+req.method+" "+req.originalUrl, ['API', 'v1']);
    next();
});
function sendResponse(res){
    return (err, doc) => {
        if(!err){
            res.json(JSON.stringify(doc));
        } else {
            log.debugError(err, ['API', 'MONGO']);
            res.status(400).send("you are bad and you should feel bad");
        }
    }
}


apiRouterV1.get(`/inv`, (req, res) => {
    Inventory.find().lean().exec(sendResponse(res));
});
apiRouterV1.get(`/inv/:invId`, (req, res) => {
    Inventory.findOne({id: req.params.invId}).lean().exec(sendResponse(res));
});

apiRouterV1.get(`/inv/:invId/item`, (req, res) => {
    Item.find({inventory: req.params.invId}).lean().exec(sendResponse(res));
});
apiRouterV1.get(`/inv/:invId/item/:itemId`, (req, res) => {
    Item.findOne({id: req.params.itemId, inventory: req.params.invId}).lean().exec(sendResponse(res));
});

apiRouterV1.get(`/item`, (req, res) => {
    Item.find().lean().exec(sendResponse(res));
});
apiRouterV1.get(`/item/:itemId`, (req, res) => {
    Item.findOne({id: req.params.itemId}).lean().exec(sendResponse(res));
});

apiRouterV1.post(`/inv/:invId`, (req, res) => {
    Inventory.findOne({id: req.params.invId},(err, doc) => {
        if(err) return;
        for (let prop in req.body){
            if(typeof doc[prop] != 'undefined' && prop != 'id'){
                doc[prop] = req.body[prop];
            }
        }
        doc.save((err, result) => {
            if(err){
                log.error(err.name, ['API', 'MONGO']);
                res.status(500).send(err.name);
            } else {
                res.status(200).json(result);
            }
        });
    });
});
apiRouterV1.post(`/item/:itemId`, (req, res) => {
    Item.findOne({id: req.params.itemId},(err, doc) => {
        if(err) return;
        for (let prop in req.body){
            if(typeof doc[prop] != 'undefined' && prop != 'id'){
                doc[prop] = req.body[prop];
            }
        }
        doc.save((err, result) => {
            if(err){
                log.error(err.name, ['API', 'MONGO']);
                res.status(500).send(err.name);
            } else {
                res.status(200).json(result);
            }
        });
    });
});

apiRouterV1.post(`/inv/:invId/item/:itemId`, (req, res) => {
    Inventory.find({id: req.params.invId},(err, doc) => {
        if(doc.length == 1){
            Item.findOne({id: req.params.itemId, inventory: req.params.invId},(err, doc) => {
                if(err) return;
                for (let prop in req.body){
                    if(typeof doc[prop] != 'undefined' && prop != 'id'){
                        doc[prop] = req.body[prop];
                    }
                }
                doc.save((err, result) => {
                    if(err){
                        log.error(err.name, ['API', 'MONGO']);
                        res.status(500).send(err.name);
                    } else {
                        res.status(200).json(result);
                    }
                });
            });
        }
    });
});

apiRouterV1.put(`/inv`, (req, res) => {
    var newInv = new Inventory();
    newInv.id = uuid();
    Object.assign(newInv, req.body);
    newInv.save((err, result) => {
        if(err){
            log.error(err.name, ['API', 'MONGO']);
            res.status(500).send(err.name);
        } else {
            res.status(200).json(result);
        }
    });
});
apiRouterV1.put(`/item`, (req, res) => {
    var newItem = new Item();
    newItem.id = uuid();
    Object.assign(newItem, req.body);
    newItem.save((err, result) => {
        if(err){
            log.error(err.name, ['API', 'MONGO']);
            res.status(500).send(err.name);
        } else {
            res.status(200).json(result);
        }
    });
});
apiRouterV1.put(`/inv/:invId/item`, (req, res) => {
    Inventory.find({id: req.params.invId},(err, doc) => {
        if(doc.length == 1){
            var newItem = new Item();
            newItem.id = uuid();
            newItem.inventory = req.params.invId;
            Object.assign(newItem, req.body);
            newItem.save((err, result) => {
                if(err){
                    log.error(err.name, ['API', 'MONGO']);
                    res.status(500).send(err.name);
                } else {
                    res.status(200).json(result);
                }
            });
        }
    });
});


var apiRouter = express.Router();
apiRouter.use("/v1", apiRouterV1);

module.exports = apiRouter;
