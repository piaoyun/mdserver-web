function isURL(str_url){
	var strRegex = '^(https|http|ftp|rtsp|mms)?://.+';
	var re=new RegExp(strRegex);
	if (re.test(str_url)){
		return (true);
	}else{
		return (false);
	}
}

var num = 0;
//查看任务日志
function getLogs(id){
	layer.msg('正在获取,请稍候...',{icon:16,time:0,shade: [0.3, '#000']});
	var data='&id='+id;
	$.post('/crontab/logs', data, function(rdata){
		layer.closeAll();
		if(!rdata.status) {
			layer.msg(rdata.msg,{icon:2, time:2000});
			return;
		};
		layer.open({
			type:1,
			title:lan.crontab.task_log_title,
			area: ['60%','500px'], 
			shadeClose:false,
			closeBtn:2,
			content:'<div class="setchmod bt-form pd20 pb70">'
					+'<pre id="crontab-log" style="overflow: auto; border: 0px none; line-height:23px;padding: 15px; margin: 0px; white-space: pre-wrap; height: 405px; background-color: rgb(51,51,51);color:#f1f1f1;border-radius:0px;font-family:"></pre>'
					+'<div class="bt-form-submit-btn" style="margin-top: 0px;">'
					+'<button type="button" class="btn btn-success btn-sm" onclick="closeLogs('+id+')">清空</button>'
					+'<button type="button" class="btn btn-danger btn-sm" onclick="layer.closeAll()">关闭</button>'
				    +'</div>'
					+'</div>'
		});

		setTimeout(function(){
			$("#crontab-log").text(rdata.msg);
		},200);
	},'json');
}

function getCronData(){
	var load = layer.msg(lan.public.the,{icon:16,time:0,shade: [0.3, '#000']});
	$.post('/crontab/list', '', function(rdata){
		layer.close(load);
		console.log(rdata);
		var cbody = "";
		if(rdata == ""){
			cbody="<tr><td colspan='6'>"+lan.crontab.task_empty+"</td></tr>";
		}else{
			for(var i=0;i<rdata.data.length;i++){
				//状态
				var status = rdata.data[i]['status'] == '1'? '正常':'停用';

				cbody += "<tr>\
							<td><input type='checkbox' onclick='checkSelect();' title='"+rdata.data[i].name+"' name='id' value='"+rdata.data[i].id+"'></td>\
							<td>"+rdata.data[i].name+"</td>\
							<td>"+status+"</td>\
							<td>"+rdata.data[i].type+"</td>\
							<td>"+rdata.data[i].cycle+"</td>\
							<td>-</td>\
							<td>--</td>\
							<td>"+rdata.data[i].addtime+"</td>\
							<td>\
								<a href=\"javascript:startTask("+rdata.data[i].id+");\" class='btlink'>执行</a> | \
								<a href=\"javascript:editTaskInfo('"+rdata.data[i].id+"');\" class='btlink'>编辑</a> | \
								<a href=\"javascript:getLogs("+rdata.data[i].id+");\" class='btlink'>日志</a> | \
								<a href=\"javascript:planDel("+rdata.data[i].id+" ,'"+rdata.data[i].name.replace('\\','\\\\').replace("'","\\'").replace('"','')+"');\" class='btlink'>删除</a>\
							</td>\
						</tr>";
			}
		}
		$('#cronbody').html(cbody);
	},'json');
}

//执行任务脚本
function startTask(id){
	layer.msg('正在处理,请稍候...',{icon:16,time:0,shade: [0.3, '#000']});
	var data='id='+id;
	$.post('/crontab/start_task',data,function(rdata){
		layer.closeAll();
		layer.msg(rdata.msg,{icon:rdata.status?1:2});
	},'json');
}


//清空日志
function closeLogs(id){
	layer.msg('正在处理,请稍候...',{icon:16,time:0,shade: [0.3, '#000']});
	var data='id='+id;
	$.post('/crontab/del_logs',data,function(rdata){
		layer.closeAll();
		layer.msg(rdata.msg,{icon:rdata.status?1:2});
	},'json');
}


//删除
function planDel(id,name){
	safeMessage(lan.get('del',[name]),'您确定要删除该任务吗?',function(){
		var load = layer.msg('正在处理,请稍候...',{icon:16,time:0,shade: [0.3, '#000']});
		var data='id='+id;
		$.post('/crontab/del',data,function(rdata){
			layer.close(load);
			showMsg(rdata.msg, function(){
				getCronData();
			},{icon:rdata.status?1:2,time:2000});
		},'json');
	});
}

//批量删除
function allDeleteCron(){
	var checkList = $("input[name=id]");
	var dataList = new Array();
	for(var i=0;i<checkList.length;i++){
		if(!checkList[i].checked) continue;
		var tmp = new Object();
		tmp.name = checkList[i].title;
		tmp.id = checkList[i].value;
		dataList.push(tmp);
	}
	SafeMessage(lan.crontab.del_task_all_title,"<a style='color:red;'>"+lan.get('del_all_task',[dataList.length])+"</a>",function(){
		layer.closeAll();
		syncDeleteCron(dataList,0,'');
	});
}

//模拟同步开始批量删除数据库
function syncDeleteCron(dataList,successCount,errorMsg){
	if(dataList.length < 1) {
		layer.msg(lan.get('del_all_task_ok',[successCount]),{icon:1});
		return;
	}
	var loadT = layer.msg(lan.get('del_all_task_the',[dataList[0].name]),{icon:16,time:0,shade: [0.3, '#000']});
	$.ajax({
			type:'POST',
			url:'/crontab?action=DelCrontab',
			data:'id='+dataList[0].id+'&name='+dataList[0].name,
			async: true,
			success:function(frdata){
				layer.close(loadT);
				if(frdata.status){
					successCount++;
					$("input[title='"+dataList[0].name+"']").parents("tr").remove();
				}else{
					if(!errorMsg){
						errorMsg = '<br><p>'+lan.crontab.del_task_err+'</p>';
					}
					errorMsg += '<li>'+dataList[0].name+' -> '+frdata.msg+'</li>'
				}
				
				dataList.splice(0,1);
				syncDeleteCron(dataList,successCount,errorMsg);
			}
	});
}

	
function isURL(str_url){
	var strRegex = '^(https|http|ftp|rtsp|mms)?://.+';
	var re=new RegExp(strRegex);
	if (re.test(str_url)){
		return (true);
	}else{
		return (false);
	}
}


//提交
function planAdd(){
	var name = $(".planname input[name='name']").val();
	if(name == ''){
		$(".planname input[name='name']").focus();
		layer.msg('任务名称不能为空!',{icon:2});
		return;
	}
	$("#set-Config input[name='name']").val(name);
	
	var type = $(".plancycle").find("b").attr("val");
	$("#set-Config input[name='type']").val(type);
	
	var where1 = $("#ptime input[name='where1']").val();
	var is1;
	var is2 = 1;
	switch(type){
		case 'day-n':
			is1=31;
			break;
		case 'hour-n':
			is1=23;
			break;
		case 'minute-n':
			is1=59;
			break;
		case 'month':
			is1=31;
			break;
	}
	
	if(where1 > is1 || where1 < is2){
		$("#ptime input[name='where1']").focus();
		layer.msg('表单不合法,请重新输入!',{icon:2});
		return;
	}
	
	$("#set-Config input[name='where1']").val(where1);
	
	var hour = $("#ptime input[name='hour']").val();
	if(hour > 23 || hour < 0){
		$("#ptime input[name='hour']").focus();
		layer.msg('小时值不合法!',{icon:2});
		return;
	}
	$("#set-Config input[name='hour']").val(hour);
	var minute = $("#ptime input[name='minute']").val();
	if(minute > 59 || minute < 0){
		$("#ptime input[name='minute']").focus();
		layer.msg('分钟值不合法!',{icon:2});
		return;
	}
	$("#set-Config input[name='minute']").val(minute);
	
	var save = $("#save").val();
	if(save < 0){
		layer.msg('不能有负数!',{icon:2});
		return;
	}
	
	$("#set-Config input[name='save']").val(save);
	
	
	$("#set-Config input[name='week']").val($(".planweek").find("b").attr("val"));
	var sType = $(".planjs").find("b").attr("val");
	var sBody = encodeURIComponent($("#implement textarea[name='sBody']").val());
	
	if(sType == 'toFile'){
		if($("#viewfile").val() == ''){
			layer.msg(lan.crontab.input_file_err,{icon:2});
			return;
		}
	}else{
		if(sBody == ''){
			$("#implement textarea[name='sBody']").focus();
			layer.msg(lan.crontab.input_script_err,{icon:2});
			return;
		}
	}
	
	var urladdress = $("#urladdress").val();
	if(sType == 'toUrl'){
		if(!isURL(urladdress)){
			layer.msg(lan.crontab.input_url_err,{icon:2});
			$("implement textarea[name='urladdress']").focus();
			return;
		}
	}
	urladdress = encodeURIComponent(urladdress);
	$("#set-Config input[name='urladdress']").val(urladdress);
	$("#set-Config input[name='sType']").val(sType);
	$("#set-Config textarea[name='sBody']").val(decodeURIComponent(sBody));
	
	if(sType == 'site' || sType == 'database'){
		var backupTo = $(".planBackupTo").find("b").attr("val");
		$("#backupTo").val(backupTo);
	}
	
	
	var sName = $("#sName").attr("val");
	
	if(sName == 'backupAll'){
		var alist = $("ul[aria-labelledby='backdata'] li a");
		var dataList = new Array();
		for(var i=1;i<alist.length;i++){
			var tmp = alist[i].getAttribute('value');
			dataList.push(tmp);
		}
		if(dataList.length < 1){
			layer.msg(lan.crontab.input_empty_err,{icon:5});
			return;
		}
		
		allAddCrontab(dataList,0,'');
		return;
	}
	
	$("#set-Config input[name='sName']").val(sName);
	layer.msg(lan.public.the_add,{icon:16,time:0,shade: [0.3, '#000']});
	var data= $("#set-Config").serialize() + '&sBody='+sBody + '&urladdress=' + urladdress;
	$.post('/crontab/add',data,function(rdata){
		if(!rdata.status) {
			layer.msg(rdata.msg,{icon:2, time:2000});
			return;
		}
		layer.closeAll();
		layer.msg(rdata.msg,{icon:rdata.status?1:2});
		getCronData();
	},'json');
}

//批量添加任务
function allAddCrontab(dataList,successCount,errorMsg){
	if(dataList.length < 1) {
		layer.msg(lan.get('add_all_task_ok',[successCount]),{icon:1});
		return;
	}
	var loadT = layer.msg(lan.get('add',[dataList[0]]),{icon:16,time:0,shade: [0.3, '#000']});
	var sType = $(".planjs").find("b").attr("val");
	var minute = parseInt($("#set-Config input[name='minute']").val());
	var hour = parseInt($("#set-Config input[name='hour']").val());
	var sTitle = (sType == 'site')?lan.crontab.backup_site:lan.crontab.backup_database;
	if(sType == 'logs') sTitle = lan.crontab.backup_log;
	minute += 5;
	if(hour !== '' && minute > 59){
		if(hour >= 23) hour = 0;
		$("#set-Config input[name='hour']").val(hour+1);
		minute = 5;
	}
	$("#set-Config input[name='minute']").val(minute);
	$("#set-Config input[name='name']").val(sTitle + '['+dataList[0]+']');
	$("#set-Config input[name='sName']").val(dataList[0]);
	var pdata = $("#set-Config").serialize() + '&sBody=&urladdress=';
	$.ajax({
			type:'POST',
			url:'/crontab/add',
			data:pdata,
			async: true,
			success:function(frdata){
				layer.close(loadT);
				if(frdata.status){
					successCount++;
					getCronData();
				}else{
					if(!errorMsg){
						errorMsg = '<br><p>'+lan.crontab.backup_all_err+'</p>';
					}
					errorMsg += '<li>'+dataList[0]+' -> '+frdata.msg+'</li>'
				}
				
				dataList.splice(0,1);
				allAddCrontab(dataList,successCount,errorMsg);
			}
	});
}

$(".dropdown ul li a").click(function(){
	var txt = $(this).text();
	var type = $(this).attr("value");
	$(this).parents(".dropdown").find("button b").text(txt).attr("val",type);
	switch(type){
		case 'day':
			closeOpt();
			toHour();
			toMinute();
			break;
		case 'day-n':
			closeOpt();
			toWhere1(lan.crontab.day);
			toHour();
			toMinute();
			break;
		case 'hour':
			closeOpt();
			toMinute();
			break;
		case 'hour-n':
			closeOpt();
			toWhere1(lan.crontab.hour);
			toMinute();
			break;
		case 'minute-n':
			closeOpt();
			toWhere1(lan.crontab.minute);
			break;
		case 'week':
			closeOpt();
			toWeek();
			toHour();
			toMinute();
			break;
		case 'month':
			closeOpt();
			toWhere1(lan.crontab.sun);
			toHour();
			toMinute();
			break;
		case 'toFile':
			toFile();
			break;
		case 'toShell':
			toShell();
			$(".controls").html(lan.crontab.sbody);
			break;
		case 'rememory':
			rememory();
			$(".controls").html(lan.public.msg);
			break;
		case 'site':
			toBackup('sites');
			$(".controls").html(lan.crontab.backup_site);
			break;
		case 'database':
			toBackup('databases');
			$(".controls").html(lan.crontab.backup_database);
			break;
		case 'logs':
			toBackup('logs');
			$(".controls").html(lan.crontab.log_site);
			break;
		case 'toUrl':
			toUrl();
			$(".controls").html(lan.crontab.url_address);
			break;
	}
})


//备份
function toBackup(type){
	var sMsg = "";
	switch(type){
		case 'sites':
			sMsg = lan.crontab.backup_site;
			sType = "sites";
			break;
		case 'databases':
			sMsg = lan.crontab.backup_database;
			sType = "databases";
			break;
		case 'logs':
			sMsg = lan.crontab.backup_log;
			sType = "sites";
			break;
	}
	var data='type='+sType
	$.post('/crontab?action=GetDataList',data,function(rdata){
		$(".planname input[name='name']").attr('readonly','true').css({"background-color":"#f6f6f6","color":"#666"});
		var sOpt = "";
		if(rdata.data.length == 0){
			layer.msg(lan.public.list_empty,{icon:2})
			return
		}
		for(var i=0;i<rdata.data.length;i++){
			if(i==0){
				$(".planname input[name='name']").val(sMsg+'['+rdata.data[i].name+']');
			}
			sOpt += '<li><a role="menuitem" tabindex="-1" href="javascript:;" value="'+rdata.data[i].name+'">'+rdata.data[i].name+'['+rdata.data[i].ps+']</a></li>';			
		}
		
		var orderOpt = ''
		for (var i=0;i<rdata.orderOpt.length;i++){
			orderOpt += '<li><a role="menuitem" tabindex="-1" href="javascript:;" value="'+rdata.orderOpt[i].value+'">'+rdata.orderOpt[i].name+'</a></li>'
		}
		
		

		var sBody = '<div class="dropdown pull-left mr20">\
					  <button class="btn btn-default dropdown-toggle" type="button" id="backdata" data-toggle="dropdown" style="width:auto">\
						<b id="sName" val="'+rdata.data[0].name+'">'+rdata.data[0].name+'['+rdata.data[0].ps+']</b> <span class="caret"></span>\
					  </button>\
					  <ul class="dropdown-menu" role="menu" aria-labelledby="backdata">\
					  	<li><a role="menuitem" tabindex="-1" href="javascript:;" value="backupAll">'+lan.public.all+'</a></li>\
					  	'+sOpt+'\
					  </ul>\
					</div>\
					<div class="textname pull-left mr20">备份到</div>\
					<div class="dropdown planBackupTo pull-left mr20">\
					  <button class="btn btn-default dropdown-toggle" type="button" id="excode" data-toggle="dropdown" style="width:auto;">\
						<b val="localhost">服务器磁盘</b> <span class="caret"></span>\
					  </button>\
					  <ul class="dropdown-menu" role="menu" aria-labelledby="excode">\
						<li><a role="menuitem" tabindex="-1" href="javascript:;" value="localhost">服务器磁盘</a></li>\
						'+ orderOpt +'\
					  </ul>\
					</div>\
					<div class="textname pull-left mr20">保留最新</div><div class="plan_hms pull-left mr20 bt-input-text">\
					<span><input type="number" name="save" id="save" value="3" maxlength="4" max="100" min="1"></span>\
					<span class="name">份</span>\
					</div>';
		$("#implement").html(sBody);
		getselectname();
		$(".dropdown ul li a").click(function(){
			var sName = $("#sName").attr("val");
			if(!sName) return;
			$(".planname input[name='name']").val(sMsg+'['+sName+']');
		});
	});
}


// 编辑计划任务
function editTaskInfo(id){
	layer.msg('正在获取,请稍候...',{icon:16,time:0,shade: [0.3, '#000']});
	$.post('/crontab/get_crond_find',{id:id},function(rdata){
		layer.closeAll();
		var sTypeName = '',sTypeDom = '',cycleName = '',cycleDom = '',weekName = '',weekDom = '',sNameName ='',sNameDom = '',backupsName = '',backupsDom ='';
		obj = {
			from:{
				id:rdata.id,
				name: rdata.name,
				type: rdata.type,
				where1: rdata.where1,
				hour: rdata.where_hour,
				minute: rdata.where_minute,
				week: rdata.where1,
				stype: rdata.stype,
				sbody: rdata.sbody,
				sname: rdata.sname,
				backup_to: rdata.backup_to,
				save: rdata.save,
				urladdress: rdata.urladdress,
			},
			sTypeArray:[['toShell','Shell脚本'],['site','备份网站'],['database','备份数据库'],['logs','日志切割'],['path','备份目录'],['rememory','释放内存'],['toUrl','访问URL']],
			cycleArray:[['day','每天'],['day-n','N天'],['hour','每小时'],['hour-n','N小时'],['minute-n','N分钟'],['week','每星期'],['month','每月']],
			weekArray:[[1,'周一'],[2,'周二'],[3,'周三'],[4,'周四'],[5,'周五'],[6,'周六'],[7,'周日']],
			sNameArray:[],
			backupsArray:[],
			create:function(callback){
				console.log(obj);
				for(var i = 0; i <obj['sTypeArray'].length; i++){
					if(obj.from['stype'] == obj['sTypeArray'][i][0]){
						sTypeName  = obj['sTypeArray'][i][1];
					}
					sTypeDom += '<li><a role="menuitem"  href="javascript:;" value="'+ obj['sTypeArray'][i][0] +'">'+ obj['sTypeArray'][i][1] +'</a></li>';
				}

				for(var i = 0; i <obj['cycleArray'].length; i++){
					if(obj.from['type'] == obj['cycleArray'][i][0])  cycleName  = obj['cycleArray'][i][1];
					cycleDom += '<li><a role="menuitem"  href="javascript:;" value="'+ obj['cycleArray'][i][0] +'">'+ obj['cycleArray'][i][1] +'</a></li>';
				}

				for(var i = 0; i <obj['weekArray'].length; i++){
					if(obj.from['week'] == obj['weekArray'][i][0])  weekName  = obj['weekArray'][i][1];
					weekDom += '<li><a role="menuitem"  href="javascript:;" value="'+ obj['weekArray'][i][0] +'">'+ obj['weekArray'][i][1] +'</a></li>';
				}

				if(obj.from.stype == 'site' || obj.from.stype == 'database' || obj.from.stype == 'path' || obj.from.stype == 'logs'){
					$.post('/crontab?action=GetDataList',{type:obj.from.stype  == 'databases'?'database':'sites'},function(rdata){
						obj.sNameArray = rdata.data;
						obj.sNameArray.unshift({name:'ALL',ps:'所有'});
						obj.backupsArray = rdata.orderOpt;
						obj.backupsArray.unshift({name:'服务器磁盘',value:'localhost'});
						for(var i = 0; i <obj['sNameArray'].length; i++){
							if(obj.from['sName'] == obj['sNameArray'][i]['name'])  sNameName  = obj['sNameArray'][i]['ps'];
							sNameDom += '<li><a role="menuitem"  href="javascript:;" value="'+ obj['sNameArray'][i]['name'] +'">'+ obj['sNameArray'][i]['ps'] +'</a></li>';
						}
						for(var i = 0; i <obj['backupsArray'].length; i++){
							if(obj.from['backupTo'] == obj['backupsArray'][i]['value'])  backupsName  = obj['backupsArray'][i]['name'];
							backupsDom += '<li><a role="menuitem"  href="javascript:;" value="'+ obj['backupsArray'][i]['value'] +'">'+ obj['backupsArray'][i]['name'] +'</a></li>';
						}
						callback();
					});
				}else{
					callback();
				}
			}
		};
		obj.create(function(){
			layer.open({
				type:1,
				title:'编辑计划任务-['+rdata.name+']',
				area: ['850px','450px'], 
				skin:'layer-create-content',
				shadeClose:false,
				closeBtn:2,
				content:'<div class="setting-con ptb20">\
								<div class="clearfix plan ptb10">\
									<span class="typename c4 pull-left f14 text-right mr20">任务类型</span>\
									<div class="dropdown stype_list pull-left mr20">\
										<button class="btn btn-default dropdown-toggle" type="button" id="excode" data-toggle="dropdown" style="width:auto" disabled="disabled">\
											<b val="'+ obj.from.type +'">'+ sTypeName +'</b>\
											<span class="caret"></span>\
										</button>\
										<ul class="dropdown-menu" role="menu" aria-labelledby="sType">'+ sTypeDom +'</ul>\
									</div>\
								</div>\
								<div class="clearfix plan ptb10">\
									<span class="typename c4 pull-left f14 text-right mr20">任务名称</span>\
									<div class="planname pull-left"><input type="text" name="name" class="bt-input-text sName_create" value="'+ obj.from.name +'"></div>\
								</div>\
								<div class="clearfix plan ptb10">\
									<span class="typename c4 pull-left f14 text-right mr20">执行周期</span>\
									<div class="dropdown  pull-left mr20">\
										<button class="btn btn-default dropdown-toggle cycle_btn" type="button" data-toggle="dropdown" style="width:94px">\
											<b val="'+ obj.from.stype +'">'+ cycleName +'</b>\
											<span class="caret"></span>\
										</button>\
										<ul class="dropdown-menu" role="menu" aria-labelledby="cycle">'+ cycleDom +'</ul>\
									</div>\
									<div class="pull-left optional_week">\
										<div class="dropdown week_btn pull-left mr20" style="display:'+ (obj.from.type == "week"  ?'block;':'none') +'">\
											<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" >\
												<b val="'+ obj.from.week +'">'+ weekName +'</b> \
												<span class="caret"></span>\
											</button>\
											<ul class="dropdown-menu" role="menu" aria-labelledby="week">'+ weekDom +'</ul>\
										</div>\
										<div class="plan_hms pull-left mr20 bt-input-text where1_input" style="display:'+ (obj.from.type == "day-n" || obj.from.type == 'month' ?'block;':'none') +'"><span><input type="number" name="where1" class="where1_create" value="'+obj.from.where1 +'" maxlength="2" max="23" min="0"></span> <span class="name">日</span> </div>\
										<div class="plan_hms pull-left mr20 bt-input-text hour_input" style="display:'+ (obj.from.type == "day" || obj.from.type == 'day-n' || obj.from.type == 'hour-n' || obj.from.type == 'week' || obj.from.type == 'month'?'block;':'none') +'"><span><input type="number" name="hour" class="hour_create" value="'+ ( obj.from.type == 'hour-n' ? obj.from.where1 : obj.from.hour ) +'" maxlength="2" max="23" min="0"></span> <span class="name">时</span> </div>\
										<div class="plan_hms pull-left mr20 bt-input-text minute_input"><span><input type="number" name="minute" class="minute_create" value="'+ (obj.from.type == 'minute-n' ? obj.from.where1 : obj.from.minute)+'" maxlength="2" max="59" min="0"></span> <span class="name">分</span> </div>\
									</div>\
								</div>\
								<div class="clearfix plan ptb10 site_list" style="display:none">\
									<span class="typename controls c4 pull-left f14 text-right mr20">'+ sTypeName  +'</span>\
									<div style="line-height:34px"><div class="dropdown pull-left mr20 sName_btn" style="display:'+ (obj.from.sType != "path"?'block;':'none') +'">\
										<button class="btn btn-default dropdown-toggle" type="button"  data-toggle="dropdown" style="width:auto" disabled="disabled">\
											<b id="sName" val="'+ obj.from.sname +'">'+ sNameName +'</b>\
											<span class="caret"></span>\
										</button>\
										<ul class="dropdown-menu" role="menu" aria-labelledby="sName">'+ sNameDom +'</ul>\
									</div>\
									<div class="info-r" style="float: left;margin-right: 25px;display:'+ (obj.from.sType == "path"?'block;':'none') +'">\
										<input id="inputPath" class="bt-input-text mr5 " type="text" name="path" value="'+ obj.from.sName +'" placeholder="备份目录" style="width:208px;height:33px;" disabled="disabled">\
									</div>\
									<div class="textname pull-left mr20">备份到</div>\
										<div class="dropdown  pull-left mr20">\
											<button class="btn btn-default dropdown-toggle backup_btn" type="button"  data-toggle="dropdown" style="width:auto;">\
												<b val="'+ obj.from.backup_to +'">'+ backupsName +'</b>\
												<span class="caret"></span>\
											</button>\
											<ul class="dropdown-menu" role="menu" aria-labelledby="backupTo">'+ backupsDom +'</ul>\
										</div>\
										<div class="textname pull-left mr20">保留最新</div>\
										<div class="plan_hms pull-left mr20 bt-input-text">\
											<span><input type="number" name="save" class="save_create" value="'+ obj.from.save +'" maxlength="4" max="100" min="1"></span><span class="name">份</span>\
										</div>\
									</div>\
								</div>\
								<div class="clearfix plan ptb10"  style="display:'+ (obj.from.stype == "toShell"?'block;':'none') +'">\
									<span class="typename controls c4 pull-left f14 text-right mr20">脚本内容</span>\
									<div style="line-height:34px"><textarea class="txtsjs bt-input-text sBody_create" name="sBody">'+ obj.from.sbody +'</textarea></div>\
								</div>\
								<div class="clearfix plan ptb10" style="display:'+ (obj.from.stype == "rememory"?'block;':'none') +'">\
									<span class="typename controls c4 pull-left f14 text-right mr20">提示</span>\
									<div style="line-height:34px">释放PHP、MYSQL、PURE-FTPD、APACHE、NGINX的内存占用,建议在每天半夜执行!</div>\
								</div>\
								<div class="clearfix plan ptb10" style="display:'+ (obj.from.stype == "toUrl"?'block;':'none') +'">\
									<span class="typename controls c4 pull-left f14 text-right mr20">URL地址</span>\
									<div style="line-height:34px"><input type="text" style="width:400px; height:34px" class="bt-input-text url_create" name="urladdress"  placeholder="URL地址" value="'+ obj.from.urladdress +'"></div>\
								</div>\
								<div class="clearfix plan ptb10">\
									<div class="bt-submit plan-submits " style="margin-left: 141px;">保存编辑</div>\
								</div>\
							</div>'
			});
			setTimeout(function(){
				if(obj.from.stype == 'toShell'){
					$('.site_list').hide();
				}else if(obj.from.stype == 'rememory'){
					$('.site_list').hide();
				}else if( obj.from.stype == 'toUrl'){
					$('.site_list').hide();
				}else{
					$('.site_list').show();
				}

				$('.sName_create').blur(function () {
					obj.from.name = $(this).val();
				});
				$('.where1_create').blur(function () {
					obj.from.where1 = $(this).val();
				});
	
				$('.hour_create').blur(function () {
					obj.from.hour = $(this).val();
				});
	
				$('.minute_create').blur(function () {
					obj.from.minute = $(this).val();
				});
	
				$('.save_create').blur(function () {
					obj.from.save = $(this).val();
				});
	
				$('.sBody_create').blur(function () {
					obj.from.sBody = $(this).val();
				});
				$('.url_create').blur(function () {
					obj.from.urladdress = $(this).val();
				});
	
				$('[aria-labelledby="cycle"] a').unbind().click(function () {
					$('.cycle_btn').find('b').attr('val',$(this).attr('value')).html($(this).html());
					var type = $(this).attr('value');
					switch(type){
						case 'day':
							$('.week_btn').hide();
							$('.where1_input').hide();
							$('.hour_input').show().find('input').val('1');
							$('.minute_input').show().find('input').val('30');
							obj.from.week = '';
							obj.from.type = '';
							obj.from.hour = 1;
							obj.from.minute = 30;
						break;
						case 'day-n':
							$('.week_btn').hide();
							$('.where1_input').show().find('input').val('1');
							$('.hour_input').show().find('input').val('1');
							$('.minute_input').show().find('input').val('30');
							obj.from.week = '';
							obj.from.where1 = 1;
							obj.from.hour = 1;
							obj.from.minute = 30;
						break;
						case 'hour':
							$('.week_btn').hide();
							$('.where1_input').hide();
							$('.hour_input').hide();
							$('.minute_input').show().find('input').val('30');
							obj.from.week = '';
							obj.from.where1 = '';
							obj.from.hour = '';
							obj.from.minute = 30;
						break;
						case 'hour-n':
							$('.week_btn').hide();
							$('.where1_input').hide();
							$('.hour_input').show().find('input').val('1');
							$('.minute_input').show().find('input').val('30');
							obj.from.week = '';
							obj.from.where1 = '';
							obj.from.hour = 1;
							obj.from.minute = 30;
						break;
						case 'minute-n':
							$('.week_btn').hide();
							$('.where1_input').hide();
							$('.hour_input').hide();
							$('.minute_input').show();
							obj.from.week = '';
							obj.from.where1 = '';
							obj.from.hour = '';
							obj.from.minute = 30;
						break;
						case 'week':
							$('.week_btn').show();
							$('.where1_input').hide();
							$('.hour_input').show();
							$('.minute_input').show();
							obj.from.week = 1;
							obj.from.where1 = '';
							obj.from.hour = 1;
							obj.from.minute = 30;
						break;
						case 'month':
							$('.week_btn').hide();
							$('.where1_input').show();
							$('.hour_input').show();
							$('.minute_input').show();
							obj.from.week = '';
							obj.from.where1 = 1;
							obj.from.hour = 1;
							obj.from.minute = 30;
						break;
					}
					obj.from.type = $(this).attr('value');
				});
	
				$('[aria-labelledby="week"] a').unbind().click(function () {
					$('.week_btn').find('b').attr('val',$(this).attr('value')).html($(this).html());
					obj.from.week = $(this).attr('value');
				});
	
				$('[aria-labelledby="backupTo"] a').unbind().click(function () {
					$('.backup_btn').find('b').attr('val',$(this).attr('value')).html($(this).html());
					obj.from.backupTo = $(this).attr('value');
				});
				$('.plan-submits').unbind().click(function(){
					if(obj.from.type == 'hour-n'){
						obj.from.where1 = obj.from.hour;
						obj.from.hour = '';
					}else if(obj.from.type == 'minute-n'){
						obj.from.where1 = obj.from.minute;
						obj.from.minute = '';
					}
					layer.msg('正在保存编辑内容，请稍后...',{icon:16,time:0,shade: [0.3, '#000']});
					$.post('/crontab/modify_crond',obj.from,function(rdata){
						layer.closeAll();
						getCronData();
						layer.msg(rdata.msg,{icon:rdata.status?1:2});
					},'json');
				});
			},100);
		});
	},'json');
}


//下拉菜单名称
function getselectname(){
	$(".dropdown ul li a").click(function(){
		var txt = $(this).text();
		var type = $(this).attr("value");
		$(this).parents(".dropdown").find("button b").text(txt).attr("val",type);
	});
}
//清理
function closeOpt(){
	$("#ptime").html('');
}
//星期
function toWeek(){
	var mBody = '<div class="dropdown planweek pull-left mr20">\
					  <button class="btn btn-default dropdown-toggle" type="button" id="excode" data-toggle="dropdown">\
						<b val="1">'+lan.crontab.TZZ1+'</b> <span class="caret"></span>\
					  </button>\
					  <ul class="dropdown-menu" role="menu" aria-labelledby="excode">\
						<li><a role="menuitem" tabindex="-1" href="javascript:;" value="1">'+lan.crontab.TZZ1+'</a></li>\
						<li><a role="menuitem" tabindex="-1" href="javascript:;" value="2">'+lan.crontab.TZZ2+'</a></li>\
						<li><a role="menuitem" tabindex="-1" href="javascript:;" value="3">'+lan.crontab.TZZ3+'</a></li>\
						<li><a role="menuitem" tabindex="-1" href="javascript:;" value="4">'+lan.crontab.TZZ4+'</a></li>\
						<li><a role="menuitem" tabindex="-1" href="javascript:;" value="5">'+lan.crontab.TZZ5+'</a></li>\
						<li><a role="menuitem" tabindex="-1" href="javascript:;" value="6">'+lan.crontab.TZZ6+'</a></li>\
						<li><a role="menuitem" tabindex="-1" href="javascript:;" value="0">'+lan.crontab.TZZ7+'</a></li>\
					  </ul>\
					</div>';
	$("#ptime").html(mBody);
	getselectname()
}
//指定1
function toWhere1(ix){
	var mBody ='<div class="plan_hms pull-left mr20 bt-input-text">\
					<span><input type="number" name="where1" value="3" maxlength="2" max="31" min="0"></span>\
					<span class="name">'+ix+'</span>\
					</div>';
	$("#ptime").append(mBody);
}
//小时
function toHour(){
	var mBody = '<div class="plan_hms pull-left mr20 bt-input-text">\
					<span><input type="number" name="hour" value="1" maxlength="2" max="23" min="0"></span>\
					<span class="name">'+lan.crontab.hour+'</span>\
					</div>';
	$("#ptime").append(mBody);
}

//分钟
function toMinute(){
	var mBody = '<div class="plan_hms pull-left mr20 bt-input-text">\
					<span><input type="number" name="minute" value="30" maxlength="2" max="59" min="0"></span>\
					<span class="name">'+lan.crontab.minute+'</span>\
					</div>';
	$("#ptime").append(mBody);
	
}

//从文件
function toFile(){
	var tBody = '<input type="text" value="" name="file" id="viewfile" onclick="fileupload()" readonly="true">\
				<button class="btn btn-default" onclick="fileupload()">'+lan.public.upload+'</button>';
	$("#implement").html(tBody);
	$(".planname input[name='name']").removeAttr('readonly style').val("");
}

//从脚本
function toShell(){
	var tBody = "<textarea class='txtsjs bt-input-text' name='sBody'></textarea>";
	$("#implement").html(tBody);
	$(".planname input[name='name']").removeAttr('readonly style').val("");
}

//从脚本
function toUrl(){
	var tBody = "<input type='text' style='width:400px; height:34px' class='bt-input-text' name='urladdress' id='urladdress' placeholder='"+lan.crontab.url_address+"' value='http://' />";
	$("#implement").html(tBody);
	$(".planname input[name='name']").removeAttr('readonly style').val("");
}

//释放内存
function rememory(){
	$(".planname input[name='name']").removeAttr('readonly style').val("");
	$(".planname input[name='name']").val(lan.crontab.mem);
	$("#implement").html(lan.crontab.mem_ps);
	return;
}
//上传
function fileupload(){
	$("#sFile").change(function(){
		$("#viewfile").val($("#sFile").val());
	});
	$("#sFile").click();
}