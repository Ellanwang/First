/*
 * 预算清单接口
 * (c) Copyright 2017 XianGuan.HU. All Rights Reserved.
 * 2017-12-08
 */
(function () {
    budget = {
        personal: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                budget.personal.page_list(1);
                // /*查询事件*/
                $('.search').click(function () {
                    budget.personal.page_list(1);
                });
                // /*新增*/
                $('.add').click(function () {
                    var user = JSON.parse(common.cookies.get("!@#2017hd_user"));
                    common.showPopbox('个人预算申请', $('#addbudget'), function () {
                        $('#commitUser').html(user.userName);
                    }, function (layerIndex) {
                        if ($('#addbudgetform').validationEngine('validate')) {
                            layer.close(layerIndex);
                            var params = {
                                "budgetCondition": 0,
                                "budgetMoney": $('#budgetMoney').val(),
                                "budgetName": $('#budgetName').val(),
                                "budgetStatus": 0,
                                "budgetTime": Date.parse($('#budget').val()),
                                "budgetTypeId": 0,
                                "userId": user.userId
                            };
                            webserver.query(params, apipath.budget.add, methods.add);
                        }
                    });
                });

                $("body").delegate("#list td.btnarea .btn-gg", "click", function (e) {
                    common.showConfirm('请确认以下信息','确认通过审核？',function(){},function(){
                        var param= {
                            budgetId: $(e.currentTarget).parent().find('.budgetId').val(),
                            checkStatus: 0,
                            userType:2
                        }
                        webserver.query(param, apipath.budget.check , methods.edit);
                    })
                })
                $("body").delegate("#list td.btnarea .btn-jj", "click", function (e) {
                    common.showPrompt('请填写拒绝理由','', function (text,layerIndex) {
                        layer.close(layerIndex);
                        var param= {
                            budgetId: $(e.currentTarget).parent().find('.budgetId').val(),
                            checkStatus: 1,
                            checkDesc:text,
                            userType:2
                        }
                        webserver.query(param, apipath.budget.check , methods.edit);
                    });
                })
            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.budget_personal_rows_count,
                    budgetTime: $('#budgetTime').val(),
                    checkStatus: $('#checkStatus').val()
                };
                var user = JSON.parse(common.cookies.get("!@#2017hd_user"));
                var userType='1';
                var id =user.userId;
                if(user.isManager){
                    userType='2';
                    id =user.deptId;
                }
                webserver.query(param, apipath.budget.list + userType +'/' + id, methods.search, budget.personal.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var user = JSON.parse(common.cookies.get("!@#2017hd_user"));
                var html = '<tr>' +
                    '<th width="10%">部门</th>'+
                    '<th width="10%">申请人</th>'+
                    '<th width="30%">申请预算用途</th>' +
                    '<th width="10%">预算金额</th>' +
                    '<th width="10%">预算日期</th>' +
                    '<th width="30%">申请进度</th>';
                    '</tr>';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<tr>' +
                            '<td>' + data.list[i].deptName + '</td>' +
                            '<td>' + data.list[i].userName + '</td>' +
                            '<td>' + data.list[i].budgetName + '</td>' +
                            '<td>' + data.list[i].budgetMoney + '元</td>' +
                            '<td>' + common.myDate.dateFormat(data.list[i].budgetTime, 'yyyy-MM') + '</td>' +
                            '<td class="btnarea">' +
                            '<input type="hidden" class="budgetId" value="'+data.list[i].budgetId+'" />'
                            + budget.CheckStatus(user.isManager?2:1,data.list[i].budgetCondition,user.isManager);
                        if (data.list[i].budgetCondition == 4 || data.list[i].budgetCondition == 5 || data.list[i].budgetCondition == 6) {
                            html = html + '<span class="color-grey">(原因：' + (data.list[i].budgetReason ? data.list[i].budgetReason : '无') + ')</span>';
                        }
                        html = html + '</td>';
                        html =  html+ '</tr>';
                    }
                }
                pagination.Initialization(data.total, pagination.budget_personal_rows_count, data.pageNum, budget.personal.page_list);
                $('#list').html(html);
                layer.close(layerIndex);
            }
        },
        accounting: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                budget.accounting.page_list(1);
                // /*查询事件*/
                $('.search').click(function () {
                    budget.accounting.page_list(1);
                });
                $("body").delegate("#list td.btnarea .btn-gg", "click", function (e) {
                    common.showConfirm('请确认以下信息','确认通过审核？',function(){},function(){
                        var param= {
                            budgetId: $(e.currentTarget).parent().find('.budgetId').val(),
                            checkStatus: 0,
                            userType:3
                        }
                        webserver.query(param, apipath.budget.check , methods.edit);
                    })
                })
                $("body").delegate("#list td.btnarea .btn-jj", "click", function (e) {
                    common.showPrompt('请填写拒绝理由','', function (text,layerIndex) {
                        layer.close(layerIndex);
                        var param= {
                            budgetId: $(e.currentTarget).parent().find('.budgetId').val(),
                            checkStatus: 1,
                            checkDesc:text,
                            userType:3
                        }
                        webserver.query(param, apipath.budget.check , methods.edit);
                    });
                })
            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.budget_personal_rows_count,
                    budgetTime: $('#budgetTime').val(),
                    checkStatus: $('#checkStatus').val(),
                    userName:$('#userName').val()
                };
                var userId = common.cookies.get("!@#2017hd_userId");
                webserver.query(param, apipath.budget.list + '3/' + userId, methods.search, budget.accounting.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '<tr>' +
                    '<th width="10%">部门</th>'+
                    '<th width="10%">申请人</th>'+
                    '<th width="30%">申请预算用途</th>' +
                    '<th width="10%">预算金额</th>' +
                    '<th width="10%">预算日期</th>' +
                    '<th width="50%">申请进度</th>' +
                    '</tr>';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<tr>' +
                            '<td>' + data.list[i].deptName + '</td>' +
                            '<td>' + data.list[i].userName + '</td>' +
                            '<td>' + data.list[i].budgetName + '</td>' +
                            '<td>' + data.list[i].budgetMoney + '元</td>' +
                            '<td>' + common.myDate.dateFormat(data.list[i].budgetTime, 'yyyy-MM') + '</td>' +
                            '<td class="btnarea">' +
                            '<input type="hidden" class="budgetId" value="'+data.list[i].budgetId+'" />'
                            + budget.CheckStatus(3,data.list[i].budgetCondition,true,true);
                        if (data.list[i].budgetCondition == 4 || data.list[i].budgetCondition == 5 || data.list[i].budgetCondition == 6) {
                            html = html + '<span class="color-grey">(原因：' + (data.list[i].budgetReason ? data.list[i].budgetReason : '无') + ')</span>';
                        }
                        html = html + '</td>' +
                            '</tr>';
                    }
                }
                pagination.Initialization(data.total, pagination.budget_personal_rows_count, data.pageNum, budget.accounting.page_list);
                $('#list').html(html);
                layer.close(layerIndex);
            }
        },
        finance: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                budget.finance.page_list(1);
                // /*查询事件*/
                $('.search').click(function () {
                    budget.finance.page_list(1);
                });
                $("body").delegate("#list td.btnarea .btn-gg", "click", function (e) {
                    common.showConfirm('请确认以下信息','确认通过审核？',function(){},function(){
                        var param= {
                            budgetId: $(e.currentTarget).parent().find('.budgetId').val(),
                            checkStatus: 0,
                            userType:4
                        }
                        webserver.query(param, apipath.budget.check , methods.edit);
                    })
                })
                $("body").delegate("#list td.btnarea .btn-jj", "click", function (e) {
                    common.showPrompt('请填写拒绝理由','', function (text,layerIndex) {
                        layer.close(layerIndex);
                        var param= {
                            budgetId: $(e.currentTarget).parent().find('.budgetId').val(),
                            checkStatus: 1,
                            checkDesc:text,
                            userType:4
                        }
                        webserver.query(param, apipath.budget.check , methods.edit);
                    });
                })
            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.budget_personal_rows_count,
                    budgetTime: $('#budgetTime').val(),
                    checkStatus: $('#checkStatus').val(),
                    userName:$('#userName').val()
                };
                var userId = common.cookies.get("!@#2017hd_userId");
                webserver.query(param, apipath.budget.list + '4/' + userId, methods.search, budget.finance.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '<tr>' +
                    '<th width="10%">部门</th>'+
                    '<th width="10%">申请人</th>'+
                    '<th width="30%">申请预算用途</th>' +
                    '<th width="10%">预算金额</th>' +
                    '<th width="10%">预算日期</th>' +
                    '<th width="50%">申请进度</th>' +
                    '</tr>';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<tr>' +
                            '<td>' + data.list[i].deptName + '</td>' +
                            '<td>' + data.list[i].userName + '</td>' +
                            '<td>' + data.list[i].budgetName + '</td>' +
                            '<td>' + data.list[i].budgetMoney + '元</td>' +
                            '<td>' + common.myDate.dateFormat(data.list[i].budgetTime, 'yyyy-MM') + '</td>' +
                            '<td class="btnarea">' +
                            '<input type="hidden" class="budgetId" value="'+data.list[i].budgetId+'" />'
                            + budget.CheckStatus(4,data.list[i].budgetCondition,true);
                        if (data.list[i].budgetCondition == 4 || data.list[i].budgetCondition == 5 || data.list[i].budgetCondition == 6) {
                            html = html + '<span class="color-grey">(原因：' + (data.list[i].budgetReason ? data.list[i].budgetReason : '无') + ')</span>';
                        }
                            html = html + '</td>' +
                            '</tr>';
                    }
                }
                pagination.Initialization(data.total, pagination.budget_personal_rows_count, data.pageNum, budget.finance.page_list);
                $('#list').html(html);
                layer.close(layerIndex);
            }
        },
        CheckStatus: function (userType,budgetCondition,isCheck,isFCheck) {
            switch (budgetCondition) {
                case 0:
                    if(isCheck && userType==2){
                        return  '<button class="btn-gg">通过</button>  <button class="btn-jj">拒绝</button>';
                    }else {
                        return '<span class="color-bule">部门待审核</span>';
                    }
                case 1:
                    if(isCheck && userType==3){
                        return  '<button class="btn-gg">通过</button>  <button class="btn-jj">拒绝</button>';
                    }else {
                        return '<span class="color-bule">会计待审核</span>';
                    }
                case 2:
                    if(isCheck && userType==4){
                        if(isFCheck){
                            return '<span class="color-bule">财务待审核</span>';
                        }else {
                            return '<button class="btn-gg">通过</button>  <button class="btn-jj">拒绝</button>';
                        }
                    }else {
                        return '<span class="color-bule">财务待审核</span>';
                    }
                case 3:
                    return '<span class="color-green">已通过</span>';
                case 4:
                    return '<span class="color-red">部门未通过</span>';
                case 5:
                    return '<span class="color-red">会计未通过</span>';
                case 6:
                    return '<span class="color-red">财务未通过</span>';
                default:
                    return '<span class="color-grey">跑丢了</span>';
            }
        }
    }
})(jQuery);