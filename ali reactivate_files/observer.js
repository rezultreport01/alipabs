AE.namespace('AE.form.observer');

AE.form.observer = function(){
	var _self = this;
	
	//配置
	var config = {
		
		
		//当前页面校验框架实例名，用string格式
		formValidatorInstance : '',
		
		//COS服务器域名
		observerDomain : 'http://127.0.0.1',
		
		//服务端输出到页面上的数据结构（包括sessionId,stepId,unitId等）init的时候merge进来
		pageData: {},
		
		//不必传输内容的字段
		noContent: ['password','passwordConfirm'],
		
		//点的tag记录标识
		pointTag: '/point.html',
		
		//单字段的tag记录标识
		fieldTag: '/field.html',
		
		//快照的tag记录标识
		snapShotTag: '',
		
		//快照需要保存的字段标识，init的时候merge进来
		snapShotFields: []
	}
	
	//通过客户端校验框架传来的clientData和页面上的pageData拼出完整数据结构，如果得不到则返回false;
	_self.getData = function(clientData){
		var dataObj = false;
		if(clientData['result'] == false) {
			clientData['content'] = get(clientData['fieldId']).value.replace(/#/g, '%23');
			if(config.noContent.indexOf(clientData['fieldId']) >= 0 ){
				clientData['content']= '';
			}
			delete clientData['result'];
			dataObj = YL.merge(config.pageData, clientData);
		}
		return dataObj;
	}
	
	//发送数据到LOG
	_self.sendData = function(tag, dataObj){
		var tmpImg = new Image();
		var sURL = config.observerDomain; 
		sURL += tag+'?';
		for(var s in dataObj){
			if(sURL == config.observerDomain+tag+'?'){
				sURL += s+'='+encode(dataObj[s]);
			} else {
				sURL += '&'+s+'='+encode(dataObj[s]);
			}
		}
		sURL += '&ts='+_self.getTimeStamp();
		tmpImg.src = sURL;
	}
	
	//轮循得到checkbox或者radio的值
	_self.getRadioOrCheckboxValue = function(el){
		var s = '';
		var els = document.getElementsByName(el.name);
		var v;
		for(var i=0,j=els.length;i<j;i++){
			if(els[i].checked == true){
				v = els[i].value.replace(/#/g, '%23');
				if(s == ''){s += v}
				else{s += '||'+v}
			}
		}
		return s;
	}
	
	
	//得到完整的表单数据，无论字段正确或者错误。
	//具体采集哪些字段根据 snapShotFields里的配置决定。
	_self.getSnapData = function(){
		var snapData = {};
		var el;
		for(var i=0,j=config.snapShotFields.length;i<j;i++){
			el = get(config.snapShotFields[i]);
			if(el.type == 'radio' || el.type == 'checkbox'){
				snapData[el.id] = _self.getRadioOrCheckboxValue(el);
			} else {
				snapData[el.id] = el.value.replace(/#/g, '%23');
			}
		}
		
		snapData = YL.merge(config.pageData, snapData)
		
		return snapData;
	}
	
	//抓取快照
	_self.snapShot = function(){
		
		var snapData = _self.getSnapData();
		
		//_self.sendData(config.snapShotTag, snapData);
	}
	
	//数据采集
	_self.collectData = function(ev, args){
		if(args[1].getItem() == false){
			return false;
		}
		
        var clientData = {};
        clientData['fieldId'] = args[0];
        clientData['validatorName'] = args[1].getItem().getName();
        
        /* post性能优化打点采集 将出错字段和原因记录并打点 */
        if(typeof(ERRORFIELDS) !== 'undefined' && ERRORFIELDS !== null && typeof(ERRORREASONS) !== 'undefined' && ERRORREASONS !== null){
        	ERRORFIELDS.push(args[0]);
        	ERRORREASONS.push(args[1].getItem().getName());
        }
        
        clientData['result'] = !args[1].getItem().isError();
        var dataObj = _self.getData(clientData);
        if(dataObj){
            //_self.sendData(config.fieldTag, dataObj);
        }
	}
	
	//点log记录，外部可以直接掉该方法
	_self.logPoint = function(stepPoint, sc){
		
		var tmpImg = new Image();
		var sURL = config.observerDomain;
		sURL += config.pointTag+'?'; 
		for(var s in config.pageData){
			if(sURL == config.observerDomain+config.pointTag+'?'){
				sURL += s+'='+encode(config.pageData[s]);
			} else {
				sURL += '&'+s+'='+encode(config.pageData[s]);
			}
		}
		sURL += '&point='+stepPoint;
		sURL += '&sc='+sc;
		sURL += '&ts='+_self.getTimeStamp();
		tmpImg.src = sURL;
	}
	
	_self.getTimeStamp = function(){
	    var t = new Date();
	    return t.getTime();
	}
	
	_self.init = function(userConfig){
		config = YL.merge(config, userConfig || {});
		//与formValidator挂接
		if(config.formValidatorInstance){
			eval(config.formValidatorInstance).customEvent['afterValidateOneField'].subscribe(_self.collectData);
		}
	}
	
}