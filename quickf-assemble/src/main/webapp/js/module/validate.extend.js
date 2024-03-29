

/**
 * jquery Validator 验证方法扩展
 * @author: yangle@yiji.com | yorsal.com
 * @method
   defaultMessage: 改变消息title为message
 
 * @method
   requiredInput:
   requiredSelect:
   requiredRadio:
   requiredCheckbox:
   floatNum： 
   ip：验证IP地址
   customRmote： 添加customSucess和customError回调函数
   mustNo：不能输入...
   mustNotInclude:不包含,
   mustYes：必须输入...
   notAllNum:
   notAllSame:
   notequalTo:
   isMobile: 是否是手机
   isPhone: 是否是座机
   isPhoneOrMobile: 是否是手机或座机
   checkID：验证身份证
   checkZh：验证汉字
   checkAZ09: 验证数字和字母的组合
   pic:	
   doc:
 * 
 */
define(function(require) {

if (jQuery.validator) {
	
	//中文汉化
	
	jQuery.extend(jQuery.validator.messages, {
		required: $.validator.format("请输入{0}"),
		email: $.validator.format("请输入正确的{0}"),
		url: $.validator.format("请输入正确的{0}"),
		maxlength: $.validator.format("请输入不多于{0}个字符"),
		minlength: $.validator.format("请输入不少于{0}个字符"),
		max: $.validator.format("请输入不超过{0}个字符"),
		min: $.validator.format("请输入不小于{0}个字符"),
		equalTo: $.validator.format("请输入相同的{0}"),
		range: $.validator.format("请输入范围从{0}到{1}之间个字符"),
		date: $.validator.format("请输入正确的{0}"),
		number: $.validator.format("请输入正确的{0}"),
		digits: $.validator.format("请输入正确的{0}"),
        checkTWID: $.validator.format("请输入正确的{0}"),
        checkCname:$.validator.format("请输入正确的姓名"),
        mobileOrEmail:$.validator.format("请输入正确的{0}")
		
	});
	
	
	/*****************************************************
	 * Step1: 重载一些内部方法
	 */
	jQuery.extend(jQuery.validator.prototype, {
		defaultMessage: function( element, method) {

			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customMetaMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				
				!this.settings.ignoreTitle && $(element).attr('data-message') || undefined,
	
				$.validator.messages[method],
			
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},
		
		formatAndAdd: function( element, rule, message ) {
			if (!message){
				var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
				if ( typeof message == "function" ) {
					message = message.call(this, rule.parameters, element);
				} else if (theregex.test(message)) {
					message = jQuery.format(message.replace(theregex, '{$1}'), rule.parameters);
				}
			}
			
			
			this.errorList.push({
				message: message,
				element: element
			});

			this.errorMap[element.name] = message;
			this.submitted[element.name] = message;
		},
		
		check: function( element ) {
			element = this.validationTargetFor( this.clean( element ) );

			var rules = $(element).rules();
			var dependencyMismatch = false;
			for (var method in rules ) {
				var rule = { method: method, parameters: rules[method] };
				try {
					var result = $.validator.methods[method].call( this, element.value.replace(/\r/g, ""), element, rule.parameters );
				
					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result == "dependency-mismatch" ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result == "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor(element) );
						return;
					}

					if( !result ) {
						
						var message;
						if ($(element).attr('data-multi-message')){
							var j = eval('(' + $(element).attr('data-multi-message') + ')');
							for(s in j){
								if (s === rule.method){
									message = j[s];
								}
							}
						}
						
						this.formatAndAdd( element, rule, message );

						return false;
					}
				} catch(e) {
					this.settings.debug && window.console && console.log("exception occured when checking element " + element.id
						 + ", check the '" + rule.method + "' method", e);
					throw e;
				}
			}
			if (dependencyMismatch)
				return;
			if ( this.objectLength(rules) )
				this.successList.push(element);
			return true;
		}
	});
	
	/*****************************************************
	 * Step2: 添加方法
	 */
	//重载EMAIL，支持中文验证
	jQuery.validator.addMethod('email', function(value, element) {
		return this.optional(element) || (/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value) && !/[^\x00-\xff]/.test(value));
	}, $.validator.format("{0}格式不正确"));	
	
	//requiredInput
	jQuery.validator.addMethod('requiredInput', function(value, element, param) {
		return $.trim(value).length > 0;  
	}, $.validator.format("请输入{0}"));
	
	//requiredSelect
	jQuery.validator.addMethod('requiredSelect', function(value, element, param) {
		var val = $(element).val();
		return val && val.length > 0;  
	}, $.validator.format("请选择{0}"));
	
	//requiredRadio
	jQuery.validator.addMethod('requiredRadio', function(value, element, param) {
		var name = element.name;
		return $('input[name='+ name +']', $(element).parents('form')).filter(':checked').length > 0;
	}, $.validator.format("请选择{0}"));
	
	//requiredCheckbox
	jQuery.validator.addMethod('requiredCheckbox', function(value, element, param) {
		return $(element).filter(':checked').length > 0;
	}, $.validator.format("请选择{0}"));
	 
	//变量验证
	jQuery.validator.addMethod('variable', function(value, element, param) {
		return this.optional(element) || /^[_a-zA-Z0-9]*$/.test(value);    
	}, $.validator.format("请输入{0}"));
	
	//自定义小数
	jQuery.validator.addMethod('floatNum', function(value, element, param) {
		
			var len1 = "8";
			if($(element).attr("integerLen")) len1 = $(element).attr("integerLen");
			len1 = len1 - 1;
			
			var len2 = "2";
			if($(element).attr("decimalLen")) len2 = $(element).attr("decimalLen");
			
			var floatNum = eval("/^(([1-9][0-9]{0," + len1 + "})|0)(\\.[0-9]{1," + len2 + "})?$/"); 

			return this.optional(element) || floatNum.test(value);
	}, $.validator.format("请输入正确的{0}"));
	
	//ip验证
	jQuery.validator.addMethod('ip', function(value, element, param) {
		var ip = /^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$/; 
		return this.optional(element) || (ip.test(value));    
	}, $.validator.format("请输入{0}"));
	
	//自定义远程接口调用customRemote
	jQuery.validator.addMethod('customRemote', function(value, element, param) {
		if ( this.optional(element) )
				return "dependency-mismatch";

			var previous = this.previousValue(element);
			if (!this.settings.messages[element.name] )
				this.settings.messages[element.name] = {};
			previous.originalMessage = this.settings.messages[element.name].remote;
			this.settings.messages[element.name].remote = previous.message;

			param = typeof param == "string" && {url:param} || param;

			if ( this.pending[element.name] ) {
				return "pending";
			}
			if ( previous.old === value ) {
				return previous.valid;
			}

			previous.old = value;
			var validator = this;
			this.startRequest(element);
			var data = {};
			data[element.name] = value;
			//$(element).after('<div class="loading"></div>');
			$.ajax($.extend(true, {
				url: param,
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				success: function(response) {
					//$(element).parent().find('.loading').remove();
					validator.settings.messages[element.name].remote = previous.originalMessage;
					var code = response.code, valid;
					if ( code == "1" ) {
						valid = true;
						
						var submitted = validator.formSubmitted;
						validator.prepareElement(element);
						validator.formSubmitted = submitted;
						validator.successList.push(element);
						validator.showErrors();
						
						if (param.customSuccess){
							param.customSuccess(element, response.data,response);	
						}
						
						
					} else {
						valid = false;
						var errors = {};
						var message = valid || validator.defaultMessage( element, "remote" );
						errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
						
						
						if (param.customError){
							var value;
							if (value = param.customError(element, response)){
								errors[element.name] = value;
								previous.message = value;
								validator.settings.messages[element.name].customRemote = value;
							}
								
						}
						validator.showErrors(errors);
						
					}
					previous.valid = valid;
					validator.stopRequest(element, valid);
					
				},
				error: function(){
					//$(element).parent().find('.loading').remove();
				}
			}, param));
			return "pending";
		
	}, $.validator.format("请输入{0}"));
		
	
	//mustNo
	jQuery.validator.addMethod('mustNo', function(value, element, param) {      
		return this.optional(element) || value !== param;     
	}, $.validator.format("不允许输入{0}"));
	
	//mustNotInclude
	jQuery.validator.addMethod('mustNotInclude', function(value, element, param) {
		return value.indexOf(param) === -1;     
	}, $.validator.format("不允许包含{0}"));
	
	//mustYes
	jQuery.validator.addMethod('mustYes', function(value, element, param) {      
		return this.optional(element) || value === param;     
	}, $.validator.format("必须输入{0}"));
	
	//notAllNum
	jQuery.validator.addMethod('notAllNum', function(value, element, param) {  
		var regEx = /^[0-9]+$/
		return this.optional(element) || !regEx.test(value);     
	}, $.validator.format("不能全为数字"));
	
	//notAllSame
	jQuery.validator.addMethod('notAllSame', function(value, element, param) {  
		var flag;
		for (var i = 0; i < value.length - 1; i++){
			if (value.charAt(i) === value.charAt(i + 1)) {
				flag = false;
			}
			else {
				flag = true; 
				break;
			}
		}
		return this.optional(element) || flag;     
	}, $.validator.format("不能全相同"));
	
	//notequalTo
	jQuery.validator.addMethod('notequalTo', function(value, element, param) {   
		return this.optional(element) || value !== $(param).val();     
	}, $.validator.format("不相同"));
	
	//validate cellphone
	jQuery.validator.addMethod('isMobile', function(value, element, param) {       
		var length = value.length;   
		var mobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(14[0-9]{1}))+\d{8})$/;   
		return this.optional(element) || (length == 11 && mobile.test(value));       
	}, $.validator.format("请输入{0}"));
	
	jQuery.validator.addMethod('mobileOrEmail', function(value, element, param) {       
		var phone = /^((((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(14[0-9]{1}))+\d{8}))|(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@[a-z0-9_-]{2,}(\.[a-z0-9_-]{2,})*\.(com|org|net|mil|edu)(\.cn)?)$/;   
		return this.optional(element) || phone.test(value);       
	}, $.validator.format("请输入{0}"));
	//validate phonenumber
	jQuery.validator.addMethod('isPhone', function(value, element, param) {       
		var phone = /^0\d{2,4}-?\d{8}$/;   
		return this.optional(element) || phone.test(value);       
	}, $.validator.format("请输入{0}"));
	
	//validate phone
	jQuery.validator.addMethod('isPhoneOrMobile', function(value, element, param) {       
		var phone = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(14[0-9]{1}))+\d{8})|(0\d{2,4}-?\d{8})$/;   
		return this.optional(element) || phone.test(value);       
	}, $.validator.format("请输入{0}"));
	
	//validate ID
	jQuery.validator.addMethod('checkID', function(value, element, param) {       
		//var id = /^\d{15}$|^\d{18}$|^\d{17}[xX]$/;
		
		function checkIdcard(idcard) {
			var Errors = new Array("验证通过!", "身份证号码位数不对!", "身份证号码出生日期超出范围或含有非法字符!", "身份证号码校验错误!", "身份证地区非法!");
			var area = {
				11: "北京",
				12: "天津",
				13: "河北",
				14: "山西",
				15: "内蒙古",
				21: "辽宁",
				22: "吉林",
				23: "黑龙江",
				31: "上海",
				32: "江苏",
				33: "浙江",
				34: "安徽",
				35: "福建",
				36: "江西",
				37: "山东",
				41: "河南",
				42: "湖北",
				43: "湖南",
				44: "广东",
				45: "广西",
				46: "海南",
				50: "重庆",
				51: "四川",
				52: "贵州",
				53: "云南",
				54: "西藏",
				61: "陕西",
				62: "甘肃",
				63: "青海",
				64: "宁夏",
				65: "新疆",
				71: "台湾",
				81: "香港",
				82: "澳门",
				91: "国外"
			}
			var retflag = false;
			var idcard, Y, JYM;
			var S, M;
			var idcard_array = new Array();
			idcard_array = idcard.split("");
			//地区检验
			if (area[parseInt(idcard.substr(0, 2))] == null) return Errors[4];
			//身份号码位数及格式检验
			switch (idcard.length) {
			case 15:
				if ((parseInt(idcard.substr(6, 2)) + 1900) % 4 == 0 || ((parseInt(idcard.substr(6, 2)) + 1900) % 100 == 0 && (parseInt(idcard.substr(6, 2)) + 1900) % 4 == 0)) {
					ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/; //测试出生日期的合法性
				} else {
					ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/; //测试出生日期的合法性
				}

				if (ereg.test(idcard)){
					
					return Errors[0];
				} 
				else {
					return Errors[2];
				}
				break;
			case 18:
				//18位身份号码检测
				//出生日期的合法性检查 
				//闰年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))
				//平年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))
				if (parseInt(idcard.substr(6, 4)) % 4 == 0 || (parseInt(idcard.substr(6, 4)) % 100 == 0 && parseInt(idcard.substr(6, 4)) % 4 == 0)) {
					ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/; //闰年出生日期的合法性正则表达式
				} else {
					ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/; //平年出生日期的合法性正则表达式
				}
				if (ereg.test(idcard)) { //测试出生日期的合法性
					//计算校验位
					S = (parseInt(idcard_array[0]) + parseInt(idcard_array[10])) * 7 + (parseInt(idcard_array[1]) + parseInt(idcard_array[11])) * 9 + (parseInt(idcard_array[2]) + parseInt(idcard_array[12])) * 10 + (parseInt(idcard_array[3]) + parseInt(idcard_array[13])) * 5 + (parseInt(idcard_array[4]) + parseInt(idcard_array[14])) * 8 + (parseInt(idcard_array[5]) + parseInt(idcard_array[15])) * 4 + (parseInt(idcard_array[6]) + parseInt(idcard_array[16])) * 2 + parseInt(idcard_array[7]) * 1 + parseInt(idcard_array[8]) * 6 + parseInt(idcard_array[9]) * 3;
					Y = S % 11;

					M = "F";

					JYM = "10X98765432";
					M = JYM.substr(Y, 1); //判断校验位
					if (M == idcard_array[17]) return Errors[0]; //检测ID的校验位
					else return Errors[3];
				} else return Errors[2];
				break;
			default:
				return Errors[1];
				break;
			}
		}
		
		return this.optional(element) || (checkIdcard(value) === '验证通过!');  
		
	}, $.validator.format("请输入{0}"));
	//checkTWID
	jQuery.validator.addMethod('checkTWID', function(value, element, param) {       
		var result = (function IsIdentity(cardNumber){
		    if(!cardNumber || typeof cardNumber != 'string' || cardNumber.length != 10) {
			    return false;
			}
			if(!(/^[A-Z]{1}[\d]{9}$/).test(cardNumber)) {
			    return false;
			}
			var numArr = [];
			
			var cardNumberArr = cardNumber.split('');
			for(var i = 1;i< cardNumberArr.length;i++) {
			    var num = parseInt(cardNumberArr[i]);
				if(isNaN(num)) {
				    return false;
				}
				numArr.push(num);
			}
			var dictionaries = {
			    A:10,B:11,C:12,D:13,E:14,F:15,G:16,H:17,I:34,J:18,K:19,L:20,M:21,N:22,
			    O:35,P:23,Q:24,R:25,S:26,T:27,U:28,V:29,W:30,X:31,Y:32,Z:33
			};
			var first = cardNumberArr[0];
			if(!first) {
			    return false;
			}
			var XX =(''+dictionaries[''+first]).split('');
			if(XX.length<2) {
			    return false;
			}
			var X1 = parseInt(XX[0]),X2 = parseInt(XX[1]);
			var Y = X1 + 9*X2;
			for(var i = 0;i < numArr.length-1;i++) {
			    Y += (8-i)*numArr[i];
			}
			var checkNum = 10 - (Y%10);
			var last = numArr[numArr.length-1];
			if( last !== checkNum ) {
			    return false;
			}
			return true;
	})(value);

		return this.optional(element) || result;       
	}, $.validator.format("请输入{0}"));
	
	jQuery.validator.addMethod('checkXGID', function(value, element, param) {  
		var result = (function IsXGIdentity(cardNumber){
			if(!cardNumber || typeof cardNumber != 'string') {
				return false;
			}
			cardNumber = cardNumber.replace(/^\s+/,"").replace(/\s+$/,"");
		    if(cardNumber.length > 11 || cardNumber.length < 10) {
			    return false;
			}
			if(cardNumber.length == 10) cardNumber = " "+cardNumber;
			if(!(/^([A-Z]|\s){1}[A-Z][\d]{6}\([0-9]|A\)$/).test(cardNumber)) {
			    return false;
			}
			var numArr = [];
			var numStr = cardNumber.replace('(','').replace(')','');
			numStrArr = numStr.split('');
			cardNumberArr = cardNumber.split('');
			for(var i = 2;i< numStrArr.length;i++) {
			    var str = numStrArr[i];
			    var num = parseInt(numStrArr[i]);
			    if(i === numStrArr.length-1 && str == 'A') {
			        num = '10';
			    }
				if(isNaN(num)) {
				    return false;
				}
				numArr.push(num);
			}
			var dictionaries = {
			    'space':58,
			    A:10,B:11,C:12,D:13,E:14,F:15,G:16,H:17,I:18,J:19,K:20,L:21,M:22,N:23,
			    O:24,P:25,Q:26,R:27,S:28,T:29,U:30,V:31,W:32,X:33,Y:34,Z:35
			};
			var first = cardNumberArr[0],second = cardNumberArr[1];
			
			first = first == ' '?'space':first;
			if(!first || !second) {
			    return false;
			}
			var X1 = dictionaries[first],X2 = dictionaries[second];
			var Y = 9*X1 + 8*X2;
			if(isNaN(Y)) {
			    return false;
			}
			for(var i = 0;i < numArr.length;i++) {
			    Y += (7-i)*numArr[i];
			}
			var checkNum = Y%11;
			if(checkNum) {
			    return false;
			}
			return true;
		})(value);

		return this.optional(element) || result;       
	}, $.validator.format("请输入正确的身份证编号"));
	
	//validate CHINESE
	jQuery.validator.addMethod('checkZh', function(value, element, param) {       
		var id = /^[\u4e00-\u9fa5]+$/;
		return this.optional(element) || id.test(value);       
	}, $.validator.format("请输入{0}"));
	
	//validate uname
	jQuery.validator.addMethod('checkUname', function(value, element, param) {       
		var id = /^([\u4e00-\u9fa5]|[A-Z])+$/;
		return this.optional(element) || id.test(value);       
	}, $.validator.format("请输入汉字或英文大写字母"));
	
	//validate checkCname
	jQuery.validator.addMethod('checkCname', function(value, element, param) {       
		var id = /^([\u4e00-\u9fa5]|[A-Z]|[a-z]|'|\.|\s)+$/;
		return this.optional(element) || id.test(value);       
	}, $.validator.format("请输入汉字或英文大小写字母"));
	
	jQuery.validator.addMethod('checkZhorNum', function(value, element, param) {       
		var id = /^([A-Z]|[0-9]){8}$/;
		return this.optional(element) || id.test(value);       
	}, $.validator.format("请输入数字或大写字母，位数不足8位首位用0补充"));
	
	//validate checkZhNum
	jQuery.validator.addMethod('checkZhNum', function(value, element, param) {       
		var id = /^([\u4e00-\u9fa5]|[0-9])+$/;
		return this.optional(element) || id.test(value);       
	}, $.validator.format("请输入汉字或数字"));
	
	//validate checkAZ09
	jQuery.validator.addMethod('checkAZ09', function(value, element, param) {       
		var id = /^[a-zA-Z0-9]+$/;
		return this.optional(element) || id.test(value);       
	}, $.validator.format("请输入{0}"));
	
	//图片格式验证
	jQuery.validator.addMethod('pic', function(value, element, param) {       
		var pic = /.(gif|jpg|png)$/i;    
		return this.optional(element) || (pic.test(value));    
	}, $.validator.format("请选择正确的{0}格式文件，正确的格式为：gif、jpg、png"));
	
	jQuery.validator.addMethod('doc', function(value, element, param) {       

		var doc = /.(doc|ppt|xls|txt)$/i;    
		return this.optional(element) || (doc.test(value));    
	}, $.validator.format("请选择正确的{0}格式文件，正确的格式为：doc、ppt、xls、txt"));
	
	
	/*****************************************************
	 * Step3: 导入方法到class中
	 */
	jQuery.extend(jQuery.validator.classRuleSettings, {
		
	    requiredInput:{requiredInput:true},
	    requiredSelect:{requiredSelect:true},
	    requiredRadio:{requiredRadio:true},
	    requiredCheckbox:{requiredCheckbox:true},
		variable:{variable:true},
		floatNum:{floatNum:true},
		ip:{ip:true},
		//customRmote
		mustNo:{mustNo:true},
		mustNotInclude:{mustNotInclude:true},
		mustYes:{mustYes:true},
		notAllNum:{notAllNum:true},
		notAllSame:{notAllSame:true},
		notequalTo:{notequalTo:true},
		isMobile:{isMobile:true},
		isPhone:{isPhone:true},
	    isPhoneOrMobile:{isPhoneOrMobile:true},
	    checkID:{checkID:true},
	    checkTWID:{checkTWID:true},
	    checkZh:{checkZh:true},
		checkUname:{checkUname:true},
		checkCname:{checkCname:true},
		checkZhNum:{checkZhNum:true},
	    checkAZ09:{checkAZ09:true},
		pic:{pic:true},
	    doc:{doc:true},
	    mobileOrEmail:{mobileOrEmail:true}

	});
	
	
}

});