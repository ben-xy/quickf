
(function($){
define(function(require, exports, module){
    require("../Y-script/Y-select.js");
	
	var url = "/bank/getAllDistrict";//查询省市信息的接口
	
	var areaInfo = [],data = {};
	
	function selectarea(container){
	    var pSelect = container.find('.Y-province');
		var cSelect = container.find('.Y-city');
		var firstP = container.attr('province');
		var firstC = container.attr('city');
		var y_pSel = Y.Select(pSelect);
		pSelect.append('<option value="">请选择</option>');
		for ( var i = 0; i < areaInfo.length; i++) {
		    var row = areaInfo[i];
		    var pCode = row.cityList[0].branchDistrictNo.slice(0, 6);
		    pSelect.append('<option value="' + row.provinceName + '" code="'+pCode+'">' + row.provinceName + '</option>');
		}
		if(firstP) {
		    y_pSel.selected(firstP);
		}
		handler(pSelect.find('option:selected').attr('code'),cSelect,firstC);
		y_pSel.jqTrans();
		y_pSel.bindChange(function(){
		    var code = $(this).find('option:selected').attr('code');
			handler(code,cSelect);
		});
 	}
	function handler(code,cSelect,firstC){
		if(!code) {
			cSelect.empty().append('<option value="">请选择城市</option>');
			Y.Select(cSelect).jqTrans();
			return;
		}
	    var cityData = data[code];
		cSelect.empty().append('<option value="">请选择城市</option>');
		for ( var i = 0; i < cityData.length; i++) {
		    var cityName = cityData[i].cityName;
			cSelect.append('<option value="' + cityName + '">' + cityName + '</option>');
		}
		if(firstC) {
		    Y.Select(cSelect).selected(firstC);
		}
		Y.Select(cSelect).jqTrans();
	}
	function init(){
		for ( var i = 0; i < areaInfo.length; i++) {
		    var row = areaInfo[i];
			var pCode = row.cityList[0].branchDistrictNo.slice(0, 6);
			data[pCode] = row.cityList;
		}
		$('.Y-selectarea').each(function(i,item){
		    selectarea($(item));
		});
		
	}
	var time = 2;
	function getAreaInfo(url,callback){
	    $.ajax({
		    url: url,
		    type:'post',
		    dataType:'json',
			success: function(res){
			    if(!res || res.code != 1) {
					if(time-- > 0) {
					    getAreaInfo(url,callback);
					}
				    return;
				}
				areaInfo = res.data;
				if(callback) callback(areaInfo);
			},error:function(){
				if(time-- > 0) {
					getAreaInfo(url,callback);
				}
			}
		});
	}
	getAreaInfo(url,function(){
	    init();
	});

});    
	
})($);
