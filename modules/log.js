function log(message, sources){
    console.log((new Date()).toISOString()+" "+sources.map(v=>'['+v+']').join(" ")+" "+message);
}
function debug(debugItem, sources){
    log("Debug:", sources);
    console.log(debugItem);
}

module.exports = {log, debug};
