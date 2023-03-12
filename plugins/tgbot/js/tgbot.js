function appPost(method, args,callback){
    var loadT = layer.msg('正在获取...', { icon: 16, time: 0, shade: 0.3 });

    var req_data = {};
    req_data['name'] = 'tgbot';
    req_data['func'] = method;
 
    if (typeof(args) == 'string'){
        req_data['args'] = JSON.stringify(toArrayObject(args));
    } else {
        req_data['args'] = JSON.stringify(args);
    }

    $.post('/plugins/run', req_data, function(data) {
        layer.close(loadT);
        if(typeof(callback) == 'function'){
            callback(data);
        }
    },'json'); 
}

function appPostCallbak(method, args,callback){
    var loadT = layer.msg('正在获取...', { icon: 16, time: 0, shade: 0.3 });

    var req_data = {};
    req_data['name'] = 'tgbot';
    req_data['func'] = method;
 
    if (typeof(args) == 'string'){
        req_data['args'] = JSON.stringify(toArrayObject(args));
    } else {
        req_data['args'] = JSON.stringify(args);
    }

    $.post('/plugins/callback', req_data, function(data) {
        layer.close(loadT);
        if (!data.status){
            layer.msg(data.msg,{icon:0,time:2000,shade: [0.3, '#000']});
            return;
        }

        if(typeof(callback) == 'function'){
            callback(data);
        }
    },'json'); 
}

function botConf(){
    appPost('get_bot_conf','',function(data){
        var rdata = $.parseJSON(data.data);
        var app_token = 'app_token';
        if(rdata['status']){
            db_data = rdata['data'];
            app_token = db_data['app_token'];

        }

        var mlist = '';
        mlist += '<p><span>app_token</span><input style="width: 250px;" class="bt-input-text mr5" name="app_token" value="'+app_token+'" type="text"><font>必填写</font></p>'
        var option = '<style>.conf_p p{margin-bottom: 2px}</style>\
            <div class="conf_p" style="margin-bottom:0">\
                ' + mlist + '\
                <div style="margin-top:10px; padding-right:15px" class="text-right">\
                    <button class="btn btn-success btn-sm" onclick="submitBotConf()">保存</button>\
                </div>\
            </div>';
        $(".soft-man-con").html(option);
    });
}

function submitBotConf(){
    var pull_data = {};
    pull_data['app_token'] = base64_encode($('input[name="app_token"]').val());
    appPost('set_bot_conf',pull_data,function(data){
        var rdata = $.parseJSON(data.data);
        layer.msg(rdata['msg'],{icon:rdata['status']?1:2,time:2000,shade: [0.3, '#000']});
    });
}


function botExtList(){
    var body = '<div class="divtable mtb10">\
            <table class="table table-hover" width="100%" cellspacing="0" cellpadding="0" border="0">\
                <thead>\
                    <tr>\
                        <th width="20">脚本</th>\
                        <th width="120">类型</th>\
                        <th width="10">状态</th>\
                        <th style="text-align: right;" width="50">操作</th>\
                    </tr>\
                </thead>\
                <tbody id="ext_list"></tbody>\
            </table>\
            <div class="dataTables_paginate paging_bootstrap pagination">\
                <ul id="ext_list_page" class="page"></ul>\
            </div>\
        </div>';
    $('.soft-man-con').html(body);


    botExtListP(1)
}
function botExtListP(p=1){
    appPost('bot_ext_list',{'page':p}, function(rdata){
        var rdata = $.parseJSON(rdata.data);
        var tBody = '';

        if (rdata.data.length == 0 ){
            var tBody = '<tr><td colspan="4"><div style="text-align:center;">无数据</div></td></tr>';
        }

        var ldata = rdata.data;
        for (var i = 0; i < ldata.length; i++) {
            tBody += '<tr data-id="'+ldata[i]['name']+'">'
            tBody += '<td>'+ldata[i]['id']+'</td>';
            tBody += '<td>'+ldata[i]['name']+'</td>';

            if (ldata[i]['status'] == 'start'){
                tBody += '<td><span style="color:#20a53a;cursor: pointer;"  class="strategy_status glyphicon glyphicon-play"></span></td>';
            } else{
                tBody += '<td><span style="color:red;cursor: pointer;" class="strategy_status glyphicon glyphicon-pause"></span></td>';
            }
            
            tBody += "<td style='text-align: right;'><a class='btlink restart'>重启</a> | <a class='btlink edit'>编辑</a></td>";
            tBody +='<tr>';
        };
        $('#ext_list').html(tBody);
        // $('#strategy_list_page').html(rdata.data.list);


        // $('#strategy_list .strategy_status').click(function(){
        //     var id = $(this).parent().parent().data('id');
        //     var status = 'stop';
        //     if ($(this).hasClass('glyphicon-pause')){
        //         status = 'start';
        //     }
        //     setStrategyStatus(id,status);
        // });

        // $('#strategy_list .restart').click(function(){
        //     var id = $(this).parent().parent().data('id');
        //     setStrategyRestart(id);
        // });

        // $('#strategy_list .edit').click(function(){
        //     var id = $(this).parent().parent().data('id');
        //     setStrategyEdit(id);
        // });
    });
}
