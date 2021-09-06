AE.namespace('AE.form.validator');

AE.form.validator = function(){
	var _self = this,

		toArray = function (B, D) {
			var C = [],
				A = D || 0;
			for (; A < B.length; A++) {
				C[C.length] = B[A];
			}
			return C;
		},

		depthMerge = function(){
			var o={}, a=arguments;
			for (var i=0, l=a.length; i<l; i++ ) {
				for( var key in a[i] ){
					if( YL.isArray( a[i][ key ] ) ||
						YL.isFunction( a[i][ key ] ) ||
						!YL.isObject( a[i][ key ] ) ){
						o[key] = a[i][key];
						continue;
					}
					if( o[key] == null ){
						o[key] = {};
					}
					o[key] = depthMerge( o[key], a[i][key] );
				}
			}
			return o;
		},

		defConfig = {
			focusOnError:true,

			validateImmediate:true,

			tipsAdviceContainerClass:'fieldTipsContainer',
			tipsAdviceClass:'fieldTips',
			tipsAdviceMsgClass:'fieldTipsMsg',

			errorAdviceContainerClass:'fieldErrorContainer',
			errorAdviceClass:'fieldError',
			errorAdviceMsgClass:'fieldErrorMsg',

			fieldSuccessClass: 'fieldSuccess',
			fieldFailClass: 'fieldFail',

			ifNeedValidate: true,

			eventFuncMap:{
				blur:'default_blur',
				focus:'default_focus',
				keydown:'default_keydown',
				click:'default_click'
			},
			displayFuncMap:{
				getTipsAdvice:'getAdvice_getTips',
				getErrorAdvice:'getAdvice_getError',
				showStatus:'showStatus_changeTitleClass',
				showTipsMsg:'showTipsMsg_showMsgFollowOtherObj',
				closeTipsMsg:'closeTipsMsg_close',
				showErrorMsg:'showErrorMsg_showMsgFollowOtherObj',
				closeErrorMsg:'closeErrorMsg_close'
			}
		};

	//外部自定义事件
	_self.customEvent={
		'onFeildErrFire'        :new YAHOO.util.CustomEvent('feildErrFire',_self,false,YAHOO.util.CustomEvent.LIST),
		'afterValidateAll'      :new YAHOO.util.CustomEvent('afterValidateAll',_self,false,YAHOO.util.CustomEvent.LIST),
		'afterValidateOneField' :new YAHOO.util.CustomEvent('afterValidateOneField',_self,false,YAHOO.util.CustomEvent.LIST),
		'afterFieldBlurNotValidators':new YAHOO.util.CustomEvent('afterFieldBlurNotValidatorsEvent',_self,false,YAHOO.util.CustomEvent.LIST),
		'onAfterAddValidateField':new YAHOO.util.CustomEvent('afterAddValidateField',_self,false,YAHOO.util.CustomEvent.LIST),
		'onAfterDelValidateField':new YAHOO.util.CustomEvent('afterDelValidateField',_self,false,YAHOO.util.CustomEvent.LIST)
	}

	//校验方法池
	_self.validatorsPool = {
		//为空
		isEmpty : function(val, el, params) {return ((val == null) || (val.length == 0))},
		//不为空
		notEmpty : function(val, el, params) {return !((val == null) || (val.length == 0))},
		//trim后为空
		isTrimedEmpty: function(val, el, params) {return YL.trim(val) == null || (YL.trim(val).length == 0)},
		//trim后不为空
		notTrimedEmpty: function(val, el, params) {return !(YL.trim(val) == null || (YL.trim(val).length == 0))},
		//正则表达式匹配
		regexp : function(val, el, params) {return eval(params[0]).test(val)},
		//正则表达式匹配取反
		notRegexp : function(val, el, params) {return !eval(params[0]).test(val)},
		//最小长度
		minLength : function(val, el, params) {return val.length >= parseInt(params[0])},
		//最大长度
		maxLength : function(val, el, params) {return val.length <= parseInt(params[0])},
		//最小值
		minValue : function(val, el, params) {return val >= parseFloat(params[0])},
		//最大值
		maxValue : function(val, el, params) {return val <= parseFloat(params[0])},
		//不属于其中
		notOneOf : function(val, el, params) {return params.every(function(v) {return val != v;})},
		//其中之一
		oneOf : function(val, el, params) {return params.some(function(v) {return val == v;})},
		//等于
		equal : function(val, el, params) {return val == params[0]},
		//不等于
		notEqual : function(val, el, params) {return val != params[0]},
		//等于某个表单域的值
		equalToField : function(val, el, params) {return val == get(params[0]).value},
		//不等于某个表单域的值
		notEqualToField : function(val, el, params) {return val != get(params[0]).value}
	};

	//示例方法供添加
	var methods = {
		'oneRequire': function(val, el, params){
			var elname = el.name;
			var els = el.form.elements[elname];
			if (els.length > 0) {
				return toArray(els).some(function(o) {return o.checked;});
			} else {
				return els.checked;
			}
		},
		'selection': function(val, el, params){
			return el.options ? el.selectedIndex >= 0 && _self.validatorsPool.notEmpty(val) : true;
		}
	};


	//////////////////////////////开放方法//////////////////////////////

	//添加校验方法
	_self.addValidator = function(){
		switch(arguments.length){
			case 1:
				_self.validatorsPool = YL.merge(_self.validatorsPool, arguments[0]);
				break;
			case 2:
				var m = {};
				m[arguments[0]] = arguments[1];
				_self.validatorsPool = YL.merge(_self.validatorsPool, m);
				break;
			default:
				return;
		}
	};

	//添加显示层方法
	_self.addDisplayFunc = function(){

		switch(arguments.length){
			case 1:
				_self.displayFuncPool = YL.merge(_self.displayFuncPool, arguments[0]);
				break;
			case 2:
				var m = {};
				m[arguments[0]] = arguments[1];
				_self.displayFuncPool = YL.merge(_self.displayFuncPool, m);
				break;
			default:
				return;
		}
	};

	//添加触发事件方法
	_self.addEventFunc = function(){
		switch(arguments.length){
			case 1:
				_self.eventFuncPool = YL.merge(_self.eventFuncPool, arguments[0]);
				break;
			case 2:
				var m = {};
				m[arguments[0]] = arguments[1];
				_self.eventFuncPool = YL.merge(_self.eventFuncPool, m);
				break;
			default:
				return;
		}
	};


	//执行添加校验方法
	_self.addValidator(methods);

	//从服务器端返回的错误信息
	_self.errorFromServer = function(elid, errorMsg){
		_self.configData.errorFromServerCount++;
		var el = get(elid);
		if(el){
			var displayFuncs = _self.configReader(el, 'displayFuncMap');
			var advice = _self.displayFuncPool[displayFuncs['getErrorAdvice']](el);
			_self.displayFuncPool[displayFuncs['showErrorMsg']](el, advice, errorMsg);
			_self.displayFuncPool[displayFuncs['showStatus']](el, false);
			if(_self.configData.errorFromServerCount == 1 ){
				_self.displayFuncPool['scrollToField'](el);
			}
		}
		//记录服务器返回的错误，全部提交时如果还存在服务器返回错误，也不能提交
		_self.configData.errorFromServer[elid] = errorMsg;
	};

	//从服务器端返回的tips信息
	_self.tipsFromServer = function(elid, tipsMsg){
		var el = get(elid);
		if(el){
			var displayFuncs = _self.configReader(el, 'displayFuncMap');
			var advice = _self.displayFuncPool[displayFuncs['getTipsAdvice']](el);
			_self.displayFuncPool[displayFuncs['showTipsMsg']](el, advice, tipsMsg);
		}
	};

	//////////////////////////////开放方法//////////////////////////////

	//所有配置过的字段的引用
	_self.allFields = {};

	//所有生成的tipsAdvisor集合
	_self.allTipsAdvisor = {};

	//所有生成的errorAdvisor集合
	_self.allErrorAdvisor = {};

	//所有数据池
	_self.configData = {};

	//当前表单对象
	_self.formObj = {};

	//static 得到最初所有的field
	_self.getAllFields = function(  ){
		for(var f in _self.configData.fields){
			el = get(f);
			if(el){
				_self.allFields[f] = el;
			}
		}
	};

	//添加fields到数据集里,并返回本次添加的这段集
	_self.addFields = function( fields ){
		if( fields == null ){ return ; }
		var aFields = {};
		for(var f in fields){
			el = get(f);
			if(el){
				_self.allFields[f] = el;
				aFields[f] = el;
			}
		}
		return aFields;
	};

	//attribute读取器
	_self.configReader = function(el, attribute){
		var d = attribute.split(".");
		var o = _self.configData.fields[el.id];
		var p = _self.configData;
		for(var i=0,j=d.length;i<j;i++){
			o = o[d[i]] || {};
		}
		for(var m=0,n=d.length;m<n;m++){
			p = p[d[m]];
		}
		if(YL.isObject(p)){
			return YL.merge(p, o);
		} else if(_self.configData.fields[el.id][attribute] !== undefined) {
			return _self.configData.fields[el.id][attribute];
		} else {
			return _self.configData[attribute];
		}
	}

	//是否是radio,checkbox,select,file类型的field
	_self.isSpecialField = function(el){
		return (el.type.toLowerCase() == 'radio' || el.type.toLowerCase() == 'checkbox' || el.type.toLowerCase() == 'file' || el.tagName == 'SELECT') ? true : false
	}

	//是否是radio,checkbox
	_self.isCheckBoxOrRadio = function(el){
		return (el.type.toLowerCase() == 'radio' || el.type.toLowerCase() == 'checkbox') ? true : false
	}

	//处理前置条件函数
	_self.executeBeforeFunc = function(data_before){
		if(data_before === undefined) {return true}
		var elid = data_before.elid;
		var elv = data_before.elv;
		if(elid in _self.configData.fields){
			var vali = _self.configData.fields[elid].validators[elv];
		} else {
			return false;
		}
		var el = get(elid);
		return _self.executeValidator(el, vali);
	}

	//执行字段里的单个validator

	_self.executeValidator = function(el, data_validator,o){
		if(_self.validatorsPool[data_validator.ruleName] && !_self.validatorsPool[data_validator.ruleName](el.value, el, data_validator.params,o))

			return false;
		else
			return true;
	}




	//校验单个字段 return true or false;
	//o 调用者传递参数

	_self.validateField = function(el, validators, o, byAllRule){
		var result = true;
		var msg = null;
		var returnMsg = new AE.widget.message();
		returnMsg.init();
		var errorFieldId = el.id;
		var errorValidatorName = null;
		for(var v in validators){
			if(!_self.executeValidator(el, validators[v],o)){
				msg = validators[v].errorMsg || _self.configData.fields[el.id].errorMsg;
				errorValidatorName = v;
				returnMsg.pushMsg(msg,v,1);
				result = false;
				if(!byAllRule){break;}

			}
		}

		returnMsg['result'] = result;
		returnMsg['msg'] = msg;
		returnMsg['validatorName'] = errorValidatorName;
		_self.customEvent['afterValidateOneField'].fire(errorFieldId,returnMsg);
		//_self.customEvent['afterValidateOneField'].fire(errorFieldId, errorValidatorName, result);
		return returnMsg;
	}

	//####################add by justin, 有些疑虑的代码 begin#########################################################################################
	//校验所有规则。这个逻辑. 目前来说有系统漏洞，就是可能造成死循环。应用的时候慎重。
	//打开循环结的方案是，在运行时，把校验器的路径记录下来，做标记，每次对比。考虑到效率问题，暂时不加这段逻辑，
//    _self.validateFieldByAllRule = function(el, validators,o){
//    		//var result = true;
//    		var msg = null;
//    		var returnMsg = new AE.widget.message();
//    		returnMsg.init();
//    		var errorFieldId = el.id;
//    		var errorValidatorName = null;
//    		for(var v in validators){
//    			if(!executeValidator(el, validators[v],o)){
//    				msg = validators[v].errorMsg || _self.configData.fields[el.id].errorMsg;
//    				returnMsg.pushMsg(msg,v,1);
//    				//result = false;
//    				//break;
//    			}
//    		}
//    		//_self.customEvent['afterValidateOneField'].fire({'fieldId':errorFieldId, 'validatorName':errorValidatorName, 'result':result});
//    		return returnMsg;
//    	}
	//####################add by justin, 有些疑虑的代码 end#########################################################################################

	//把dos里对应的validator装成validators  return validators
	_self.dosToValidator = function(el, dos){
		var vs = {};
		for(var i=0,j=dos.length;i<j;i++){
			if(_self.configData.fields[el.id].validators[dos[i]]){
				vs[dos[i]] = _self.configData.fields[el.id].validators[dos[i]];
			}
		}
		return vs;
	}

	//conditionHandle return validators or false
	_self.conditionHandle = function(el){
		if(YL.isArray(_self.configData.fields[el.id].condition) && _self.configData.fields[el.id].condition.length > 0){
			for(var i=0,j=_self.configData.fields[el.id].condition.length; i<j; i++){
				if(_self.executeBeforeFunc(_self.configData.fields[el.id].condition[i].before)){
					return _self.dosToValidator(el, _self.configData.fields[el.id].condition[i].dos);
				}
			}
		}
		return false;
	}

	//判断最终使用的validator
	_self.getValidators = function(el){
		if(!_self.configData.fields[el.id]){
			return false;
		}
		if(_self.configData.fields[el.id].condition != undefined){
			return _self.conditionHandle(el)
		} else {
			return _self.configData.fields[el.id].validators || false;
		}
	}

	//校验所有字段
	_self.validateAllField = function(){
		var validateResult, el, ifNeedValidate, advice, msg, displayFuncs, finalResult=true;
		var firstErrorField = null;
		var errFieldNum = 0;
		var elValidators = false;
		for(var f in _self.allFields){
			el = _self.allFields[f];
			//手动标志位。字段里配置ifNeedValidate为false时人为不校验
			ifNeedValidate = _self.configReader(el, 'ifNeedValidate');
			displayFuncs = _self.configReader(el, 'displayFuncMap');
			//取得最终的validators
			elValidators = _self.getValidators(el);
			//处理服务端返回的错误信息
			if((f in _self.configData.errorFromServer) && firstErrorField == null){
				firstErrorField = el;
				errFieldNum++;
				_self.customEvent['onFeildErrFire'].fire(_self.configData.errorSubmitTime+1, errFieldNum, el);
				finalResult = false;
				_self.configData.fields[el.id].statusResult = false;
				_self.configData.fields[el.id].statusMsg = _self.configData.errorFromServer[f];
				_self.displayFuncPool[displayFuncs['showStatus']](el, _self.configData.fields[el.id].statusResult);
				_self.errorFromServer(f, _self.configData.fields[el.id].statusMsg);
			//处理页面错误信息
			} else if(ifNeedValidate && elValidators) {
				validateResult = _self.validateField(el, elValidators);
				_self.configData.fields[el.id].statusResult = !validateResult.isError();
				_self.configData.fields[el.id].statusMsg = validateResult.getContent();
				//调用改变字段class方法
				_self.displayFuncPool[displayFuncs['showStatus']](el, _self.configData.fields[el.id].statusResult);
				advice = _self.displayFuncPool[displayFuncs['getErrorAdvice']](el);
				//得到需要错误的msg
				msg = _self.configData.fields[el.id].statusMsg;
				//调用关闭tips方法
				_self.displayFuncPool[displayFuncs['closeTipsMsg']](el);
				//如果当前验证结果不为true时就显示错误
				if(!_self.configData.fields[el.id].statusResult){
					//调用显示错误的方法
					errFieldNum++;
					_self.customEvent['onFeildErrFire'].fire(_self.configData.errorSubmitTime+1, errFieldNum, el);
					_self.displayFuncPool[displayFuncs['showErrorMsg']](el, advice, msg);
					finalResult = false;
					//得到第一个出错的字段
					if(firstErrorField == null) firstErrorField = el;
				}
			}
		}
		//滚动到第一个出错的地方
		if(_self.configData.focusOnError && firstErrorField != null){
			_self.displayFuncPool['scrollToField'](firstErrorField);
		}
		if(firstErrorField != null){
			//设置提交时出错次数
			_self.configData.errorSubmitTime++;
		}
		_self.customEvent['afterValidateAll'].fire(_self.configData.errorSubmitTime, errFieldNum, finalResult);
		return finalResult;
	}


	//校验所有字段得到布尔值
	_self.validateAllFieldFlag = function(){
		var validateResult, el, ifNeedValidate, finalResult=true;
		var firstErrorField = null;
		var errFieldNum = 0;
		var elValidators = false;
		for(var f in _self.allFields){
			el = _self.allFields[f];
			//手动标志位。字段里配置ifNeedValidate为false时人为不校验
			ifNeedValidate = _self.configReader(el, 'ifNeedValidate');
			//取得最终的validators
			elValidators = _self.getValidators(el);
			//处理服务端返回的错误信息
			if((f in _self.configData.errorFromServer) && firstErrorField == null){
				firstErrorField = el;
				errFieldNum++;
				finalResult = false;
				_self.configData.fields[el.id].statusResult = false;
				_self.configData.fields[el.id].statusMsg = _self.configData.errorFromServer[f];
				_self.errorFromServer(f, _self.configData.fields[el.id].statusMsg);
			//处理页面错误信息
			} else if(ifNeedValidate && elValidators) {
				validateResult = _self.validateField(el, elValidators);
				_self.configData.fields[el.id].statusResult = !validateResult.isError();
				//如果当前验证结果不为true时就显示错误
				if(!_self.configData.fields[el.id].statusResult){
					finalResult = false;
					//得到第一个出错的字段
					if(firstErrorField == null) firstErrorField = el;
				}
			}
		}
		return finalResult;
	}

	//表现层方法集合
	_self.displayFuncPool = {
		//取得tipsAdvice并存入_self.allTipsAdvisor,
		getAdvice_getTips: function(el) {
			var id = el.id;
			var advice;
			if (id in _self.allTipsAdvisor){
				advice = _self.allTipsAdvisor[id];
			} else {
				//拼出tipsadvice的id
				var aid = (el.id) + '-advice-tips';
				//如果页面中存在该id的<div>，使用其作为advice
				advice = get(aid);
				if (!advice) {
					//如果设置了 tipsAdviceContainerClass，根据该class找到父容器，因为表单域可能存在多层嵌套(在<table>或多层<div>下)，而advice可能要求显示在父容器指定处
					var tipsAdviceContainerClass = _self.configReader(el, 'tipsAdviceContainerClass');
					var container = YUD.getAncestorByClassName(el, tipsAdviceContainerClass) || el.parentNode;
					var tipsAdviceClass = _self.configReader(el, 'tipsAdviceClass');
					advice = YUD.getElementsByClassName(tipsAdviceClass, 'div', container)[0];
					if (!advice) {
						//创建advice
						advice = document.createElement('div');
						YUD.addClass(advice, tipsAdviceClass);
						if (_self.configData.fields[el.id].tipsAdviceContainerClass) {
							container.appendChild(advice);
						} else {
							//将advice显示在紧随表单域的后面
							switch (el.type.toLowerCase()) {
								//checkbox 和 radio 显示在父元素的最后面
								case 'checkbox':
								case 'radio':
									el.parentNode.appendChild(advice, el);
									break;
								default:
									YUD.insertAfter(advice, el);
							}
						}
					}
					advice.id = aid;
				}
				_self.allTipsAdvisor[id] = advice;
			}
			YUD.setStyle(advice, 'display', 'none');
			YUE.on(advice, 'mouseover', function(){
				_self.configData.fields[el.id].tipsClose = false;
			})
			YUE.on(advice, 'mouseout', function(){
				_self.configData.fields[el.id].tipsClose = true;
			})
			return advice;
		},
		//取得ErrorAdvice并存入_self.allErrorAdvisor,
		getAdvice_getError: function(el) {
			var id = el.id;
			var advice;
			if (id in _self.allErrorAdvisor){
				advice = _self.allErrorAdvisor[id];
			} else {
				//拼出errorAdvice的id
				var aid = (el.id) + '-advice-error';
				//如果页面中存在该id的<div>，使用其作为advice
				advice = get(aid);
				if (!advice) {
					//如果设置了 errorAdviceContainerClass，根据该class找到父容器，因为表单域可能存在多层嵌套(在<table>或多层<div>下)，而advice可能要求显示在父容器指定处
					var errorAdviceContainerClass = _self.configReader(el, 'errorAdviceContainerClass');
					var container = YUD.getAncestorByClassName(el, errorAdviceContainerClass) || el.parentNode;
					var errorAdviceClass = _self.configReader(el, 'errorAdviceClass');
					advice = YUD.getElementsByClassName(errorAdviceClass, 'div', container)[0];
					if (!advice) {
						//创建advice
						advice = document.createElement('div');
						YUD.addClass(advice, errorAdviceClass);
						if (_self.configData.fields[el.id].errorAdviceContainerClass) {
							container.appendChild(advice);
						} else {
							//将advice显示在紧随表单域的后面
							switch (el.type.toLowerCase()) {
								//checkbox 和 radio 显示在父元素的最后面
								case 'checkbox':
								case 'radio':
									el.parentNode.appendChild(advice, el);
									break;
								default:
									YUD.insertAfter(advice, el);
							}
						}
					}
					advice.id = aid;
				}
				_self.allErrorAdvisor[id] = advice;
			}
			YUD.setStyle(advice, 'display', 'none');
			return advice;
		},
		//根据结果添加field的成功或失败class
		showStatus_changeFieldClass: function(el, result) {
			var fieldFailClass = _self.configReader(el, 'fieldFailClass');
			var fieldSuccessClass = _self.configReader(el, 'fieldSuccessClass');
			if (!result) {
				YUD.removeClass(el, fieldSuccessClass);
				YUD.addClass(el, fieldFailClass);
			} else {
				YUD.removeClass(el, fieldFailClass);
				YUD.addClass(el, fieldSuccessClass);
			}
		},
		//根据结果改变字段标题
		showStatus_changeTitleClass: function(el, result){
			var titleEl;
			var titleId = el.getAttribute( '_validatorTitleId' );
			if( titleId != null ){
				titleEl = get(titleId);
			} else {
				var tmp = YUD.getPreviousSibling(YUD.getAncestorByTagName(el, 'TD'));
				titleEl = YUD.getFirstChild(tmp);
			}
			if(!result){
				YUD.addClass(titleEl, 'alert');
			} else {
				YUD.removeClass(titleEl, 'alert');
			}
		},
		//只显示容器，不给内容，用在TIPS写成HTML，直接放在容器中
		showTipsMsg_justShowContainer: function(el, advice, msg){
			if(msg != null){
				var elPos = YUD.getXY(el);
				YUD.setStyle(advice, 'position', 'absolute');
				var tipsAdviceMsgClass = _self.configReader(el, 'tipsAdviceMsgClass');
				var msgbox = YUD.getElementsByClassName(tipsAdviceMsgClass, '*', advice)[0] || advice;
				YUD.setStyle(advice, 'display', 'block');
				YUD.setXY(advice, [elPos[0]-4 + el.offsetWidth, elPos[1]]);
				//YUE.on(advice, 'click', function() {this.style.display = 'none';});
			}
		},
		//打开Tips提示_弹出泡泡
		showTipsMsg_bubbleMsg: function(el, advice, msg){
			if(msg != null){
				var elPos = YUD.getXY(el);
				YUD.setStyle(advice, 'position', 'absolute');
				var tipsAdviceMsgClass = _self.configReader(el, 'tipsAdviceMsgClass');
				var msgbox = YUD.getElementsByClassName(tipsAdviceMsgClass, '*', advice)[0] || advice;
				msgbox.innerHTML = msg;
				YUD.setStyle(advice, 'display', 'block');
				YUD.setXY(advice, [elPos[0]-4 + el.offsetWidth, elPos[1]]);
				//YUE.on(advice, 'click', function() {this.style.display = 'none';});
			}

		},

		//不直接跟随OBJ显示Tips，在同母节点下，找第一个CLASS带followedObj的。
		showTipsMsg_showMsgFollowOtherObj: function(el, advice, msg){
			var dFollowedObj = get(el.getAttribute('errMsgTo'));
			dFollowedObj = dFollowedObj ?  dFollowedObj :  YUD.getElementsByClassName('followedObj','*',el.parentNode)[0];
			dFollowedObj = dFollowedObj? dFollowedObj : el;
			if(msg != null){
				var elPos = YUD.getXY(dFollowedObj);
				YUD.setStyle(advice, 'position', 'absolute');
				var tipsAdviceMsgClass = _self.configReader(el, 'tipsAdviceMsgClass');
				var msgbox = YUD.getElementsByClassName(tipsAdviceMsgClass, '*', advice)[0] || advice;
				msgbox.innerHTML = msg;
				YUD.setStyle(advice, 'display', 'block');
				YUD.setXY(advice, [elPos[0]-4 + dFollowedObj.offsetWidth, elPos[1]]);
				//YUE.on(advice, 'click', function() {this.style.display = 'none';});
			}

		},

		//在右边出现错误信息
		showErrorMsg_bubbleMsg: function(el, advice, msg){
			if(msg != null){
				var elPos = YUD.getXY(el);
				YUD.setStyle(advice, 'position', 'absolute');
				var errorAdviceMsgClass = _self.configReader(el, 'errorAdviceMsgClass');
				var msgbox = YUD.getElementsByClassName(errorAdviceMsgClass, '*', advice)[0] || advice;
				msgbox.innerHTML = msg;
				YUD.setStyle(advice, 'display', 'block');
				YUD.setXY(advice, [elPos[0]-4 + el.offsetWidth, elPos[1]]);
				//YUE.on(advice, 'click', function() {this.style.display = 'none';});
			}
		},
		//不直接跟随OBJ显示ERROR，在同母节点下，找errMsgTo所指定的元素，若不存在再找第一个父节点下第一个CLASS带followedObj的。
		showErrorMsg_showMsgFollowOtherObj: function (el, advice, msg) {
			var dFollowedObj = get(el.getAttribute('errMsgTo'));
			dFollowedObj = dFollowedObj ?  dFollowedObj :  YUD.getElementsByClassName('followedObj','*',el.parentNode)[0];
			dFollowedObj = dFollowedObj? dFollowedObj : el;
			if(msg != null){
				var elPos = YUD.getXY(dFollowedObj);
				YUD.setStyle(advice, 'position', 'absolute');
				var errorAdviceMsgClass = _self.configReader(el, 'errorAdviceMsgClass');
				var msgbox = YUD.getElementsByClassName(errorAdviceMsgClass, '*', advice)[0] || advice;
				msgbox.innerHTML = msg;
				YUD.setStyle(advice, 'display', 'block');
				YUD.setXY(advice, [elPos[0]-4 + dFollowedObj.offsetWidth, elPos[1]]);
			}
		},
		//关闭Tips提示_直接关闭
		closeTipsMsg_close: function(el){
			YUD.setStyle(_self.allTipsAdvisor[el.id],'display','none')
		},
		//关闭Error提示_直接关闭
		closeErrorMsg_close: function(el){
			YUD.setStyle(_self.allErrorAdvisor[el.id],'display','none')
		},
		//屏幕滚动到制定位置
		scrollToField: function(el){
			//field的自身高度
			var elOffsetHeight = el.offsetHeight;
			//field的坐标
			var elY = YUD.getY(el);
			//浏览器窗口的高度
			var clientHeight = YUD.getClientHeight();
			//页面滚动TOP高度
			var documentScrollTop = YUD.getDocumentScrollTop();
			//不在显示的范围内就scroll到该位置
			if(documentScrollTop < elY + elOffsetHeight - clientHeight || documentScrollTop > elY ){
				window.scroll(0, elY - 15);
			}
		},
		//重新定位各提示窗
		repositionAdvice: function(){
			var el, elPos;
			for(var f in _self.allErrorAdvisor){
				el = get(_self.allErrorAdvisor[f].id.replace(/-advice-error/gi, ''));
				var dFollowedObj = get(el.getAttribute('errMsgTo'));
				dFollowedObj = dFollowedObj ?  dFollowedObj :  YUD.getElementsByClassName('followedObj','*',el.parentNode)[0];
				dFollowedObj = dFollowedObj? dFollowedObj : el;
				elPos = YUD.getXY(dFollowedObj);
				YUD.setXY(_self.allErrorAdvisor[f], [elPos[0]-4 + dFollowedObj.offsetWidth, elPos[1]]);
			}
			for(var f in _self.allTipsAdvisor){
				el = get(_self.allTipsAdvisor[f].id.replace(/-advice-tips/gi, ''));
				var dFollowedObj = get(el.getAttribute('errMsgTo'));
				dFollowedObj = dFollowedObj ?  dFollowedObj :  YUD.getElementsByClassName('followedObj','*',el.parentNode)[0];
				dFollowedObj = dFollowedObj? dFollowedObj : el;
				elPos = YUD.getXY(dFollowedObj);
				YUD.setXY(_self.allErrorAdvisor[f], [elPos[0]-4 + dFollowedObj.offsetWidth, elPos[1]]);
			}
		}
	}

	//事件驱动方法集合
	_self.eventFuncPool = {
		default_blur: function(ev, el){
			var displayFuncs = _self.configReader(el, 'displayFuncMap');
			//是否需要立即校验
			var validateImmediate = _self.configReader(el, 'validateImmediate');
			//是否需要校验
			var ifNeedValidate = _self.configReader(el, 'ifNeedValidate');
			//取得最终的validators
			elValidators = _self.getValidators(el);
			//校验字段不为空则启动校验
			var isTrimedEmpty = (YL.trim(el.value) == null) || (YL.trim(el.value).length == 0);

			//如果需要立即校验 && ifNeedValidate开关为开 && 具有校验器 && （校验启动标志位为true || 字段不为空）
			if(validateImmediate && ifNeedValidate && elValidators && (_self.configData.fields[el.id].isInValidateProcess || !isTrimedEmpty)){
				//执行校验并取得校验结果
				var validateResult = _self.validateField(el, elValidators);

				var legaName,ruleName;
				if(validateResult.getItem() !== false && typeof(validateResult.getItem()) === 'object' && validateResult.getItem() !== null){
					legaName = validateResult.getItem().getName();
					ruleName = _self.configData.fields[el.id].validators[legaName].ruleName;
				}

				//把结果和出错信息存入数据结构中
				_self.configData.fields[el.id].statusResult = !validateResult.isError();
				_self.configData.fields[el.id].statusMsg = validateResult.getContent();
				//调用改变字段class方法
				_self.displayFuncPool[displayFuncs['showStatus']](el, _self.configData.fields[el.id].statusResult);
				//得到需要出现的msg
				var msg = _self.configData.fields[el.id].statusMsg;
				//如果当前验证结果不为true时就显示错误
				if(!_self.configData.fields[el.id].statusResult){
					//调用显示错误的方法
					var advice = _self.displayFuncPool[displayFuncs['getErrorAdvice']](el);
					_self.displayFuncPool[displayFuncs['showErrorMsg']](el, advice, msg, ruleName);
				} else {
					_self.displayFuncPool[displayFuncs['closeErrorMsg']](el);
				}
			}

			//触发无校验器事件
			if( validateImmediate && ifNeedValidate && !elValidators && _self.configData.fields[el.id].isInValidateProcess){
				var returnMsg = new AE.widget.message();
						returnMsg.init();
						returnMsg['result'] = true;
						returnMsg['msg'] = '';
					_self.customEvent['afterFieldBlurNotValidators'].fire(el.id, returnMsg );
			}

			//调用关闭消息提示方法
			if(_self.configData.fields[el.id].tipsMsg && _self.configData.fields[el.id].tipsClose != false){
				_self.displayFuncPool[displayFuncs['closeTipsMsg']](el);
			}


		},
		default_focus: function(ev, el){
			var displayFuncs = _self.configReader(el, 'displayFuncMap');
			//获取advice
			var advice = _self.displayFuncPool[displayFuncs['getTipsAdvice']](el);
			/*
			//聚焦时显示TIPS
			if(_self.configData.fields[el.id].tipsMsg && _self.configData.fields[el.id].statusResult == undefined){
				_self.displayFuncPool[displayFuncs['showTipsMsg']](el, advice, _self.configData.fields[el.id].tipsMsg);
			}
			*/
			for(var f in _self.allTipsAdvisor){
				YUD.setStyle(_self.allTipsAdvisor[f], 'display', 'none');
			}
			if(_self.configData.fields[el.id].tipsMsg){
				_self.displayFuncPool[displayFuncs['showTipsMsg']](el, advice, _self.configData.fields[el.id].tipsMsg);
				_self.displayFuncPool[displayFuncs['closeErrorMsg']](el);
			}

		},
		default_keydown: function(ev, el){
			//设置校验启动标志位为true
			if(ev.keyCode != 9){
				_self.configData.fields[el.id].isInValidateProcess = true;
			}
		},
		default_click: function(ev, el){
			if(_self.isSpecialField(el)){
				_self.configData.fields[el.id].isInValidateProcess = true;
			}
		},
		//表单提交时，批量验证静态方法
		default_submit: function(ev){
			if (!_self.validateAllField()) YUE.stopEvent(ev);
		},
		//重置表单时回复初始状态
		default_reset: function(ev){
			for(var t in _self.allTipsAdvisor){
				YUD.setStyle(_self.allTipsAdvisor[t], 'display', 'none');
			}
			for(var e in _self.allErrorAdvisor){
				YUD.setStyle(_self.allErrorAdvisor[e], 'display', 'none');
			}
			var fieldSuccessClass,fieldFailClass,el;
			for(var f in _self.configData.fields){
				el = get(f);
				fieldSuccessClass = _self.configReader(el, 'fieldSuccessClass');
				fieldFailClass = _self.configReader(el, 'fieldFailClass');
				YUD.removeClass(el, fieldSuccessClass);
				YUD.removeClass(el, fieldFailClass);
			}
			_self.configData.errorFromServerCount = 0;
			_self.configData.errorFromServer = {};
		}
	}



	_self.formEventRegist = function(){
		//注册onsubmit事件
		YUE.on(_self.formObj, 'submit', _self.eventFuncPool['default_submit']);
		//注册onsubmit事件
		YUE.on(_self.formObj, 'reset', _self.eventFuncPool['default_reset']);
	}


	//初始化form
	_self.init = function(formId, userConfig){
		//把form对象保存在formObj中
		//把配置转化为数据
		//初始化提交出错次数
		//初始化服务器错误容器
		//初始化服务器错误次数，将来要改进
		//把所有配置好的field的引用存入_self.allFields

		_self.initWithoutEvent(formId, userConfig);

		//执行注册事件
		_self.fieldsEventHandle(_self.allFields, 'add');
		_self.formEventRegist();

		/*
		////////////////////////////////////// 动态添加字段 test /////////////
		_self.addValidateFields(addFieldsConfig);
		_self.addValidateFields(addFieldsConfig22);

		_self.delValidateFields('business_email')

		////////////////////////////////////// 动态添加字段 test /////////////
		*/

	};


	_self.initWithoutEvent = function(formId, userConfig){
		//把form对象保存在formObj中
		_self.formObj = get(formId);

		//把配置转化为数据
		_self.configData = YL.merge(defConfig, userConfig || {});

		//保证fields字段配置至少为空
		if(_self.configData.fields === undefined){
			_self.configData.fields = {};
		}

		//初始化提交出错次数
		_self.configData.errorSubmitTime = 0;

		//初始化服务器错误容器
		_self.configData.errorFromServer = {};

		//初始化服务器错误次数，将来要改进
		_self.configData.errorFromServerCount = 0;


		//把所有配置好的field的引用存入_self.allFields
		_self.getAllFields();

		//窗口resize时重定位信息框
		YUE.on(window,'resize',function(){
			setTimeout(_self.displayFuncPool['repositionAdvice'], 300);
		});

		/*
		////////////////////////////////////// 动态添加字段 test /////////////
		_self.addValidateField(addFieldsConfig);
		_self.addValidateField(addFieldsConfig22);

		////////////////////////////////////// 动态添加字段 test /////////////
		*/

	};



	/*
	//////////////////////////////////////// 动态添加字段 test /////////////

	var addFieldsConfig = {
		'city':{
			tipsMsg:'city的tips',
			validators:{
				v1:{
					ruleName:'notEmpty',
					params:[],
					errorMsg: 'city能为空！'
				}
			}
		}
	}

	var addFieldsConfig22 = {
		'street_address':{
			tipsMsg:'street_address手动阀撒旦法',
			validators:{
				v1:{
					ruleName:'notEmpty',
					params:[],
					errorMsg: 'street_address能为空！'
				}
			}
		},
		'province':{
			tipsMsg:'provinceTIps',
			validators:{
				v1:{
					ruleName:'notEmpty',
					params:[],
					errorMsg: 'province能为空！'
				}
			}
		}
	}



	//////////////////////////////////////// 动态添加字段 test /////////////
	*/


	//动态添加fields
	_self.addValidateField = function(fieldsConfig){
		_self.configData.fields = depthMerge(_self.configData.fields, fieldsConfig);

		//把所有配置好的field的引用存入_self.allFields
		var aFields = _self.addFields( fieldsConfig );

		_self.fieldsEventHandle( aFields, 'add');


		var elId = '';
		_self.customEvent['onAfterAddValidateField'].fire(fieldsConfig);
	}

	//动态删除fields
	_self.delValidateField = function(fid){
		var field = get(fid);
		for(var func in _self.configData.eventFuncMap){
			//取消所有注册事件
			YUE.removeListener(field, func);
		}
		if(_self.configData.fields[fid] !== undefined){
			//从fields的配置中除去该字段
			delete _self.configData.fields[fid];
		}

		if(_self.allFields[fid] !== undefined){
			//从fields的引用中除去该字段
			delete _self.allFields[fid];
		}

		if(_self.allErrorAdvisor[fid] !== undefined ){
			  //从fields的错误容器中除去该字段
			delete _self.allErrorAdvisor[fid];
		}

		YUD.setStyle(_self.allTipsAdvisor[fid], 'display', 'none');
		YUD.setStyle(_self.allErrorAdvisor[fid], 'display', 'none');

		_self.customEvent['onAfterDelValidateField'].fire(fid);
	}

	//对字段的事件注册或取消
	_self.fieldsEventHandle = function(els, mType){
		var eventFuncMap;
		var targetEl;
		for(var f in els){

			eventFuncMap = _self.configReader(els[f], 'eventFuncMap');
			//如果该字段是checkbox或者radio,做特殊处理
			//当checkbox或者radio字段配置里有needLoop:false时，则不会被注册事件，否则将循环注册相应事件。
			if(_self.isCheckBoxOrRadio(els[f])){
				targetEl = document.getElementsByName(els[f].name);
				var i=0,len=targetEl.length;
				while(i<len){
					if(!YL.isUndefined(_self.configData.fields[targetEl[i].id]) && _self.configData.fields[targetEl[i].id].needLoop == false){
						targetEl = toArray(targetEl);
						targetEl.splice(i,1);
						len--;
						continue;
					}
					i++;
				}
			} else {
				targetEl = els[f];
			}
			for(var func in eventFuncMap){
				if(YL.isFunction(_self.eventFuncPool[eventFuncMap[func]])){
					if(mType == 'add'){
						YUE.on(targetEl, func, _self.eventFuncPool[eventFuncMap[func]], els[f]);
					}
					if(mType == 'remove'){
						YUE.removeListener(targetEl, func, _self.eventFuncPool[eventFuncMap[func]]);
					}
				}
			}
		}
	}
};