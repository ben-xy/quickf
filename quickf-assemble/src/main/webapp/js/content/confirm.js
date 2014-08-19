/**
 * @fileoverview tab组件，支持click, hover事件
 * @author yangle | yorsal.coms
 * @created 2012-05-09
 * @updated 2012-05-09
 */

define(function(require, exports, module) {

	require('../comp/init.js');
	require('../Y-all/Y-script/Y-countdown.js');
	require('../Y-all/Y-script/Y-tip.js');
	require('../Y-all/Y-script/Y-msg.js');

	function countdown() {
		$('#verifyCode').parent().Y('Countdown', {
			beControl : '#btn_getCode',
			css : 'btn_d fn-right',
			key : 'countdown',
			message: '{0}秒'
		});
	}
	countdown();
	$('#btn_getCode').click(function() {
		countdown();
		$.ajax({
			url : '/cashier/getVerifyCode.html',
			dataType : 'json',
			data : {
				tradeNo : $('input[name=tradeNo]').val(),
				mobileNo : $('input[name=mobileNo]').val()
			},
			success : function(res) {
				if (res.code == 1) {

				} else {
					Y.getCmp('countdown').close();
				}
			},
			error : function() {
				Y.getCmp('countdown').close();
			}
		});
	});

	$('b.cb').click(function() {
		if ($(this).hasClass('cur-cb')) {
			$(this).removeClass('cur-cb');
			$('.fn-passwordP,.safe-pw').hide();
			$('#payPassword').hide();
			$('input[name=isBind]').val('0');
		} else {
			$(this).addClass('cur-cb');
			$('.fn-passwordP,.safe-pw').show();
			$('#payPassword').show();
			$('input[name=isBind]').val('1');
		}
	}).triggerHandler('click');

	$('form').submit( function() {
		if (!valid())
			return false;
		$(this).ajaxSubmit(
			{
				dataType : 'json',
				success : function(res) {
					var tradeNo = $('input[name=tradeNo]').val();
					if (res.result == 1) {
						inerval(function(status,message) {
							if (status == 'TRADE_FINISHED') {
								window.location.href = "/cashier/payResult.html?result=2&tradeNo="
										+ tradeNo;
							} else if (status == "QUERY_FAIL"
									|| status == "TRADE_PAY_FAIL"
									|| status == "DEDUCT_FAIL"
									|| status == "WAIT_DEPOSIT_BACK_NOTIFY"
									|| status == "DEPOSIT_BACK_SUCCESS"
									|| status == "DEPOSIT_BACK_FAIL") {
								window.location.href = "/cashier/payResult.html?result=0&tradeNo="
										+ tradeNo;
							} else {
								window.location.href = "/cashier/payResult.html?result=1&tradeNo="
										+ tradeNo;
							}
						});
					} else {
						Y.getCmp('waitWnd').close();
						Y.getCmp('waitWnd').on('close',function(){
							alert(res.message);
						});
					}
				}
			});
		$('body').Y('Window',{
			content : "#waitImage",
			key : 'waitWnd',
			simple : true,
			modal: true,
			overStyle:{
				opacity:0,
	            background:'none'
			}
		});
//		$(window).trigger('scroll');
			return false;
		});

	function inerval(callback) {
		var num = 10;
		var timer = setInterval(function() {
			num--;
			if (num <= 0) {
				clearInterval(timer);
				callback();
			}
			$.ajax({
				url : '/cashier/queryTradeStatus.html',
				dataType : 'json',
				data : {
					tradeNo : $('input[name=tradeNo]').val()
				},
				success : function(res) {
					if (res.status == "TRADE_FINISHED"
							|| res.status == "QUERY_FAIL"
							|| res.status == 'TRADE_PAY_FAIL'
							|| res.status == "DEDUCT_FAIL"
							|| res.status == "WAIT_DEPOSIT_BACK_NOTIFY"
							|| res.status == "DEPOSIT_BACK_SUCCESS"
							|| res.status == "DEPOSIT_BACK_FAIL") {
						callback(res.status, res.message);
						clearInterval(timer);
					}
				}
			});
		}, 5000);
	}
	
	function valid() {
		if (!$('#verifyCode').val()) {
			alert('效验码不能为空');
			return false;
		}
		if ($('b.cb').hasClass('cur-cb') && !$('#payPassword').val()) {
			alert('支付密码不能为空');
			return false;
		}else if($('b.cb').hasClass('cur-cb') && $('#payPassword').val().length < 6){
			alert('支付密码至少6位');
			return false;
		}
		return true;
	}
	$('input[name=verifyCode]').val('');
	$('input[name=payPassword]').val('');
});