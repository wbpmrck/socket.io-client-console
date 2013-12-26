/**
 * @Created by kaicui.
 * @Date:2013-12-23 20:50
 * @Desc: 支持对用户输入的参数进行预处理，来实现更加复杂的功能
 * @Change History:
 * 2013-12-24：
 * a)增加function:$md5
 * b)增加占位符:@unixTimeTick
 --------------------------------------------
 @created：|kaicui| 2013-12-23 20:50.
 --------------------------------------------
 */

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
//$开始的字符称为操作符，将会被进行指定的计算
var processors={
    $md5:function(content){
        return require('md5').md5Encode(content);
    }
};
//@开始的字符称为占位符，将会被运算并且替换为一个其他字符
var placeHolders={
    //unix时间戳。从1970.1.1到现在的毫秒数
    unixTimeTick:function(){
        return Date.now()
    }

}
for(var p in processors){
    var fd = ['var ',p,' = ',processors[p].toString()].join('');
    console.log('loading processors: %s ,[%s]',p,fd);
    eval(fd);
}

/*
 todo:exports
 */
exports.process = function(passParam){
    var param;
    try{
        //只有::开头的参数，需要进行eval,并且eval的时候自动忽略::
        var needEval = (passParam.length>2&&passParam[0]==':'&&passParam[1]==':');

        param = needEval?passParam.slice(2):passParam;

//        console.log('needEval %s ,param is %s',needEval,param);

        //处理一个占位符（多次指定一个占位符也只会执行一次全局替换）
        function _processOneHolder(param,holderName){
            var replaceString = placeHolders[holderName]().toString();
            return param.replace(new RegExp('@'+holderName,'g'),replaceString);
//        if(param.indexOf(holderName)>=0){
//            return _processOneHolder(param,holderName);
//        }
//        else{
//            return param;
//        }
        }
        //1：先查找占位符，进行替换
        for(var placeholderName in placeHolders){
            if(param.indexOf(placeholderName)>=0){
                param = _processOneHolder(param,placeholderName);
            }
        }

        if(needEval){
            console.log('evaling:%s ',param);
            //2：如果是以::开头的参数：再进行$函数执行
            return eval(param);
        }
        else{
            return param;
        }
    }
    catch(e){
        console.log('error when preprocessing param:%s',getFullErrorInfo(e));
        return param;
    }
}