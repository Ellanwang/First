/*
 * 故障申报接口交互类
 * (c) Copyright 2017 XianGuan.HU. All Rights Reserved.
 * 2017-10-20
 */
(function () {
    informationRegistrationEvaluation = {
        informations: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                informationRegistrationEvaluation.informations.page_list(1);
                /*查询事件*/
                $('.search').click(function () {
                    informationRegistrationEvaluation.informations.page_list(1);
                });
            },
            page_list: function (current_page) {
                var param = {
                    "page": current_page,
                    "rows": pagination.informations_rows_count,
                    "appUser": $('#appUser').val(),
                    "appDate1": $('#appStartTime').val(),
                    "appDate2": $('#appEndTime').val(),
                    "checkUser": $('#checkUser').val(),
                    "checkDate1": $('#checkStartTime').val(),
                    "checkDate2": $('#checkEndTime').val()
                };
                webserver.query(param, apipath.informations.informations.list, methods.search, informationRegistrationEvaluation.informations.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    html =
                        '<tr>' +
                        '<th>故障编号</th>' +
                        '<th>故障申报人</th>' +
                        '<th>申报时间</th>' +
                        '<th>申报位置</th>' +
                        '<th>故障描述</th>' +
                        '<th>故障处理人</th>' +
                        '<th>处理时间</th>' +
                        '<th>故障确诊</th>' +
                        '<th>故障解决过程及方案</th>' +
                        '<th>当前状态</th>' +
                        '</tr>';
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<tr>' +
                            '<td>' + data.list[i].appId + '</td>' +
                            '<td>' + data.list[i].userName + '</td>' +
                            '<td>' + common.myDate.dateFormat(data.list[i].appDate, 'yyyy-MM-dd hh:mm:ss') + '</td>' +
                            '<td>' + data.list[i].appLoc + '</td>' +
                            '<td>' + data.list[i].appDesc + '</td>' +
                            '<td>' + data.list[i].checkName + '</td>' +
                            '<td>' + (data.list[i].checkDate?common.myDate.dateFormat(data.list[i].checkDate, 'yyyy-MM-dd hh:mm:ss'):'') + '</td>' +
                            '<td>' + data.list[i].checkConfirm + '</td>' +
                            '<td>' + data.list[i].checkDesc + '</td>' +
                            '<td>';
                        switch (data.list[i].appStatus) {
                            case 0:
                                html = html + '等待处理';
                                break;
                            case 1:
                                html = html + '正在处理';
                                break;
                            case 2:
                                html = html + '处理完毕';
                                break;
                        }
                        html = html + '</td>' +
                            '</tr>';
                    }

                } //调用分页
                pagination.Initialization(data.total, pagination.informations_rows_count, data.pageNum, informationRegistrationEvaluation.informations.page_list);
                $('.table-box').html(html);
                layer.close(layerIndex);
            }
        },
        declaring: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();/*绑定验证*/common.bindValidationEngine();
                /*初始化列表*/
                informationRegistrationEvaluation.declaring.page_list(1);
                /*添加事件*/
                $('.apply-btn').click(function () {
                    common.showPopbox('申报故障', $('#applyError'), function () {
                        var user = JSON.parse(common.cookies.get('!@#2017hd_user'));
                        $('#applyError .appUser').text(user.userName);
                        $('#appLoc').val('');
                        $('#appDes').val('');
                        $('#applyError .applyDate').text(common.myDate.dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss'));
                    }, function (layerindex) {
                        if ($('#applyErrorform').validationEngine('validate')) {
                            var params = {
                                "appDate": Date.parse($('#applyError .applyDate').text()),
                                "appDesc": $('#appDes').val(),
                                "appLoc": $('#appLoc').val()
                            };
                            webserver.query(params, apipath.informations.declaring.add, methods.add);
                            layer.close(layerindex)
                        }
                    });
                });

                /*点击修改*/
                $("body").delegate(".list-box-1 .xinxi-box .zt-cz .zc-box .a-e", "click", function (e) {
                    var appId = $(e.currentTarget).parent().find('input.appId').eq(0).val();
                    common.showPopbox('修改 编号：' + appId + ' 故障信息', $('#applyError'), function () {
                        webserver.query(null, apipath.informations.declaring.single + appId, methods.search, function (err, data, layerIndex) {
                            $('#applyError .appUser').text(data.userName);
                            $('#appLoc').val(data.appLoc);
                            $('#appDes').val(data.appDesc);
                            $('#applyError .applyDate').text(common.myDate.dateFormat(data.appDate, 'yyyy-MM-dd hh:mm:ss'));
                            layer.close(layerIndex);
                        });
                    }, function (layerindex) {
                        if ($('#applyErrorform').validationEngine('validate')) {
                            var params = {
                                "appDate": Date.parse($('#applyError .applyDate').text()),
                                "appDesc": $('#appDes').val(),
                                "appLoc": $('#appLoc').val()
                            };
                            webserver.query(params, apipath.informations.declaring.edit + appId, methods.edit);
                            layer.close(layerindex)
                        }
                    });
                });
                /*点击删除*/
                $("body").delegate(".list-box-1 .xinxi-box .zt-cz .zc-box .a-d", "click", function (e) {
                    common.showConfirm('请您确认以下信息', '您将删除 编号：' + $(e.currentTarget).parent().find('input.appId').eq(0).val() + ' 的相关信息', function () {
                    }, function () {
                        webserver.query(null, apipath.informations.declaring.delete + $(e.currentTarget).parent().find('input.appId').eq(0).val(), methods.delete);
                    });
                });
                /*点击显示修改删除菜单*/
                $("body").delegate(".list-box-1 .xinxi-box .zt-cz .btn-icon-zc", "click", function (e) {
                    $(e.currentTarget).siblings(".zc-box").toggleClass('hide');
                });

            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.declaring_rows_count,
                };
                webserver.query(param, apipath.informations.declaring.list, methods.search, informationRegistrationEvaluation.declaring.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<li>' +
                            '<div class="xinxi-box pos-re">' +
                            '<p>编号：<span>' + data.list[i].appId + '</span></p>' +
                            '<p>填报人：<span>' + data.list[i].userName + '</span>&nbsp;&nbsp;&nbsp;&nbsp;填报时间：<span>' + common.myDate.dateFormat(data.list[i].appDate, 'yyyy年MM月dd日 hh:mm:ss') + '</span></p>' +
                            '<p>故障位置：<span>' + data.list[i].appLoc + '</span></p>' +
                            '<p>故障描述：<span>' + data.list[i].appDesc + '</span></p>' +
                            '<div class="zt-cz">';
                        switch (data.list[i].appStatus) {
                            case 0:
                                html = html + '<span class="red">等待处理</span>';
                                if (data.list[i].userId === 1) {
                                    html = html +
                                        '<a href="#" class="btn-icon-zc"></a>' +
                                        '<div class="zc-box hide">' +
                                        '<input type="hidden" value="' + data.list[i].appId + '" class="appId" />' +
                                        '<a class="a-e" href="#">修改</a>' +
                                        '<a class="a-d" href="#">删除</a>' +
                                        '</div>';
                                }
                                break;
                            case 1:
                                html = html + '<span class="blue">正在处理</span>';
                                break;
                            case 2:
                                html = html + '<span class="grey">处理完毕</span>';
                                break;
                            default:
                                break;
                        }
                        html = html + '</div>' +
                            '</div>' +
                            '</li>';
                    }

                }pagination.Initialization(data.total, pagination.declaring_rows_count, data.pageNum, informationRegistrationEvaluation.declaring.page_list);
                $('.list-box-1').html(html);
                layer.close(layerIndex);
            }
        },
        handling: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();/*绑定验证*/common.bindValidationEngine();
                /*初始化列表*/
                informationRegistrationEvaluation.handling.page_list(1);

                /*点击修改*/
                $("body").delegate(".list-box-1 .xinxi-box .zt-cz .done", "click", function (e) {
                    var appId = $(e.currentTarget).parent().find('input.appId').eq(0).val();
                    var checkId = $(e.currentTarget).parent().parent().find('input.checkId').eq(0).val();
                    common.showPopbox('修改 编号：' + appId + ' 故障解决过程及方案', $('#dealError'), function () {
                        webserver.query(null, apipath.informations.handling.single + checkId, methods.search, function (err, data, layerIndex) {
                            $('#checkUser').attr("disabled","disabled");
                            $('#checkDate').attr("disabled","disabled");
                            $('#checkConfirm').attr("disabled","disabled");
                            $('#checkConfirm').val(data.checkConfirm);
                            $('#checkUser').val(data.checkName);
                            $('#checkDate').val(common.myDate.dateFormat(data.checkDate,'yyyy-MM-dd hh:mm:ss'));
                            $('#checkDesc').val(data.checkDesc);
                            layer.close(layerIndex);
                        });
                    }, function (layerindex) {
                        var params = {
                            "checkDesc":$('#checkDesc').val()
                        };
                        webserver.query(params, apipath.informations.handling.edit + checkId, methods.edit);
                        layer.close(layerindex);
                    });
                });

                /*点击去处理*/
                $("body").delegate(".list-box-1 .xinxi-box .zt-cz .toDo", "click", function (e) {
                    var appId = $(e.currentTarget).parent().find('input.appId').eq(0).val();
                    common.showConfirm('请确认以下信息：','您将处理 编号：'+appId+' 故障',function(){},function(){
                        webserver.query(null, apipath.informations.handling.toDo + appId, methods.edit);
                    });
                });

                /*点击处理*/
                $("body").delegate(".list-box-1 .xinxi-box .zt-cz .doing", "click", function (e) {
                    var appId = $(e.currentTarget).parent().find('input.appId').eq(0).val();
                    var user = JSON.parse(common.cookies.get('!@#2017hd_user'));
                    common.showPopbox('处理 编号：'+appId+' 故障解决过程及方案', $('#dealError'), function () {
                        $('#checkUser')[0].removeAttribute("disabled");
                        $('#checkDate')[0].removeAttribute("disabled");
                        $('#checkConfirm')[0].removeAttribute("disabled");
                        $('#checkConfirm').val('');
                        $('#checkUser').val(user.userName);
                        $('#checkUserIDhid').val(user.userId);
                        $('#checkDate').val('');
                        $('#checkDesc').val('');
                    }, function (layerindex) {
                        var params =
                        {
                            "appId": appId,
                            "checkConfirm": $('#checkConfirm').val(),
                            "checkDate": Date.parse($('#checkDate').val()),
                            "checkDesc": $('#checkDesc').val(),
                            "checkUser":$('#checkUserIDhid').val()
                        };
                        webserver.query(params, apipath.informations.handling.add, methods.add);
                        layer.close(layerindex);
                    });
                });
            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.handling_rows_count,
                };
                webserver.query(param, apipath.informations.handling.list, methods.search, informationRegistrationEvaluation.handling.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<li>' +
                            '<div class="xinxi-box pos-re">' +
                            '<p>编号：<span>'+data.list[i].appId+'</span></p>' +
                            '<p>填报人：<span>'+data.list[i].userName+'</span>&nbsp;&nbsp;&nbsp;&nbsp;填报时间：<span>'+common.myDate.dateFormat(data.list[i].appDate, 'yyyy-MM-dd hh:mm:ss')+'</span></p>' +
                            '<p>故障位置：<span>'+data.list[i].appLoc+'</span></p>' +
                            '<p>故障描述：<span>'+data.list[i].appDesc+'</span></p>' ;
                            switch (data.list[i].appStatus) {
                                case 0:
                                    html = html +
                                        '<div class="zt-cz">' +
                                        '<span class="red">等待处理</span> ' +
                                        '<input class="appId" type="hidden" value="'+data.list[i].appId+'" />' +
                                        '<a href="#" class="toDo btn-cl">去处理</a>' +
                                        '</div>';
                                    break;
                                case 1:
                                    html = html +
                                        '<div class="zt-cz">' +
                                        '<span class="blue">正在处理</span> ' +
                                        '<input class="appId" type="hidden" value="'+data.list[i].appId+'" />' +
                                        '<a href="#" class="doing btn-cl btn-clz">处理</a>' +
                                        '</div>';
                                    break;
                                case 2:
                                    html = html +
                                        '<div class="zt-cz">' +
                                        '<span class="grey">已处理</span> ' +
                                        '<input class="appId" type="hidden" value="'+data.list[i].appId+'" />' +
                                        '<a href="#" class="done btn-details mgl10">修改</a>' +
                                        '</div>';
                                    if(data.list[i].checkId){
                                        html=html+'<hr class="line">' +
                                            '<p>故障处理人：<span>'+data.list[i].checkName+'</span></p>' +
                                            '<p>处理时间：<span>'+common.myDate.dateFormat(data.list[i].checkDate,'yyyy-MM-dd hh:mm:ss')+'</span></p>' +
                                            '<p>故障确诊：<span>'+data.list[i].checkConfirm+'</span></p>' +
                                            '<p>故障解决过程及方案：<span>'+data.list[i].checkDesc+'</span></p>' +
                                            '<input class="checkId" type="hidden" value="'+data.list[i].checkId+'" />';
                                    }
                                    break;
                                default:
                                    break;
                            }
                            html=html+'</div>' +
                                '</li>';
                    }

                }pagination.Initialization(data.total, pagination.handling_rows_count, data.pageNum, informationRegistrationEvaluation.handling.page_list);
                $('.list-box-1').html(html);
                layer.close(layerIndex);
            }
        }
    }
})(jQuery);