function log(message, sources = []){
    console.log((new Date()).toISOString()+" "+sources.map(v=>'['+v+']').join(" ")+" "+message);
}
function debug(debugItem, sources){
    log("Debug:", sources);
    console.log(debugItem);
}
function error(message, sources){
    sources.unshift("ERROR");
    log(message, sources);
}
function debugError(debugItem, sources){
    sources.unshift("ERROR");
    debug(debugItem, sources);
}

module.exports = {log, debug, error, debugError};
