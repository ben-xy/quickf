
(function($){

define(function(){

	Y.inherit('Countdown','box',{
		doInit: function(cfg){
			if(cfg.beControl) {
			    var beControl = this.toJqObj(cfg.beControl);
				this.beControl = beControl;
			}
			cfg.el = "span";
			if(!cfg.renderTo) cfg.renderTo = cfg.target;
			this.time = this.cfg.time;
			this.callBase('doInit','box',cfg);
			var main = $('<span>');
			this.el.append(main);
			this.main = main;
			this.on('close',function(){
			    if(this.beControl) {
			        this.beControl.show();
			    }
			});
		},
		setTime: function(number){
		    if(typeof number == 'number' || typeof number == 'string'){
			    this.time = number;
				var timeStr= ''+this.time;
			    if(timeStr.length == 1) {
			    	timeStr = "0" + timeStr;
			    }
				this.main.find('b').html(timeStr);
			}
		    return this.time;
		},
		startTimer: function(){
		    var _this = this;
			var content = this.main;
			var cfg = this.cfg;
			var str = cfg.message;
			this.setMessage(str);
			this.setTime(cfg.time);
			if(this.timer) {
			    clearInterval(this.timer);
			}
		    var timer = setInterval(function(){
			    var time = _this.time;
		        time -= cfg.space;
			    if(time < 0) {
				    time = 0;
		        }
			    _this.setTime(time);
				if(time <= 0) {
					_this.timeover();
				}
		    },cfg.space*1000);
			this.timer = timer;
		},
		timeover:function(){
		    this.fire('timeover');
			this.doTimeover();
		},
		doTimeover: function(){
		    var timer = this.timer;
		    if(this.cfg.autoDisappear) {
				if(this.beControl) {
				    this.beControl.show();
			    }
				this.close(0);
			}
			if(timer) clearInterval(timer);
		},
		setMessage:function(msg){
		    var cfg = this.cfg;
			var str = msg.replace(/\{0\}/g,"<b class="+cfg.numberCss+" style='width:30px;'>" + this.time + "</b>");
			this.main.html(str);
		},
		doShow :function(){
			this.callBase('doShow','box');
			this.startTimer();
			if(this.beControl){
			    this.beControl.hide();
			}
			if(this.cfg.numberCss) {
			    this.main.find('b').addClass(this.cfg.numberCss);
			}
			this.el.css('display','inline-block');
			this.el.css('display','inline-block');
		},
		doClose:function(speed){
		    this.callBase('doClose','box',speed);
		},
		doDistroy: function(){
		    this.callBase('doDistroy','box');
			if(this.timer) {
			    clearInterval(this.timer);
			}
		}
		
	});
	
	Y.Countdown.defaults = {
		message: '{0}秒之后可重新发送',
		numberCss:'countdown-num',
		autoSize: true,
		time: 60,
		space: 1,
		el: 'span',
		css: 'countdown-countdown',
		autoDisappear:true
	}
	
	
	
});

})($);