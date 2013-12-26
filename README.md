socket.io-client-console
========================

provide a command-line way to handle several connections and send/receive messages from/to socket.io server

<hr/>
##What is this?
这是一个简易的socket.io-client命令行工具，可以很方便的使用交互式命令窗口，创建、管理若干个socket连接，并向服务器发送数据。
<hr/>



##Features
<ul>
 <li>带命令提示.</li>
 <li>支持help方法查询指令的作用.</li>
 <li>可以自己扩展指令，完成更丰富的功能.</li>
 <li>send方法支持发送key,value对。输入的时候以符号:分隔key和value,以符号,分隔2个key.(注意传递的数据中避免出现:和,号)</li>
 <li>给所有参数添加预处理功能，提供一些基础的参数处理机制(使用$...表示执行具体的操作，使用@...表示占位符。程序处理的时候，先处理@的情况，最后再统一使用eval执行参数)，比如：md5加密( $md5($getTime('tick'),@ ))，.</li>
 <li>连接都监听消息并打印</li>
</ul>



##TodoList
<ul>
<li>为占位符提供多种执行机制。@@@表示每个匹配都单独执行。@@表示一个参数内的匹配只执行一次，多个参数内的执行多次。@表示整个语句请求内只执行一次</li>
<li>研究单元测试console输入的方法.</li>
</ul>


##Docs(待补充)


## License

MIT
##End
