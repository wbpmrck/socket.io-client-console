

//use  'this' to ref to the context object
exports.route ={
    /*
     todo:这里是保留命令
     */
    hello:{
        doc:'',
        handler:function(readLineInterface,args,next){
            console.log("you can do all the operation:"+this.commandList);
            next('promptCommand');
        }
    },
    /**
     * 所有提示用户输入命令，并且获取指令的流程
     * @param readLineInterface
     * @param args:提示语
     * @param next
     */
    promptCommand:{
        doc:'',
        handler:function(readLineInterface,args,next){

            var tip = (args.length>0?args[0]:'')+'\n';
            console.log(tip);
            readLineInterface.question(">>", function(answer) {
                //分解用户指令
                if(answer){
                    var commandText = answer.split(' ');
                    if(commandText&&commandText.length>0){
                        next(commandText[0],commandText.slice(1));
                    }
                    else{
                        console.log('answer is:%s',answer);
                    }
                }
                else{
                    next('noSuchCommand')
                }
            });
        }
    },
    noSuchCommand:{
        doc:'',
        handler:function(readLineInterface,args,next){
            console.log("no such command.  try these:"+this.commandList);
            next('promptCommand');
        }
    },
    end:{
        doc:'',
        handler:function(readLineInterface,args,next){
            console.log('prepare exit!');
            readLineInterface.close();
            process.exit(0);
        }

    },
    /**
     * 获取某项指令的帮助
     * @param readLineInterface
     * @param args
     * @param next
     */
    help:{
        doc:'get the command doc. \n use "help <commandName>"',
        handler:function(readLineInterface,args,next){
            var self = this;//save the this ref
            //if no args,give the general suggestion
            if(args.length<1){
                console.log('all commands: %s',self.commandList);
                console.log('please type "help (command name) for the detail!');
                next('promptCommand');
            }
            //give the detail suggestion
            else{
                var _commandToKnow = args[0],
                    _detail ='no suggestion~';
                _detail= exports.route[_commandToKnow].doc||_detail;
                console.log(_detail);
                next('promptCommand');
            }
        }
    },

    /*
     todo:下面是自定义的命令
     */

    /**
     *
     * @param readLineInterface
     * @param args:[count]
     * @param next
     */
    connect:{
        doc:'create connections. \n [connect <count> <address>]',
        handler:function(readLineInterface,args,next){
            var self = this;//save the this ref
            var connections = self.connections;
            function _createConnection(count,address){

                if(parseInt(address) == address){
                    address = 'http://localhost:'+address;
                }
                else if(address.indexOf('http://')<0){
                    address = 'http://'+address;
                }

                for(var i=0,j=count;i<j;i++){
                    try{
                        var socket = self.io.connect(address, {
//                    port: 8011,
                            reconnect:false,
                            'force new connection':true
                        });
                        self.connections.push(socket);
                        (function(s,index){
                            s.id = ++self.seed;
                            s.on('connect', function(){
                                self.connected++;
                                console.log('total:%s connected.',self.connected);
                                if(self.connected === connections.length){
                                    next('promptCommand')
                                }
                            });
                            s.on('disconnect', function(){
                                self.connected--;
                                //delete from connections
                                for(var m1=self.connections.length-1;m1>=0;m1--){
                                    var sock = self.connections[m1];
                                    if(sock.id === s.id){
                                        self.connections.splice(m1,1);
                                    }
                                }
                                //delete from the selected array
                                for(var m2=self.selectedSockets.length-1;m2>=0;m2--){
                                    var sock = self.selectedSockets[m2];
                                    if(sock.id === s.id){
                                        self.selectedSockets.splice(m2,1);
                                    }
                                }
                                console.log('total:%s connected.',self.connected);
                                console.log('total:%s selected.',self.selectedSockets.length);
                            });
                        })(socket,i);
                    }
                    catch(e){
                        console.log('error:%s', e.toString());
                        next('promptCommand')
                    }
                }
            }

            //if no args,show the tip
            if(!args||args.length<1){
                readLineInterface.question("how many connections will create?\n", function(count) {
                    readLineInterface.question("please input the address(http://xxx:xxx)\n", function(address) {
                        console.log("creating : "+count+ 'connections to: '+address);
                        _createConnection(parseInt(count),address);
                    });
                });
            }
            else{
                console.log("creating : "+args[0]+ 'connections to: '+args[1]);
                _createConnection(parseInt(args[0]),args[1]);
            }
        }
    },

    nextSocket:{
        doc:'select the next socket. if now select multiple sockets,it will clear the selection and select the first',
        handler:function(readLineInterface,args,next){
            var self = this;//save the this ref
            if(self.selectedSockets.length>1){
                self.selectedSockets=[self.connections[0]];
            }
            else{
                self.cursor = (self.cursor+1)%self.connections.length;
                self.selectedSockets=[self.connections[self.cursor]];
            }
            //todo:id不存在
            next('promptCommand',['socket id:['+ self.selectedSockets[0].id +'] selected.'])
        }
    },

    select:{
        doc:'select some sockets. \n [select <startIndexBaseZero> <count>.  exp:select 0 100]',
        handler:function(readLineInterface,args,next){
            var self = this;//save the this ref
            //检查参数
            if(args.length===1&&args[0]==='all'){
                self.selectedSockets = self.connections;
                next('promptCommand',[self.selectedSockets.length+'/'+self.connections.length+' sockets selected.'])
            }
            else if(args.length<2){
                console.log('now selected: %s/%s sockets',self.selectedSockets.length,self.connections.length);
                next('promptCommand',['need 2 params:(select <startIndexBaseZero> <count>)'])
            }
            else{
                self.selectedSockets = self.connections.slice(args[0],args[1]);
                next('promptCommand',[self.selectedSockets.length+'/'+self.connections.length+' sockets selected.'])
            }
        }
    },
    disconnect:{
        doc:'force current selected sockets to disconnect from server.',
        handler:function(readLineInterface,args,next){
            var self = this;//save the this ref

            if(self.selectedSockets.length>0){
                for(var i=self.selectedSockets.length-1;i>=0;i--){
                    var sock = self.selectedSockets[i];
                    sock.disconnect();
//                    self.selectedSockets
                }
                setTimeout(next('promptCommand'),2000);
            }
            else{
                next('promptCommand',['you should select sockets first!'])
            }
        }
    },
    send:{
        doc:'send message to server. \n [send <subject> <jsonData> ]',
        handler:function(readLineInterface,args,next){
            console.log('send: %s ',args);
            //console.log('subject: %s ',args[0]);
            //console.log('data: %s ',args[1]);
//            console.log('data1: %s ',eval(args[1]));
            console.log('data2: %s ',JSON.parse(args[1]));
            var self = this;//save the this ref
            //检查参数
            if(args.length<2){
                next('promptCommand',['need 2 params:(send <subject> <jsonData> )'])
            }
            else{
                var subject = args[0],
                    data = JSON.parse(args[1]);
//                    data = eval(args[1]);

                for(var i=0,j=self.selectedSockets.length;i<j;i++){
                    var sock = self.selectedSockets[i];
                    sock.emit(subject,data);
                }
                next('promptCommand');
            }
        }
    }
}

exports.addRoute = function(routeName,handler){
    if(exports.route.hasOwnProperty(routeName)){
        throw new Error('route: '+routeName +" has existed!")
    }
    else{
        exports.route[routeName] = handler;
    }
};