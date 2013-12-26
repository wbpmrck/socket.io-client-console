/**
 * @Created by kaicui(https://github.com/wbpmrck).
 * @Date:2013-10-21 14:18
 * @Desc: descriptions
 * 1、
 * 2、
 * @Change History:
 --------------------------------------------
 @created：|kaicui| 2013-10-21 14:18.
 --------------------------------------------
 */

/*
 todo:imports
 */
var readLine = require('readline');
var io = require('socket.io-client');
var processMap = require('./map').route,
    commandList =[],reserved={'hello':1,'end':1,'noSuchCommand':1,'promptCommand':1,'help':1};

var preProcessor  = require('./preProcessor');

//init commandList
for(var i in processMap){
    if(!reserved[i]){
        commandList.push(i);
    }
}

var rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer:function(line) {
        var hits = commandList.filter(function(c) { return c.indexOf(line) == 0 })
        // show all completions if none found
        return [hits.length ? hits.slice(0,1) : commandList, line]
    }
});

//context is used to store data for all commands
var _context ={
    io:io,
    seed:0,
    commandList:commandList,
    connected:0,
    connections:[],
    selectedSockets:[],
    cursor:-1
};//default has a commandList

processCommand('hello',rl,_context);


function getFullErrorInfo(errorObj){
    var info='';
    if (typeof errorObj === 'object') {
        if (errorObj.message) {
            info+=('\r\nMessage: ' + errorObj.message)
        }
        if (errorObj.stack) {
            info =[info,'\r\nStacktrace:','====================',errorObj.stack].join('');

        }
    }
    else{
        info='errorObj is not an object!'
    }
    return info;

};
function processCommand(commandName,readLineInterface,context,args){
    if(!processMap.hasOwnProperty(commandName)){
        commandName= 'noSuchCommand'
    }
    try{
        args = args||[];
        for(var i=args.length-1;i>=0;i--){
            args[i] =preProcessor.process(args[i]);
        }
//    console.log('args.length: %s', args.length);
//    console.log('\n[processCommand:] %s , %s \n',commandName,args);
        processMap[commandName].handler.call(context,readLineInterface,args,function next(nextCommandName,args){
            processCommand(nextCommandName,readLineInterface,context,args)
        });
    }
    catch(e){
        console.log('error:%s', getFullErrorInfo(e));
        processCommand('promptCommand',readLineInterface,context,[])
    }
}