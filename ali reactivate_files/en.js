 
var IL={
	comma:", ",
	fullStop:". ",
	colon:": ",
	
	//base begin
	ok:"Ok",
	cancel:"Cancel",
	yes:"Yes",
	no:"No",
	//base end
	
	//rich text editor begin
	editSource:" Edit HTML source ",
	noColor:" No color please ",
	plsInputUrl:" Please input URL of the link: ",
	plsInputUrlContent:" Please input content of the link ",
	wordNum:" Characters: ",
	reverseWordNum:"Characters Remaining: ",
	character:" character ",
	characters:" characters",
	toReset:"reset",
	most:" max ",
	letter:" character ",
	hintLetter:" character(s)",
	charNumLimited:" The information you filled exceeds the limit. ",
	toLong:"Your Detailed Description is too long. To delete all information, click ",
	plsModify:" Please modify the information ",
	bold:" Bold ",
	italic:" Italic ",
	underline:" Underline ",
	superscript:" Superscript ",
	subscript:" Subscript ",
	insertLink:" Insert link ",
	insertImage:" Insert Image ",
	uploadImage:" Upload Photo ",
	undo:" Undo ",
	redo:" Redo ",
	align:" Justify ",
	list:" Numbered list/bulleted list ",
	outdent:" Outdent ",
	indent:" Indent ",
	font:" Font ",
	plsSelect:" Please select ",
	fontSize:" Size ",
	fontColor:' Font color ',
	backColor:' background color ',
	cut:" Cut ",
	copy:" Copy ",
	paste:" Paste ",
	alignLeft:"Align Left", 
	alignCenter:"Center", 
	alignRight:"Align Right", 
	orderList:"Numbered list", 
	unorderList:"Bulleted list",
	plsTryAgain:" Please try again ",
	processing:" Processing now ",
	uploading:" uploading now ",
	plsWait:" Please wait ",
	uploadFaild:" Upload failed ",
	clearCode:" Clear spam code ",
	ifCodeTooLong:" Please reset editor if it is too long",
	insertSpecialCode:" Add Special Character(s) ",
	resetEditor:" Delete all information ",
	doNotPutHTML:'Do not enter HTML or Contact Details in this box',
	selectPhotoFromPhotoBank:'Select photo from photo bank',
	uploadPhotoToPhotoBank:'Upload photo to photo bank',
	photoBank:'Photo bank',
	//rte end
	
	//reorder begin
	pageNumOut:" Page exceeds the limit ",
	plsInput:" Please input ",
	to:"to",
	innerNumber:" numbers from ",
	doTooFast:" You operate too fast ",
	savingDate:" Saving data now ",
	wantLeave:"Data is not saved, do you want leave and save data?",
	//reorder end
	
	//upload_dynamic_images.js begin
	cantPreview:" Can't preview ",
	//upload_dynamic_images.js end

	// wholesale post form - standard
	postFormStandards:{
		standardsTitle:"Product Price",
		errorMessage1:"Please enter numbers between 1 and 100,000 (no decimal points).",
		errorMessage2:"Please enter your Quantity Range.",
		errorMessage3:"The end value in your Quantity Range must be higher than the start value – e.g. 1-10 (1 is the start value; and 10 is the end value).",
		errorMessage4:"Please enter numbers between 1 and 100,000 (no decimal points).",
		errorMessage5:"Please enter your Quantity Range.",
		errorMessage6:"Please enter numbers between 0.01 and 100,000.00.",
		errorMessage7:"Your highest Quantity Range X Your Price must not exceed US$1,000,000.",
		errorMessage8:"Please enter Your Price.",
		errorMessage9:"Please enter a Delivery Time between 1 – 60 days (no decimal points).",
		errorMessage10:"The product specification can not be repeated."
	},
	// wholesale post form - standard
	
	
	// wholesale post form - logistic
	postFormLogistic:{
		customTitle:"Custom Settings",
		free:"Free",
		custom:"Custom",
		standard:"Standard",
		discount:"Discount",
		plsInput:"please enter",
		reInput:"please re-enter",
		nowSelected:"Selected Countries/Regions:",
		errorMessage1:"The minimum purchasing quantity has to be a number between 1 and 99999999.",
		errorMessage2:"The minimum purchasing quantity has to be a number between 1 and 99999999.",
		errorMessage3:"The value you entered is wrong.",
		errorMessage4:"The value you entered is wrong; please try again, Accurate to two decimal places.",
		errorMessage5:"The Per Additional Units has to be a number between 1 and 99999999.",
		errorMessage6:"The value you entered is wrong; please try again, Accurate to two decimal places.",
		errorMessage7:"The discount rate has to be an integer between 0 and 99.",
		save:"Save"
	}
	// wholesale post form - logistic

	
	
	};
YUE.onDOMReady(function(){
	try{
		var message=YUD.getElementsByClassName('width960', 'div');
		if(message.length!=0){
			message[0].innerHTML="Important notice: The old version of My AliExpress will be permanently unavailable after a system upgrade on 1 Mar 2011 (GMT +8). We apologize for any inconvenience this may cause.";
			message[0].style.display="block";
			message[0].style.fontSize="11px";
		}
	}catch(e){
		
	}
});