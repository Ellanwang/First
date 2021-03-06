/**
 * 修改用户信息交互类
 * (c) Copyright 2017 Xiaoxiao Wang All Rights Reserved.
 * 2017-11-02
 */

var reNew = {
	userAlter : {
		Initialization: function (){
		//菜单初始化
        common.menusInitialization();
        reNew.userAlter.list();
        reNew.userAlter.noticeList(1);
        
        $('body').delegate(".icon-bj","click", function(e){
        	//阻止冒泡
        	e.stopPropagation();
            e.preventDefault();
            var user = JSON.parse(common.cookies.get('!@#2017hd_user'));
            //var user = common.cookies.get("!@#2017hd_user");
            var userId = JSON.parse(common.cookies.get("!@#2017hd_userId"));
            var details = $.Deferred();
            
            reNew.userAlter.showUserDeL(details, userId);
            
            $.when(details).done(function(v1) {
            	common.showPopbox('修改个人信息', $('#modifyInfo'), function(){
            	//初始化
            	$('#currName').val(v1.userName);
            	$('#telephone').val(v1.userTel);
            	$('#address1').val(v1.userAddr);
            	
            }, function (layerIndex){
            	var param = {};
            	//var userId = common.cookies.get("!@#2017hd_userId");
            	//param.userAccount = user.userAccount;
            	param.userAccount = $('#currName').val();
            	//param.userSex = user.userSex;
            	//param.deptId = user.deptId;
            	//param.userJob = user.userJob;
            	param.userTel = $('#telephone').val();
            	param.userAddr = $('#address1').val();
            	param.userId = userId;

           		webserver.query(param, apipath.users.modifyUser.edit + userId, methods.edit);
            });
        });
            
            
           
        });
        $('body').delegate("#alertBtn","click", function(e){
        	//阻止冒泡
        	e.stopPropagation();
            e.preventDefault();
            	var user = JSON.parse(common.cookies.get('!@#2017hd_user'));
            	var userId = JSON.parse(common.cookies.get("!@#2017hd_userId"));
            	common.showPopbox('修改密码', $('#modifypass'), function(){
            		$('#oldPass').val('');
            		$('#newPass').val('');
            		$('#rePass').val('');
            	}, function (layerIndex){
            		if($('#renewPass').validationEngine('validate')){
	            		var param = {};
	            		//var oldpwd = $('#oldPass').val();
	            		if($('#newPass').val()==$('#rePass').val()){
	            			param.newPwd = md5($('#newPass').val()).toLocaleLowerCase();
	            			param.userPassword = md5($('#oldPass').val()).toLocaleLowerCase();
	            		}
	            		webserver.query(param, apipath.users.modifyUser.edit + userId, methods.edit);
            		}
            	});

        });

        
        $('body').delegate("#notice","click", function(e){
        	e.stopPropagation();
            e.preventDefault();
           
            
        	common.showPopbox('通知消息', $('#message'), function(){
        		 }, function(err, data, layerIndex){

        	});
        });
        
        $('body').delegate(".noticeList", "click", function(e){
        	var msgId = $(e.currentTarget).find('span.mid').text();
        	var param = {};
        	param.umId = msgId;
        	
        	webserver.query(param, apipath.users.notice.edit + msgId, methods.edit);
        	$(e.currentTarget).find('i.r-p').hide();
        });
       
	},
	list: function(){
		var param = {};
		var uid =common.cookies.get("!@#2017hd_userId");
		param.id = uid;
		webserver.query(param, apipath.users.userIndex.single + uid, methods.search, reNew.userAlter.callback_search);
	},
	noticeList: function(cu) {
		var param = {
			page : cu,
			rows : 1000, 
		};
		
		webserver.query(param, apipath.users.notice.list, methods.search, reNew.userAlter.callback_notice);
	},
	
	showUserDeL: function(d, userid){
		webserver.query(null, apipath.users.modifyUser.single + userid, methods.search, function(err, data, layerIndex){
			layer.close(layerIndex);
			if(d){
				d.resolve(data);
			}
		});
	},
	
	callback_search: function(err, data, layerIndex){
		var html = '';
		html = '<img class="head-img" src="../../images/pic1.png" />' +
				'<p class="name"><span id="curr_user">' + data.userName + '</span><a class="icon-bj" href="#"></a></p>' +
				'<p class="place" id="telNum">' + data.userTel + '</p>' + 
				'<p class="place" id="place">' + data.userAddr + '</p>' +
				'<div class="btn-tops">' + 
					'<button id="alertBtn">修改密码</button>'	 + 
					'<button id="notice">通知消息</button>' +
					'<i class="red-point"></i>' +
				'</div>';
		$('.personal-box').html(html);
		layer.close(layerIndex);
	},
	callback_notice : function(err, data, layerIndex){
		var html = ''
		if(data.total && data.total > 0){
			for (var i = 0; i < data.list.length; i++) {
				html = html + 
					'<li class="noticeList">'+
						'<a href="#">' +
							'<span style="display:none" class="mid">' +data.list[i].umId+'</span>'+
							'<i class="r-p r-p-new"></i>' + data.list[i].msg + '</a></li>';
			}
		}
		$('.tz-box').html(html);
		layer.close(layerIndex);
	}
	
	},
	
}