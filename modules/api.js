const express = require("express");
const log = require('./log.js');
const bodyParser = require('body-parser');
const {Inventory, Item, User} = require('./mongo.js');
const uuid = require('uuid/v4');
const sha256 = require('js-sha256');
const random = require('random');
const config = require('./config-default.js');

var tokens;

var apiRouterV1 = express.Router();
apiRouterV1.use(bodyParser.json());
apiRouterV1.use(function(req, res, next){
    log.log(`Call `+req.method+" "+req.originalUrl, ['API', 'v1']);
    next();
});
apiRouterV1.use(function(req, res, next){
    //TODO: auth
    if( config.default('api.auth', true) && !config.default('debugMode', false)){
        if(typeof req.get('x-auth') != 'undefined'){
            let authData;
            try{
                authData = JSON.parse(req.get('x-auth'));
            } catch(e){
                res.status(400).send('auth data malformed');
            }
            let user = tokens[authData.user];
            /**
             * check for:
             * user found?
             * user integrity?
             * auth match?
             * token expired?
             */
            if(user){
                if(user.token && user.token.secret && user.token.expiryDate){
                    if(user.token.secret === authData.token && Date.now() < user.token.expiryDate){
                        next();
                        return;
                    }
                }
            }
            res.status(403).send('auth failed');
        } else {
            res.status(400).send('auth required');
        }
    } else {
        next();
    }
});

function cleanDoc(doc){
    let uncleanKeys = Object.keys(doc).filter(v => v.indexOf('_') === 0);
    for (var key in uncleanKeys) {
        if (uncleanKeys.hasOwnProperty(key)) {
            delete doc[uncleanKeys[key]];
        }
    }
    return doc;
}

function sendResponse(res){
    return (err, doc) => {
        if(doc.isArray()){
            for (var index in doc) {
                if (doc.hasOwnProperty(index)) {
                    doc[index] = cleanDoc(doc[index]);
                }
            }
        } else {
            doc = cleanDoc(doc);
        }
        if(!err){
            res.json(JSON.stringify(doc));
        } else {
            log.debugError(err, ['API', 'MONGO']);
            res.status(400).send("you are bad and you should feel bad");
        }
    }
}
// GET

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

apiRouterV1.get(`/user`, (req, res) => {
    User.find({}, {password: false, salt: false}).lean().exec(sendResponse(res));
});
apiRouterV1.get(`/user/:userId`, (req, res) => {
    User.findOne({id: req.params.userId}, {password: false, salt: false}).lean().exec(sendResponse(res));
});

function saveErrorHandler(res){
    return (err, result) => {
        if(err){
            log.error(err.name, ['API', 'MONGO']);
            res.status(500).send(err.name);
        } else {
            res.status(200).json(result);
        }
    };
}

function applyUpdate(req, res){
    return (err, doc) => {
        if(err) return;
        for (let prop in req.body){
            if(typeof doc[prop] != 'undefined' && prop != 'id' && prop != 'salt'){
                if(prop == 'password'){
                    doc[prop] = sha256(req.body[prop]+doc.salt);
                } else {
                    doc[prop] = req.body[prop];
                }
            }
        }
        doc.save(saveErrorHandler(res));
    }
}

function performUpdate(type){
    return (req, res, next) => {
        if(req.method == "PATCH"){
            type.findOne({id: req.params.id}, applyUpdate(req, res));
        } else {
            next();
        }

    }
}

//UPDATE

apiRouterV1.all(`/inv/:id`, performUpdate(Inventory));

apiRouterV1.all(`/item/:id`, performUpdate(Item));

apiRouterV1.all(`/inv/:invId/item/:itemId`, (req, res, next) => {
    if(req.method == "UPDATE"){
        Item.findOne({id: req.params.itemId, inventory: req.params.itemId},applyUpdate(res));
    } else {
        next();
    }
});

apiRouterV1.all(`/user/:id`, performUpdate(User));

function createDocument(type){
    return (req, res) => {
        var newDoc = new type();
        newDoc.id = uuid();
        Object.assign(newDoc, req.body);
        newDoc.save(saveErrorHandler(res));
    };
}

//PUT

apiRouterV1.put(`/inv`, createDocument(Inventory));
apiRouterV1.put(`/item`, createDocument(Item));
apiRouterV1.put(`/user`, (req, res) => {
    var newDoc = new User();
    newDoc.id = uuid();
    Object.assign(newDoc, req.body);
    newDoc.salt = sha256(random.int().toString());
    newDoc.password = sha256(req.body.password + newDoc.salt)
    newDoc.save(saveErrorHandler(res));
});

apiRouterV1.put(`/inv/:invId/item`, (req, res) => {
    Inventory.find({id: req.params.invId},(err, doc) => {
        if(doc.length == 1){
            var newItem = new Item();
            newItem.id = uuid();
            newItem.inventory = req.params.invId;
            Object.assign(newItem, req.body);
            newItem.save(saveErrorHandler(res));
        } else {
            res.sendStatus(500);
        }
    });
});

function deleteErrorHandler(res) {
    return (err, doc) => {
        if(err){
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    };
}

//DELETE

apiRouterV1.delete(`/inv/:invId`, (req, res) => {
    Inventory.deleteOne({id: req.params.invId}, deleteErrorHandler(res));
});
apiRouterV1.delete(`/item/:itemId`, (req, res) => {
    Item.deleteOne({id: req.params.itemId}, deleteErrorHandler(res));
});
apiRouterV1.delete(`/inv/:invId/item/:itemId`, (req, res) => {
    Item.deleteOne({id: req.params.invId, inventory: req.params.itemId}, deleteErrorHandler(res));
});
apiRouterV1.delete(`/user/:userId`, (req, res) => {
    User.deleteOne({id: req.params.userId}, deleteErrorHandler(res));
});

/*apiRouter.post(`/item/:itemId`, (req, res) => {
    switch (req.body.method) {
        case "move":
            if(typeof req.body.target != 'undefined'){

            }
            break;
        default:

    }
});*/


var apiRouter = express.Router();
apiRouter.use("/v1", apiRouterV1);

function setTokens(tok){
    tokens = tok;
}

module.exports = {setTokens, apiRouter};
