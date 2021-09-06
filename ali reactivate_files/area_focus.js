AE.namespace('AE.form.areaFocus');


//foucs时，field的TBODY变色，blur时变回原色
AE.form.areaFocus = function(){
	_self = this;
	_self.formObj = {};

	var getAllElements = function(){
		var etags = ['INPUT', 'SELECT', 'TEXTAREA'];
		return YUD.getElementsBy(function(f){return etags.indexOf(f.tagName) != -1;}, '*', _self.formObj);
	}
	
	var onfocusFunc = function(ev, el){
		var tbd = YUD.getAncestorByTagName(el, 'TBODY');
		YUD.setStyle(tbd, 'background', '#F0F5F8');
	}
	
	var onblurFunc = function(ev, el){
		var tbd = YUD.getAncestorByTagName(el, 'TBODY');
		YUD.setStyle(tbd, 'background', '');
	}
	
	_self.init = function(formId){
		_self.formObj = get(formId);
		var els = getAllElements();
		for(var i=0,len=els.length;i<len;i++){
			YUE.on(els[i], 'focus', onfocusFunc, els[i]);
			YUE.on(els[i], 'blur', onblurFunc, els[i]);	
		}
	}
}