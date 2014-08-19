
(function($){

define(function(require, exports, module){
    require('../Y-script/Y-window.js');
    Y.inherit('Tip','Window',{
	    doInit:function(cfg){
			cfg.renderTo = 'body';
		    this.callBase('doInit','Window',cfg);
			if(!cfg.noStyle) this.el.addClass(cfg.css);
			if(!cfg.target){
			    Y.handlerError('Tip类必须配置target');
				return false;
			}
			var target = this.toJqObj(cfg.target);
			this.target = target;
			if(cfg.autoDisappear) {
			    var _this = this;
			    this.bind($(document),'click',function(e){
				    if(e.target != _this.target.get(0) && e.target != _this.el.get(0)) {
					    _this.close();
					}
				});
			}
			this.align = cfg.align;
		},
		setXY:function(){
		    var XY = this.getPosition();
			this.el.css({
			    left: XY.x,
				top: XY.y
			});
		},
		setAlign:function(align){
		    this.align = align;
		},
		getPosition:function(){
		    var cfg = this.cfg;
			var align = this.align;
			var spacing = cfg.spacing || 0;
		    var pos = this.target.offset();
			var info = this.el;
	        var eleLeft = pos.left,eleTop = pos.top,eleWidth = this.target.outerWidth(),eleHeight = this.target.outerHeight();
			var left,top;
	        switch(align) {
		      case 'top': 
			      left = eleLeft,top = eleTop - info.outerHeight() - spacing;
			  break;
			  case 'bottom': 
			      left = eleLeft,top = eleTop + eleHeight + spacing;
			  break;
			  case 'left': 
			      left = eleLeft - info.outerWidth() - spacing,top = eleTop;
			  break;
			  case 'right': 
			      left = eleLeft + eleWidth + spacing,top = eleTop;
			  break;
			  case 'left top': 
			  case 'top left':
			      left = eleLeft - info.outerWidth() - spacing,top = eleTop - info.outerHeight() - spacing;
			  break;
			  case 'right bottom': 
			  case 'bottom right': 
			      left = eleLeft + eleWidth + spacing,top = eleTop + eleHeight + spacing;
			  break;
			  case 'left bottom': 
			  case 'bottom left':
			      left = eleLeft - info.outerWidth() - spacing,top = eleTop + eleHeight + spacing;
			  break;
			  case 'right top': 
			  case 'top right':
			      left = eleLeft + eleWidth + spacing,top = eleTop - info.outerHeight() - spacing;
			  break;
		  }
		  return {x: left,y: top};
		}
    });
	
	Y.inherit('ToolTip','Tip',{
	    doInit: function(cfg){
		    cfg.renderTo = 'body';
		    this.callBase('doInit','Tip',cfg);
			var target = this.target;
			if(!target) {
			   Y.handlerError('ToolTip类必须配置target');
			   return;
			}
			var _this = this;
			var timer;
			this.bind(target, 'mouseenter', function(e){
			    _this.show(cfg.speed);
			});
			this.bind(target, 'mouseleave', function(e){
			    timer = setTimeout(function(){
				    _this.hide(cfg.speed);
				},cfg.delay);
			});
			this.bind(this.el, 'mouseenter',function(e){
			    if(timer) clearTimeout(timer);
			});
			this.bind(this.el, 'mouseout',function(e){
			    _this.hide(cfg.speed);
			});
		}
	});
	
	
	Y.inherit('StartTip','Tip',{//定位的startTip有缺陷 如果页面变动 使input位置改变 但是tip不会触发事件跟着改变
	    doInit: function(cfg){
			cfg.renderTo = 'body';
		    this.callBase('doInit', 'Tip', cfg);
			var target = this.target;
			if(!target) {
			   Y.handlerError('StartTip类必须配置target');
			   return;
			}
			var _this = this;
			this.bind(target, 'focus', function(e){
			    _this.hide(cfg.speed);
			});
			this.bind(target, 'blur', function(e){
			    if($(this).val($.trim($(this).val())).val())return;
				 _this.show(cfg.speed);
			});
			this.bind(this.el, 'click', function(e){
			    _this.hide(cfg.speed);
				target.focus();
			});
			this.doShow(0);
		},
		doShow: function(speed){
		    this.callBase('doShow','Window',speed);
			var cfg = this.cfg;
			if(cfg.showInfo){
			    if(typeof cfg.showInfo == 'function'){
				  	this.el.html(cfg.showInfo.call(this.target));
				}else{
					this.el.html(cfg.showInfo);
				}
			}
			this.rePosition();
			var _this = this;
			setTimeout(function(){_this.target.blur()},5);
		},
		rePosition:function(){
			var XY = this.getPosition();
			if(this.target.val())this.hide(0);
			this.el.css({
				"fontSize":this.target.height(),
				width:'auto',
				height:'auto',
				left: XY.x,
				top: XY.y
			});
			return this;
		},
		getPosition:function(){
			var cfg = this.cfg;
			var padding = cfg.padding;
			var ele = this.target;
			var pos = ele.offset();
		 	return {x:pos.left+padding,y: pos.top+padding};
		}
	});
	Y.inherit('TranslateTip','Tip',{
	    doInit: function(cfg){
		    this.callBase('doInit', 'Tip', cfg);
			var target = this.target;
			if(!target) {
			   Y.handlerError('TranslateTip类必须配置target');
			   return;
			}
			var translateType = cfg.translateType;
			if(typeof translateType == "string"){
				translateType=this[translateType];
			}else if(typeof translateType == 'object'){
				translateType = this[translateType.shift()];
			}
			if(!translateType)translateType = this.fixedTurn;//默认的转换方式
			if(!translateType){
				Y.handlerError('TranslateTip类必须配置有效的translateType');
				return;
			}
			var _this = this;
			this.bind(target, 'keyup', function(e){
				_this.doTranslate(translateType);
			},cfg.bindType);
			this.bind(target, 'focus', function(e){
				_this.doTranslate(translateType);
			},cfg.bindType);
			this.bind(target, 'blur', function(e){
			    _this.hide(cfg.speed);
			},cfg.bindType);
		},
		doTranslate:function(translateType){
			var cfg = this.cfg;
			var val = this.target.val();
			this.target.val(val);
			var html = translateType.call(this,val);
			if(!html)return this.hide(cfg.speed);
			this.el.html(html);
			this.show(cfg.speed,this);
		},
		digitUppercase:function(n){//金额转大写
			var fraction = ['角', '分'];
			var digit = ['零', '壹', '贰', '叁', '肆','伍', '陆', '柒', '捌', '玖'];
			var unit = [['元', '万', '亿'],['', '拾', '佰', '仟']];
			n = parseFloat((n+'').replace(/[^\d\.-]/g, "")) || 0;
			var head = n < 0? '欠': '';
			n = Math.abs(n);
			var s = '';
			for (var i = 0; i < fraction.length; i++) {
				s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
			}
			s = s || '整';
			n = Math.floor(n);
			for (var i = 0; i < unit[0].length && n > 0; i++) {
				var p = '';
				for (var j = 0; j < unit[1].length && n > 0; j++) {
					p = digit[n % 10] + unit[1][j] + p;
					n = Math.floor(n / 10);
				}
				s = p.replace(/(零.)*零$/, '').replace(/^$/, '零')+ unit[0][i] + s;
			}
			return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
		},
		//定制功能
		customMade:function(s){// 4个xxxx 在一块的格式化 为了向前兼容 所留
			var length = this.cfg.length;
			var count = (length + 4) / 4 | 1;
			var str = Array(count + 1).join('xxxx ').slice(0,length + count - 1);
			s = s.replace(/\s/g,'').slice(0,length);
			this.target.val(s);
			this.cfg.fixedString = str;
			return this.getTranslate(s);
		},
		fixedTurn:function(s){//默认的格式化方式
			var length = this.cfg.fixedString.replace(/\s/g,'').length;
			s = s.replace(/\s/g,'').slice(0,length);
			this.target.val(s);
			return this.getTranslate(s);
		},
		getTranslate:function(val){//获取格式化字符串 只替换x字母
			var cfg = this.cfg;
			var index = 0;
			return cfg.fixedString.replace(/./g,function(a){
				if(index >= val.length){
					if(!cfg.showMore)return '';
					else return a;
				}
				if(a != 'x')return a;
				return val.charAt(index++);
			});
		},
		reverse:function(str){//颠倒字符串
			return ('' + str).split('').reverse().join('');
		},
		fmoney:function(s){//数字的格式化 处理 比字符串多个.
			var cfg = this.cfg;
			cfg.fixedString = cfg.fixedString || 'xxx xxx xxx xxx xxx xxx xxx xxx';
			cfg.showMore = false;
			var r = s.split(".")[1];
			s = this.reverse(s.split(".")[0].replace(/\s/g,''));   
			var t = this.getTranslate(s);
			t = this.reverse(t);
			if(r)return t+ "." + r;  
			else return  t;
		},
		doShow: function(speed,_this){
		    this.callBase('doShow','Window',speed);
		    var XY = this.getPosition($(_this));
			this.el.css({
				left: XY.x,
				top: XY.y
			});
		}
	});
	Y.inherit('SearchTip','Tip',{
	    doInit: function(cfg){
		    this.callBase('doInit','Tip',cfg);
		    this.target = $(cfg.target);
		    var target = this.target;
			if(!target) {
			   Y.handlerError('TranslateTip类必须配置target');
			   return;
			}
			var _this = this;
			this.bind(target,'keyup',function(e){
				_this.setItim(this);
			},cfg.bindType);
			this.bind(target,'keydown',function(e){ 
				e = e || event;
				var keyCode = e.keyCode || e.which || e.charCode;
				if(_this.selectEle)_this.selectEle.removeClass(cfg.overCss);
				if(keyCode == 40){
					if(_this.el.html() == '')_this.setItim(target,true);
					_this.hover((_this.selectEle && _this.selectEle.next()[0] && _this.selectEle.next()) || _this.el.find(cfg.item + ":first"));
					_this.setValue(_this.selectEle);
				}else if(keyCode == 38){
					if(_this.el.html() == '')_this.setItim(target,true);
					_this.hover((_this.selectEle && _this.selectEle.prev()[0] && _this.selectEle.prev()) || _this.el.find(cfg.item + ":last"));
					_this.setValue(_this.selectEle);
				}else if(keyCode == 13){
					_this.clear();
					if(!_this.selectEle){
						return;
					}
					_this.select(_this.selectEle[0]);
				}else{
					_this.hover(_this.selectEle);
				}
			},cfg.bindType);
			this.bind(target, 'focus click', function(e){
				isNotBlur = false;
				if(_this.notShow){
					return _this.hide();		
				}
				_this.makeList($.trim($(this).val()));
				_this.show(cfg.speed);
			},cfg.bindType);
			var isNotBlur = false;
			this.bind(target, 'blur', function(e){
				_this.clickSts = false;
				if(isNotBlur)return;
			    _this.hide(cfg.speed);
			},cfg.bindType);
			this.el.append();
			var ul = this.ul = $('<ul>');
			this.el.append(ul);
			ul.addClass(this.cfg.css);
			ul.mousedown(function(){
				isNotBlur = true;
			});
			$(ul).delegate("." + cfg.css + " " + cfg.item , 'mousedown' , function(){
				_this.select(this);
			});
			$(ul).delegate("." + cfg.css + " " + cfg.item , 'mouseover' , function(){
				_this.hover($(this));
			});
			$(ul).delegate("." + cfg.css, 'mouseleave' ,function(){
				_this.selectEle = null;
				_this.notShow = false;
				_this.hide();
			});
		},
		clear:function(){//清空 隐藏
			this.el.html('');
			this.hide(this.cfg.speed);
		},
		setItim:function(ele,sts){//设置子级
			var val = $.trim($(ele).val());
			if(!sts && this.last == val)return this.show(this.cfg.speed);
			this.selectEle = null;
			this.last = val;
			var arr = this.makeList(val);
			if(arr.length)this.show(this.cfg.speed);
			else this.hide(this.cfg.speed);
		},
		hover:function(ele){//覆盖样式处理
			if(!ele)return;
			if(this.selectEle)this.selectEle.removeClass(this.cfg.overCss);
			this.selectEle = ele.addClass(this.cfg.overCss);
		},
		select:function(ele){//选择事件
			this.clickSts = true;
			this.target.val(this.last = ele.data);
			this.hide(this.cfg.speed);
			this.fire('select' , $(this) , this.data);
			this.selectEle = null;
		},
		setValue:function(obj){//给input赋值
			var val = (obj && obj[0] && obj[0].data) || obj;
			this.target.val(this.last = val);
		},
		makeList:function(s){//生成查询的列表
			var cfg = this.cfg;
			var m = Math.abs(cfg.showNumbers);
			var data = cfg.data;
			var fontColor = cfg.fontColor;
			var ul = this.ul.html('');
			var Arr = [];
			for(var i = 0 ; i < data.length ; i++){
				var cell = data[i];
				var index = cell.indexOf(s);
				if(index != -1){
					if(!Arr[index]){
						Arr[index] = [];
					}
					Arr[index].push(cell);
				}
			}
			var count = 0;
			ul.css({
				height:'auto',
				'overflow-y':''
			})
			for(i = 0 ; i < Arr.length ; i++){
				var r = Arr[i];
				if(r){
					for(var j = 0 ; j < r.length ; j++){
						if(s && !m)return Arr;
						cell = r[j];
						var row = cell.split(s);
						var div = $("<li>");
						div.width(this.target.outerWidth()).css('margin','');
						div.addClass(cfg.itemCss);
						div[0].data = cell;
						div.html(row.join('<font style="color:' + fontColor + ';">' + s + '</font>'));
						ul.append(div);
						m--;
						count ++ ;
					}
				}
			}	
			if(count > 10){
				ul.css({
					height:200,
					'overflow-y':'scroll'
				})
			}
			return Arr;
		},
		doShow: function(speed){
			this.el.css('padding',0);
		    this.callBase('doShow', 'Window', speed);
		    var XY = this.getPosition();
			$('body').append(this.el);
			this.el.css({
				left: XY.x,
				top: XY.y
			});
		},
		getPosition: function(){
			var cfg = this.cfg;
			var ele = this.target;
			var pos = ele.offset();
		 	return {x: pos.left,y: pos.top + cfg.spacing + ele[0].offsetHeight};
		}
	});
	
	Y.inherit('RareWordTip','Tip',{
		doInit: function(cfg){
			var contentHtml = '<div class="unfamiliar unfamiliarBox"';
			contentHtml += 'style="width: 400px; border:1px solid #999; background:#fff; padding:5px; z-index: 8; position: absolute; left: 410px; top: 255px;">';
			contentHtml += '<div class="unfamiliar-spells"><a title="a" class="unfamiliar-spell selected" href="javascript:;">a</a>';
			var arr = ['b','c[ch]','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s[sh]','t','u','v','w','x','y'];
			for(var i=0;i<arr.length;i++) {
			    contentHtml += '<a title="'+arr[i]+'" class="unfamiliar-spell" href="javascript:;">'+arr[i]+'</a>';
			}
			contentHtml += '<a title="z" class="unfamiliar-spell" href="#">z[zh]</a></div><div class="unfamiliar-words"><a style="z-index:10;" class="unfamiliar-word" href="#">奡</a>';
			contentHtml += '<a style="z-index:10;" class="unfamiliar-word" href="#">靉</a><a style="z-index:10;" class="unfamiliar-word" href="#">叆</a></div></div>';
			var content = $(contentHtml).hide();
			$.extend(cfg,{
			    content: content,
				renderTo: 'body',
				closeAction: 'hide'
			});
			var input = this.toJqObj(cfg.target);
			var _this = this;
			if(cfg.showEle) {
			    var showBtn = this.toJqObj(cfg.showEle);
				this.bind(showBtn,'click',function(e){
				    _this.show();
					e.stopPropagation();
				});
			}
			this.input = input;
			this.callBase('doInit','Tip',cfg);
		},
		doRender: function(){
		    var state = this.callBase('doRender','Tip');
			var dict = {
			    a:"奡靉叆",c:"旵玚棽琤翀珵楮偲赪瑒篪珹捵茝鷐铖宬査嶒",b:"仌昺竝霦犇愊贲琲礴埗別骉錶",
			    d:"耑昳菂頔遆珰龘俤叇槙璗惇",g:"玍冮芶姏堽粿筦嘏釭",f:"仹汎沨昉璠雰峯洑茀渢棻棻頫",
				e:"峩",h:"郃浛訸嗃瓛翃隺鋐滈翚翯竑姮葓皜袆淏皞翙銲鉷澒澔閤婳黃峘鸻鈜褘锽谹嫮",
				k:"凱堃蒯鹍崑焜姱衎鵾愷鎧",j:"冏泂劼莙濬暕珒椈珺璟競煚傑玦鑑瑨瑨琎勣寯烱浕斚倢瑴畯雋傢峤",
				m:"劢忞旻旼濛嫚媺铓鋩洺媌媔祃牻慜霂楙媄瑂",l:"玏呂俍冧倞琍綝壘孋瓅璘粦琍麗樑秝鍊崚链镠皊箖菻竻鸰琭瓈騄浬瑠嶺稜欐昽",
				n:"婻寗嫟秾迺柟薿枏",q:"玘佺耹踆骎啟蒨慬勍嵚婍璆碏焌駸綪锜荍釥嶔啓",p:"芃玭玶罴毰珮蘋慿弸掽逄砯",
				s:"屾昇妽珅姼甡湦骦塽挻甦鉥燊遂陞莦湜奭佀聖骕琡",r:"汭瑈瑢讱镕婼叡蒻羢瀼",
				t:"沺凃禔慆弢颋譚曈榃湉珽瑱橦镋渟黇頲畑媞鰧",w:"卍彣炆溦娬韡暐偉湋妏硙珷娒",
				y:"乂冘弌贠伝伃杙沄旸玙玥垚訚堯溁嫈澐颺熤儀赟祎瑀湧燚嬿鋆嫄愔贇彧崟韻龑颙晹媖顒禕羕炀弇湲霙嫕浥飏峣曣億雲愔洢暘钖垟詠燿鹓歈貟瑩燏暎畇娫矞祐溳崯颍煬靷谳異軏繄",
				x:"仚旴忺炘昍烜爔斅豨勲敩虓鈃禤燮瑄晞賢翾譞諕璿琇晛焮珣晅郤禼皛哓肸谞迿咲婞昫缐姁猇欻箮翛暁",
				z:"烝梽喆禛誌曌衠淽枬詟炤昝珘赒"
			};
		    var charts = this.item.find('.unfamiliar-spells a');
			var _this = this;
			this.bind(charts,'mouseover',function(){
			    charts.removeClass('rarewordtip-on');
				$(this).addClass('rarewordtip-on');
				var html = '';
				var str = dict[$(this).attr('title')];
				if(str) {
				    for (i = 0; i < str.length; i++){
					    html += '<a style="z-index:10;margin-right:5px;" class="unfamiliar-word" href="#">'+ str.charAt(i) +'</a>';
					};
					
				} else {
				    html += '<a style="z-index:10;margin-right:5px;" class="unfamiliar-word" href="#">&nbsp</a>'
				}
				_this.el.find('.unfamiliar-words').html(html);
			});
			var input = this.input;
			this.el.delegate('.unfamiliar-words a','click', function(e){
				e.preventDefault();
				input.focus();
				input.val(input.val() + $(this).html());
			});
		}
		
	});
	
	Y.inherit('ImgMagnifyTip','Tip',{//图片在旁边放大处理
	    doInit: function(cfg){
			cfg.renderTo = 'body';
		    this.callBase('doInit', 'Tip', cfg);
			var target = this.target;
			if(!target) {
			   Y.handlerError('ImgMagnifyTip类必须配置target');
			   return;
			}
			var _this = this;
			this.bind(target, 'mouseenter', function(e){
				clearTimeout(_this.timer);
				_this.el.html('').append($(this).clone()
											.width(_this.width = $(this).width() * cfg.magnify)
											.height(_this.height = $(this).height() * cfg.magnify));
			    _this.show(cfg.speed);
				
			});
			
			this.bind(target, 'mouseleave', function(e){
				_this.timer = setTimeout(function(){
					_this.hide(cfg.speed);
				},200);
			});
			this.bind(this.el, 'mouseleave', function(e){
			    _this.timer = setTimeout(function(){
				  	_this.hide(cfg.speed);
				},200);
			});
			this.bind(this.el, 'mouseenter', function(e){
			    clearTimeout(_this.timer);
			});
		},
		doShow: function(speed){
		    this.callBase('doShow','Window',speed);
			this.rePosition();
			this.isDoSize = true;
		},
		rePosition:function(){
			var XY = this.getPosition();
			var ele = this.target;
			var w = ele.width(),h = ele.height();
			if(XY.x + w + this.width > $(window).width()){
			   XY.x -= this.width + 50;
			}else{
			   XY.x += w;
			}
			if(XY.y + this.height > $(window).height() + $(window).scrollTop()){
			   XY.y -= this.height + 10;
			}
			this.el.css({
				left: XY.x,
				top: XY.y
			});
			return this;
		},
		getPosition:function(){
			var ele = this.target;
			var pos = ele.offset();
		 	return {x:pos.left,y: pos.top};
		}
	});
	Y.Tip.defaults = $.extend({},Y.Window.defaults,{
		simple: true,
		modal:false,
		minWidth: 10,
		autoSize: true,
		align: 'right bottom',
		autoDisappear: true,
		spacing: 0,
		css: 'wnd-tip',
		el: 'span',
		speed : 0
	});
	Y.ToolTip.defaults = $.extend({},Y.Tip.defaults,{
		autoDisappear: false,
		css: 'wnd-tip wnd-tip-tooltip',
		delay: 300
	});
	Y.ToolTip.firstShow = false;
	Y.StartTip.defaults = $.extend({},Y.Tip.defaults,{
		autoDisappear: false,
		css: 'wnd-tip-starttip',
		renderTo : 'body',
		padding: 2,
		spacing : 0,
		speed: 0,
		align: 'bottom'
	});
	Y.TranslateTip.defaults = $.extend({},Y.Tip.defaults,{
		autoDisappear: false,
		css: 'wnd-tip-translatetip',
		translateType: '',//默认转换方式
		renderTo : 'body',
		spacing : 0 ,
		speed : 0 ,
		align: 'top',
		length: 16 , // xxxx xxxx xxxx xxxx 特殊配置 x的个数
		fixedString:'',//固定格式 xxx xx xx 只有x是被替换的 其他不变
		showMore:true,//位数不够多时 是否显示多余的默认的替代符号
		bindType: 'bind'
	});
	Y.SearchTip.defaults = $.extend({},Y.Tip.defaults,{
		autoDisappear: false,
		css: 'select-combo-tip',
		renderTo: 'body',
		spacing:5,
		speed: 0,
		el:'ul',
		item:'li',
		data: [],
		overCss: 'select-light-tip',
		itemCss: 'select-item-tip',
		bindType: 'bind',
		showNumbers:10
	});
	Y.RareWordTip.defaults = $.extend({},Y.Tip.defaults, {
		autoDisappear:true,
		css: 'wnd-tip-rarewordtip'
	});
	Y.RareWordTip.firstShow = false;
	
	Y.ImgMagnifyTip.defaults = $.extend({},Y.Tip.defaults,{
		autoDisappear:false,
		el:'div',
		content:'<div>',
		magnify:2
	});
});
  
})($);