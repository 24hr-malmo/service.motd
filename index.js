var helper = require('service.helper');
var zmq = require('zmq');
var zonar = require('zonar');
var config = require('./config');


function init(){

    var doc = helper.createDoc({ filename : "README.md"});
    var repSock = zmq.socket('rep');
    var pubsock = zmq.socket("pub");
    var motd = "motd service has the default message...";

    var z = zonar.create({
        net : "24hr",
        name : "motd",
        payload : {
            doc : doc.getPayload(),
            pub : {
                type : "pub",
                port : config.publisherPort
            },
            reqRep : {
                type : "rep",
                port : config.repPort
            }
        }
    });


    // publisher
    pubsock.bindSync("tcp://*:" + config.publisherPort);

    // reply
    repSock.bindSync("tcp://*:" + config.repPort);

    repSock.on("message", function(rawMsg){
        var msg = helper.tryParseJson(rawMsg.toString());
        var response;

        // could the message be parsed?
        if(msg === false) {
            response = errorResponse("Couldn't parse message : " + rawMsg);

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

        repSock.send(response);

    });

    z.start(function(){
        console.log("started");
        //setTimeout(function(){
        setNewMotd(motd);
        //}, 1000);
    });

    // interrupt handler
    helper.handleInterrupt(z);

    function setNewMotd(msg){
        motd = msg;
        pubsock.send(motdResponse(msg));
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
