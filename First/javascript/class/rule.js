/**
 * 制度交互类
 * (c) Copyright 2017 Xiaoxiao Wang All Rights Reserved.
 * 2017-10-30
 */

var rules = {
    ruleIndex: {
        Initialization: function () {
            //菜单初始化
            common.menusInitialization();
            //初始化列表
            rules.ruleIndex.page_list(1);
            rules.ruleIndex.deptDropList();
            rules.ruleIndex.compDropList();
            rules.ruleIndex.compDropList1();

            //初始化搜索按钮
            $('#search').click(function(){
            	rules.ruleIndex.page_list(1);
            });
            //添加类型事件
                $('#typeAdd').click(function () {
                    common.showPopbox('新增公司名称', $('#types_add'), function () {
                    }, function (layerIndex) {
                        layer.close(layerIndex);
                        if ($('.types-form').validationEngine('validate')) {
                            var param = {};
                            param.compName = $('#types_add input[name="typename"]').val();
                            webserver.query(param, apipath.rules.ruleType.add, methods.add,function(err,data,layerindex){
                                common.showTimeMsg(0,data);
                                layer.close(layerindex);
                            });
                        }
                    });
                });
                //删除类型
                $('#typeDel').click(function () {
                    var chk_value = []; //定义一个数组
                    $('#company_type_list input[type="checkbox"]:checked').each(function () { //遍历每一个名字为interest的复选框，其中选中的执行函数

                        chk_value.push({
                            id: $(this).val(),
                            name: $(this).next('label').text()
                        }); //将选中的值添加到数组chk_value中
                    });
                    if (chk_value.length === 0) {
                        layer.msg('请您至少选择一项进行删除', {
                            icon: 0
                        });
                        return;
                    }
                    var namearr = new Array();
                    var idarr = new Array();
                    for (var i = 0; i < chk_value.length; i++) {
                        namearr.push(chk_value[i]["name"]);
                        idarr.push(chk_value[i]["id"]);
                    }
                    common.showConfirm('请您确认以下信息：', '您将删除公司名称：' + namearr.join('、'), function () {
                    }, function () {
                        var param = {};
                        webserver.query(param, apipath.rules.ruleType.delete + idarr.join(','), methods.delete);
                    });
                });

                /**修改类型按钮**/
                $('#typeDetail').click(function () {
                    var chk_value = []; //定义一个数组
                    $('#company_type_list input[type="checkbox"]:checked').each(function () { //遍历每一个名字为interest的复选框，其中选中的执行函数
                        chk_value.push({
                            id: $(this).attr('class'),
                            name: $(this).attr('value')
                        }); //将选中的值添加到数组chk_value中
                    });
                    if (chk_value.length !== 1) {
                        layer.msg('请您选择一项进行修改', {
                            icon: 0
                        });
                        return;
                    }
                    common.showPopbox('修改公司名称', $('#types_add'), function () {
                        $('#typename').val(chk_value[0]["name"]);
                    }, function (layerIndex) {
                        layer.close(layerIndex);
                        // if ($('#typename').val() !== '') {
                        var param = {};
                        param.compName = $('#typename').val();
                        if ($('.types-form').validationEngine('validate')) {
                            webserver.query(param, apipath.rules.ruleType.edit + chk_value[0]["id"], methods.edit,function(err,data,layerindex){
                                common.showTimeMsg(0,data);
                                layer.close(layerindex);
                            });
                        }
                        // }
                    });

                });

            //预置按钮事件
            $("body").delegate(".btn-delete", "click", function (e) {
                e.stopPropagation();
                e.preventDefault();
                var name = $(e.currentTarget).parent().parent().find('p').text();
                common.showConfirm('请您确认以下信息:', '您将删除制度' + name, function () {
                }, function () {
                    var id = $(e.currentTarget).parent().find('.regimeId').text();
                    webserver.query(null, apipath.rules.ruleIndex.delete + id, methods.delete);
                });
            });
            //修改按钮事件
            $("body").delegate(".btn-details", "click", function (e) {
                e.stopPropagation();
                e.preventDefault();

                var ruleID = $(e.currentTarget).parent().find('.regimeId').text();
                var details = $.Deferred();

                rules.ruleIndex.showRuleDetail(details, ruleID);

                $.when(details).done(function (v1) {

                    common.showPopbox('修改制度信息', $('#submit-file1'), function () {
                        //设置初始值
                        $('#modifyFile').val(v1.regimeTitle);

                    }, function (layerIndex) {
                    	if($('#modifytitle').validationEngine('validate')){
	                        var param = {};
	                        param.regimeTitle = $('#modifyFile').val();
	                        //param.regimeStatus = "0";
	                        webserver.query(param, apipath.rules.ruleIndex.edit + ruleID, methods.edit);
	                        layer.close(layerIndex);
	                    }
                    });

                });

            });

            //初始化上传按钮
            $('#submit-btn').click(function () {
                common.showPopbox('①上传文件', $('#submit-file'), function () {
                }, function (layerIndex1) {
                    if($('#upload').validationEngine('validate')) {
                        var maxSize = 10;
                        var uploadfile = $('#multipartFile');
                        var size = uploadfile[0].files[0].size;
                        var fileSize = ( size / 1024 / 1024).toFixed(2);
                        if (fileSize < maxSize) {
                            layer.close(layerIndex1);

                            common.upload($("#multipartFile"), 'multipartFile', apipath.rules.ruleUpload.upload + '?userId=' + common.cookies.get('!@#2017hd_userId') + '&token=' + common.cookies.get('!@#2017hd_token'), function (err, data, layerIndex) {

                                layer.close(layerIndex);

                                common.showPopbox('②制度信息', $('#file-detail'), function () {

                                }, function (layerIndex2) {
                                    if ($('#uploadrule').validationEngine('validate')) {
                                        var param = {};
                                        param.uploadId = data.uploadId;
                                        param.deptId = $('#department').val();
                                        param.regimeTime = Date.parse($('#updateTime').val());
                                        param.regimeTitle = $('#title').val();
                                        param.compId = $('#companyList option:selected').val();
                                        webserver.query(param, apipath.rules.ruleIndex.add, methods.add);
                                        layer.close(layerIndex2);
                                    }
                                });
                            });
                        } else {
                            common.showTimeMsg('0','文件大小不可超过10M!');
                            return;
                        }
                    }
                });
            });
        },
        page_list: function (current_page) {
            var param = {
                page: current_page,
                rows: pagination.rules_rows_count
            };
            param.compId = $('#companySort option:selected').val();
            webserver.query(param, apipath.rules.ruleIndex.list, methods.search, rules.ruleIndex.callback_search);
        },
        callback_search: function (err, data, layerIndex) {
        	$('#list-box-show').html('');
            var html = '';
            if (data.total && data.total > 0) {
                for (var i = 0; i < data.list.length; i++) {
                    html = html +
                        '<li>' +
                        '<a href="'+common.cutUrl(data.list[i].uploadAddress)+'">' +
                        '<ul class="list-one">' +
                        '<li class="hys">' +
                        '<p>' + data.list[i].regimeTitle + '</p>' +
                        common.myDate.dateFormat(data.list[i].regimeTime, 'yyyy-MM-dd hh:mm:ss') + '&nbsp;&nbsp;&nbsp;&nbsp;' + data.list[i].deptName + '&nbsp;&nbsp;&nbsp;&nbsp;' +(data.list[i].compName?data.list[i].compName:'<span class="lightGrey">(无)</span>')+
                        '</li>' +
                        '<li class="zt">' +
                        '<span class="regimeId" style="display: none">' + data.list[i].regimeId + '</span>' +
                        '<button class="btn-delete">删除</button>' + ' ' +
                        '<button class="btn-details">修改</button>' +
                        '</li>' +
                        '</ul>' +
                        '</a>' +
                        '</li>';
                }
                $('#list-box-show').html(html);

            }
            pagination.Initialization(data.total, pagination.rules_rows_count, data.pageNum, rules.ruleIndex.page_list);
            layer.close(layerIndex);
            
        },
        showRuleDetail: function (d, ruleID) {
            //获取指定的制度
            webserver.query(null, apipath.rules.ruleIndex.single + ruleID, methods.search, function (err, data, layerIndex) {
                layer.close(layerIndex);
                if (d) {
                    d.resolve(data);
                }
            });
        },
        deptDropList: function () {
			var param = {
				page:1,
				rows:pagination.deptDropList_rows_count
			};
			webserver.query(param, apipath.contact.deptList.list, methods.search, function(err, data, layerIndex){
				var html = '';
				for (var i = 0; i < data.list.length; i++) {
					html = html + '<option value="' + data.list[i].deptId + '">'+ data.list[i].deptName + '</option>';
				}

			 $('#department').html(html);
			 layer.close(layerIndex);
			});
		},
		compDropList: function () {
			var param = {
				page:1,
				rows:pagination.deptDropList_rows_count
			};
			webserver.query(param, apipath.rules.ruleType.list, methods.search, function(err, data, layerIndex){
				var html = '<option value="">全部</option>';
				for (var i = 0; i < data.list.length; i++) {
					html = html + '<option value="' + data.list[i].compId + '">'+ data.list[i].compName + '</option>';
				}

			 $('#companySort').html(html);
			 
			 layer.close(layerIndex);
			});
		},
		compDropList1: function () {
			var param = {
				page:1,
				rows:pagination.deptDropList_rows_count
			};
			webserver.query(param, apipath.rules.ruleType.list, methods.search, function(err, data, layerIndex){
				var html = '';
				var compType = '';
				for (var i = 0; i < data.list.length; i++) {
					html = html + '<option value="' + data.list[i].compId + '">'+ data.list[i].compName + '</option>';
					compType = compType + '<input name="compType" id="class' + (i + 1)+ '" value="' + data.list[i].compId + '" type="checkbox" /><label for="class' + (i+1) + '">' + data.list[i].compName + '</label>';
				}
			$('#company_type_list').html(compType);
			 $('#companyList').html(html);
			 layer.close(layerIndex);
			});
		},
    }
}