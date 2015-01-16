var helper = require('service.helper');
var zmq = require('zmq');
//var zonar = require('zonar');
var config = require('./config');

function init(){
    var service = helper.service();

    var doc = helper.createDoc({ filename : "README.md"});
    var publish = null;
    var motd = "No motd set :/";

    service.rep({ endpointName : "command"}, function(err, rawMsg, reply){
        if(err){
            reply("error on server : " + err);
            return;
        }

        var msg = helper.tryParseJson(rawMsg);
        var response;

        // could the message be parsed?
        if(msg === false) {
            response = errorResponse("Couldn't parse message as json : \"" + rawMsg + "\"");
        } else if(msg.type == "getMessage"){
            response = okResponse(motd);
        } else if(msg.type == "setMessage"){

            if(!msg.message){
                response = errorResponse("Property \"message\" missing on request : " + rawMsg);
            } else {
                response = motdResponse();
            }

        } else {
            response = errorResponse("Unknown message type in message : " + rawMsg);
        }

        reply(response);
    });

    service.pub({ endpointName : "pub"}, function(err, publisher){
        publish = publisher;
    });

    service.broadcast({ net : "24hr", name : "motd"}, function(){
        console.log("started");
        setNewMotd(motd);
        service.handleInterrupt();
    });

    function setNewMotd(msg){
        motd = msg;
        publish(motdResponse(msg));
    }
}

function motdResponse(msg){
    return JSON.stringify({ message : msg});
}

function okResponse(msg){
    var baseMsg = { success : true };

    if(msg){
        baseMsg.message = msg;
    }

    return JSON.stringify(baseMsg);
}

function errorResponse(error){
    return JSON.stringify({ success : false, error : error});
}




// start it
init();
