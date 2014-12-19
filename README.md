service.motd
============

Message of the day service

pub :
{
    message : "the message"
}


reqRep

type 1:

{
    type : "getMessage"
}

=>

{
    success : true,
    message : "the message"
}


type 2:

{
    type : "setMessage",
    message : "a new message"
}

=>

{
    success : true
}