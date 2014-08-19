<%--
  Created by IntelliJ IDEA.
  User: xy
  Date: 14-8-1
  Time: 15:23
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>创建订单</title>
    <%@ include file="/common/include.jsp"%>
</head>
<body>
<div class="top">
    <a href="javascript:;" onclick="history.back(-1)" class="return"></a>
    <h1>Quickf</h1>
</div>

<div class="order-info fn-clear">
    <%--<p class="od-num">${tradeName}-订单号:${tdNo}</p>--%>
    <%--<span class="od-price fn-left">${tradeAmount}元</span>--%>
    <%--<c:if test="${swapCurrency == 'USD' }">--%>
        <%--<span class="od-rate fn-right">$&nbsp;${swapAmount}&nbsp;&nbsp;汇率：${rate}</span>--%>
    <%--</c:if>--%>
    <%--<c:if test="${swapCurrency == 'JPY' }">--%>
        <%--<span class="od-rate fn-right">日元&nbsp;${swapAmount}&nbsp;&nbsp;汇率：${rate}</span>--%>
    <%--</c:if>--%>
    <%--<c:if test="${swapCurrency == 'KRW' }">--%>
        <%--<span class="od-rate fn-right">韩元&nbsp;${swapAmount}&nbsp;&nbsp;汇率：${rate}</span>--%>
    <%--</c:if>--%>
    <%--<c:if test="${swapCurrency == 'GBP' }">--%>
        <%--<span class="od-rate fn-right">英镑&nbsp;${swapAmount}&nbsp;&nbsp;汇率：${rate}</span>--%>
    <%--</c:if>--%>
    <%--<c:if test="${swapCurrency == 'EUR' }">--%>
        <%--<span class="od-rate fn-right">欧元&nbsp;${swapAmount}&nbsp;&nbsp;汇率：${rate}</span>--%>
    <%--</c:if>--%>
</div>
<div class="p-form p-info">
    <form action="/quickf/createOrder.html" onSubmit="return onSubmit();"
          method="POST">
        <p>
            <input type="text" id="mobile" name="mobile" placeholder="手机号"
                   class="inp">
        </p>
        <%--<h4>付款银行卡的开户姓名</h4>--%>
        <p>
            <input type="text" id="type" name="type" placeholder="购买类型"
                   class="inp">
        </p>
        <p>
            <button class="btn_sub" type="submit">下一步</button>
        </p>
        <p></p>
    </form>
</div>
</body>


<script type="text/javascript">
	function onSubmit() {
		if (!$('#type').val()) {
			alert('类型不能为空');
			return false;
		}

		if($('#mobile').val().length != 11 && $('#mobile').val().length != 13){
			alert('手机号码位数不对');
			return false;
		}else if(isNaN($('#mobileNo').val())){
			alert('手机号码只能为数字');
			return false;
		}
		return true;
	}
</script>

<script type="text/javascript" src="/js/lib/jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="/js/lib/sea.js"></script>
<script>
var browser={
    versions:function(){
       var u = navigator.userAgent, app = navigator.appVersion;
       return {//移动终端浏览器版本信息
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) //ios终端
        };
     }(),
}

$(function(){
	if(browser.versions.ios){
		$('input').focus(function(){
			$('.top').css({
				position:'absolute'
			});
		}).blur(function(){
			$('.top').css({
				position:'fixed'
			});
		});
		$('input').get(0).onmouseup = function(e){
			var event = e || window.event;
			event.preventDefault();
		}
	}
});
</script>
<script type="text/javascript">
	seajs.use($_GLOBAL.mode + "demo");
</script>
</html>
