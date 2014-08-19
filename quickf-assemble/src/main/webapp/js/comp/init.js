/**

 */


define(function(require, exports, module) {
  
	require('../plugins/jquery.jqtransform.js')($);
	require('../plugins/jquery.dateinput.js')($);
	require('../plugins/jquery.form.js')($);
    require('../plugins/jquery.validate.js')($);
	require('../module/validate.extend.js');
	require('../Y-all/Y-script/Y-base.js');
	//require('../content/leftBar.js');  

    var Site = {
		hover: function(obj){
				obj.hover(function(){
					$(this).addClass('hover')
				}, function(){
					$(this).removeClass('hover')
				})
		},
		init: function(){
			
			if ($('.default_form').length){
				$('.default_form').validate({
					errorClass: 'error-tip',
					errorElement: 'b',
					onkeyup: false
					
				});
				
			}
			
			var dateInputs = $('input[type=date]').add('.widget_date');
			if(dateInputs.length) {
				dateInputs.each(function(i,item){
					var dateconfig = {trigger: true, selectors:true};
					dateconfig.yearRange = [-10,15];
					if($(item).attr('yearRange')) {
						dateconfig.yearRange = eval($(item).attr('yearRange')) || [-10,15];
					}
				    $(item).dateinput(dateconfig);
				});
			    //dateInputs.dateinput({trigger: true, selectors:true, yearRange: [-10, 15]});
			}
			
			
			
			var $menu = $('.main-menu > ul > li'),
				$customForm = $('.jqtransform'),
				$button = $('button.button');
			if ($menu.length > 0){
				Site.hover($menu);
			}
			if ($button.length > 0){
				Site.hover($button);
			}
			if ($customForm.length > 0){
				$customForm.jqTransform();
			}
			
		
			if ($(".ul-show").length > 0){
				$(".ul-show").hover(function(){
					$('a', this).addClass("cur");
					$('ul', this).show();
				}, function(){
					$('a', this).removeClass("cur");
					$('ul', this).hide();
				});
				
			}

			if ($('#more-h').length > 0){
				$('#more-h').click(function(){
					$('#more-layer').slideToggle("");
				});
			}
			if ($('#inq').length > 0){
				$('#inq').click(function(){
					$('#inq-layer').toggle();
					if($('#inq').attr('class')=='more-s'){
						$('#inq').attr('class','more-i');
						}
					else{
						$('#inq').attr('class','more-s');
						}
				});

			}
				

			
			
			
		}
	};
    
    /* 只能输入数字 */
	var  maskMoney = $('.mask_money');
	
	maskMoney.css('ime-mode','disabled');
	maskMoney.bind("copy cut paste", function (e) { // 通过空格连续添加复制、剪切、粘贴事件 
		e.preventDefault(); // 阻止事件的默认行为 
		}); 
	
	if (maskMoney.length > 0){
		maskMoney.keypress(function(event){
			var keyCode = event.which, value = $(this).val();
			if (keyCode === 0 || keyCode === 46 || keyCode === 8 || (keyCode >= 48 && keyCode <= 57)){
				if (value.indexOf('.') !== -1){
					if (keyCode === 46){
						return false;
					}
					var _this=this;
					var getCurserIndex = function(){
			            var oTxt1 = _this;
			            var cursurPosition=-1;
			            if(oTxt1.selectionStart){//非IE浏览器
			                cursurPosition= oTxt1.selectionStart;
			            }else{//IE
			            	if(document.selection) {
			                    var range = document.selection.createRange();
			                } else {
			                	return -1;
			                }
			                range.moveStart("character",-oTxt1.value.length);
			                cursurPosition=range.text.length;
			            }
			            return cursurPosition;
			        }
					var cursorIndex = getCurserIndex();
					var content;
					if(document.all)
				    {
						if(document.selection) {
						    content = document.selection.createRange();
	                    } else {
	                    	content = {};
	                    }
				    }
					else
					{
					    content = window.getSelection();
					    content.text = content.toString();
					} 
					var selectStr = content.text;
					if (value.substring(value.indexOf('.') + 1).length > 1 && keyCode !== 8 && cursorIndex>value.indexOf('.') && keyCode!==0 && !selectStr.length){
						return false;
						
					}
				}
				return true;
			}
			else {
				return false;
			}	
		}).focus(function(){
			this.style.imeMode = 'disabled';
		});
	}
	
    
	   var submitBtn = $('form').find('button[type=submit]');
	    if(submitBtn.length) {
	    	submitBtn.click(function(e){
	    		    e = e || event;
	    		    e.stopPropagation();
	    	});
	    	submitBtn.parent().click(function(e){
			    if(submitBtn.attr('disabled')) return;
			    if($(this).hasClass('fn-g-btn') || $(this).hasClass('fn-h-btn')) {
				    var _this = this;
				    setTimeout(function(){
				        $(_this).parents('form').submit();
				    },1);
				}
	    	});
	    }
   
	
  /* hide msg_box */
	var msgBox = $('#msg_box');
	if (msgBox.length > 0){
		$('body').click(function(){
			msgBox.hide();
			$('body').unbind('click');
		})
		
	}
	
	//协议toggle
	var btnLicense = $('#btn_license');
		
	if (btnLicense.length > 0){
		btnLicense.click(function(){
			if ($('.fm-license').is(':hidden')){
				$('.fm-license').show();
			}
			else {
				$('.fm-license').hide();
			}
		});
		$('.fm-license .close').click(function(){
			$('.fm-license').hide();
			return false;
		});
	}
	
	
	Site.init();
	$('input[autocomplete=off]').val('');
	//动态生成初始input输入提示
    var startInput = $('input[startValue]');
		if(startInput.length) {
			startInput.each(function(i,item){				
				var tinput = $(item);
				var info = tinput.attr('startValue');
				var off = tinput.offset();
				var over = $('<div class="start_valueEle" for="'+tinput.attr('name')+'">')
				    .html("<em style='font-size:1.6rem;color: #666;font-family: Microsoft Yahei;'>"+info || '请输入'+"</em>").css({
					position:'absolute',
					zIndex:10,
					left:off.left+20,
					top:off.top+20
				});
				$('body').append(over);
				
				function hideStart(){
					over.hide();
					tinput.get(0).focus();
				}
				function showStart(){
				    var off = tinput.offset();
					over.css({
					   left:off.left+20, top:off.top+20
					}).show();
				}
				if(tinput.val()) {
					hideStart();
				}
				tinput.bind('focus',hideStart);
				over.click(hideStart);
				tinput.blur(function(){
					var val = $(this).val();
					if(!val) {
						showStart();
					}
				});
				tinput.data('startInput',over);
				if($(item).val()) {
					hideStart();
				}
			});
		}
	
	
		
	return Site;
	
  
  
});