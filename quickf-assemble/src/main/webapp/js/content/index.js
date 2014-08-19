/**
 * @fileoverview tab组件，支持click, hover事件
 * @author yangle | yorsal.coms
 * @created  2012-05-09
 * @updated  2012-05-09
 */


define(function(require, exports, module) {
  
    require('../comp/init.js');
  
    $('#bankCardNo').bind('keypress',function(e){
    	var keyCode = e.keyCode || e.witch;
    	if(keyCode < 48 || keyCode > 57) {
    		return false;
    	}
    	return true;
    }).bind('keyup',function(){
    	var val = $(this).val();
    	var str = $(this).val();
    	if(!val) return true;
    	str = str.replace(/\s/g,'');
    	var arr = str.split('');
    	for(var i=0;i<arr.length;i++) {
    		if(i && i % 4 == 0) {
    			arr[i] = " "+arr[i];
    		}
    	}
    	str = arr.join('');
    	if(val != str) $(this).val(str);
        var val = $(this).val();
        if(!val) return;
        val = val.replace(/[^\d\s]/g,'');
        if(val.charAt(val.length-1) == ' ') {
        	var arr = val.split('');
        	arr.pop();
        	val = arr.join('');
        	$(this).val(val);
        } else {
        	$(this).val(val);
        }
    }).bind('paste',function(){
    	var  _this = this;
    	setTimeout(function(){
    		$(_this).triggerHandler('keypress');
    	},1);
    }).css('ime-mode','off');
    
    $('form').submit(function(){
    	var val = $('#bankCardNo').val();
    	$('#bankCardNo').val(val.split(' ').join(''));
    });

  
});