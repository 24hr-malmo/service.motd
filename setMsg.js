
var helper = require('service.helper');
var service = helper.service();

service.listen({ net : '24hr', name: 'motd-override'}, function(){
    service.req({ to : "motd.command", message : JSON.stringify({type : "setMessage", message : "override!"})}, function(err, res){
        if(err){
            console.log(err);
            return;
        }

        console.log(res);
    });
});




