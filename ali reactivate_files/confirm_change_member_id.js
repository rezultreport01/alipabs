confirmChangeMemberId=function(e,wh){
var content='<p class="m">Welcome Mr. xxx xxx:</p>';
content+='<p>This is the first time you log into your account. You current member ID: xxxxxxx</p>';
content+='<p>Now you have a only chance to customize your member ID for easy memorizing. (Member ID wlll be used for site login and TradeManager login.)</p>';
content+='<ul><li><strong>If you want to contiue to use the old Member ID, <a href="#">close this window now</a>.</strong></li>';
content+='<li><strong>If you want to customize a new Member ID, please type it in the box below.</strong>';
content+='<input value="xxxxxxx" />';
content+='<input type="button" value="Submit" />';
content+='<div class="error">This Member ID has already been used, please type a new one and try again.</div></li></ul>';
var boxTitle="title";
	msgBox.xWindow(content,wh,boxTitle); //显示对话框
	}


	