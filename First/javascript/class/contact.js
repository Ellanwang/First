/**
 * 通讯录交互类
 * (c) Copyright 2017 Xiaoxiao Wang All Rights Reserved.
 * 2017-10-30
 */
var contact ={
	contactIndex: {
		Initialization: function (){
			//菜单初始化
			common.menusInitialization();
			//列表初始化
			contact.contactIndex.page_list(1);
			contact.contactIndex.deptDropList();
			contact.contactIndex.deptDropList1();
			//contact.contactIndex.roleDropList();
			
			//初始化查询按钮
			$('#search-btn').click(function (){
				contact.contactIndex.page_list(1);
				//contact.contactIndex.deptDropList();
			});
			$('#addContact').click(function (){
				common.showPopbox("新增通讯录", $('#addNew'), function (){
					//初始化值
					$('#username').val('');
					$('#deptNo').val('');
					$('#position').val('');
					$('#telNo').val('');
					$('#address').val('');
				}, function (layerIndex){
					if($('.newUser').validationEngine('validate')){
						var param = {};
						param.userName = $('#username').val();
						param.deptId = $('#deptNo option:selected').val();
						param.userJob = $('#position').val();
						param.userTel = $('#telNo').val();
						param.userAddr = $('#address').val();
						
						webserver.query(param, apipath.contact.contactList.add, methods.add, contact.contactIndex.callback_search);
						layer.close(layerIndex);
					}
					
				});
				
			});

			$('#outfile').click(function(){
				window.open(apipath.contact.exportBtn.output+'?userId='+common.cookies.get('!@#2017hd_userId')+'&token='+common.cookies.get('!@#2017hd_token')+'&deptId='+$('#select-dept option:selected').val()+'&userJob='+$('#search-position').val()+'&name='+$('#search-name').val());
			});
			
			$('#infile').click(function (){
				common.showPopbox('上传文件', $('#addNew1'),function(){},function(){
					if($('#fileform').validationEngine('validate')){
                        common.upload($("#file"),'file',apipath.contact.importBtn.input+'?userId='+common.cookies.get('!@#2017hd_userId')+'&token='+common.cookies.get('!@#2017hd_token'), function(err,data,layerIndex){

                            layer.close(layerIndex);
                        });
                    }
                });
			});
			$('body').delegate('#delUser','click', function(e){
				e.stopPropagation();
            	e.preventDefault();
            	
            	var name = $(e.currentTarget).parent().parent().find('td.userName').text();
            	common.showConfirm('请您确认以下信息:','您将删除通讯录 :' + name, function(){
            		
            	}, function(){
            		var id = $(e.currentTarget).parent().parent().find('td.userId').text();
            		webserver.query(null, apipath.contact.contactList.delete + id, methods.delete);
            	})
			});
			
			$('body').delegate('#rewUser','click', function(e){
				e.stopPropagation();
            	e.preventDefault();
            	
            	var id = $(e.currentTarget).parent().parent().find('td.userId').text();
            	var details = $.Deferred();
            	
            	contact.contactIndex.showContactDel(details, id);
            	$.when(details).done(function (v1) {
            		common.showPopbox('修改通讯录信息', $('#addNew'), function(){
            			//设置初始值
            			$('#username').val(v1.userName);
						$('#deptNo').val(v1.deptId);
						$('#position').val(v1.userJob);
						$('#telNo').val(v1.userTel);
						$('#address').val(v1.userAddr);
            		}, function(layerIndex1){	
            			if($('.newUser').validationEngine('validate')){
            			layer.close(layerIndex1);
            			var param={};
            			param.userName = $('#username').val();
            			param.deptId = $('#deptNo option:selected').val()
            			param.userJob = $('#position').val();
            			param.userTel = $('#telNo').val();
            			param.userAddr = $('#address').val();
            			webserver.query(param, apipath.contact.contactList.edit+id, methods.edit, function(err,data, layerIndex2){
            				window.location.reload();
            			});
            			}
            		});
            	});
			});
			
		},
		showContactDel: function(d, id){
			webserver.query(null, apipath.contact.contactList.single + id, methods.search, function(err, data, layerIndex){
				layer.close(layerIndex);
				if(d){
					d.resolve(data);
				}
			});
		},
		page_list: function(current_page){
			var param = {
				page : current_page,
				rows : pagination.contact_rows_count
			};
			//相关查询条件
			param.name = $('#search-name').val();
			param.deptId = $('#select-dept option:selected').val();
			param.userJob = $('#search-position').val();
			
			webserver.query(param, apipath.contact.contactList.list, methods.search, contact.contactIndex.callback_search);
			
		},
		deptDropList: function () {
			var param = {
				page:1,
				rows:pagination.deptDropList_rows_count
			};
			webserver.query(param, apipath.contact.deptList.list, methods.search, function(err, data, layerIndex){
				var html = '<option value="">全部</option>';
				for (var i = 0; i < data.list.length; i++) {
					html = html + '<option value="' + data.list[i].deptId + '">'+ data.list[i].deptName + '</option>';
				}
			 $('#select-dept').html(html);
			 //$('#deptNo').html(html);
			 layer.close(layerIndex);
			});
		},
		deptDropList1: function () {
			var param = {
				page:1,
				rows:pagination.deptDropList_rows_count
			};
			webserver.query(param, apipath.contact.deptList.list, methods.search, function(err, data, layerIndex){
				var html = '';
				for (var i = 0; i < data.list.length; i++) {
					html = html + '<option value="' + data.list[i].deptId + '">'+ data.list[i].deptName + '</option>';
				}
			 //$('#select-dept').html(html);
			 $('#deptNo').html(html);
			 layer.close(layerIndex);
			});
		},
		callback_search: function(err, data, layerIndex){
			var html = '';
			if(data.total && data.total > 0){
				html = html + 
					'<tr>' + 
						'<th width="10%">序号</th>' +
						'<th width="10%">姓名</th>' + 
						'<th width="10%">部门</th>' +
						'<th width="10%">职位</th>' +
						'<th width="10%">联系电话</th>' + 
						'<th width="10%">住址</th>' +
						'<th width="10%">操作</th>' +
					'</tr>';
				for (var i = 0; i < data.list.length; i++) {
					html = html + 
						'<tr>' + 
							'<td class="userId">' + data.list[i].userId + '</td>' +
							'<td class="userName">' + data.list[i].userName + '</td>' +
							'<td>' + data.list[i].deptName + '</td>' +
							'<td>' + data.list[i].userJob + '</td>' +
							'<td>' + data.list[i].userTel + '</td>' +
							'<td>' + data.list[i].userAddr + '</td>' +
							'<td><button class="btn-delete" id="delUser">删除</button>' + ' ' +
                        		'<button class="btn-details" id="rewUser">修改</button>' +'</td>' +
						'</tr>';
					}

				}//调用分页
            pagination.Initialization(data.total, pagination.contact_rows_count, data.pageNum, contact.contactIndex.page_list);
				$('#contact-box').html(html);
				layer.close(layerIndex);
			
		},
		
		
		
	}
}
