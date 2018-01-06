/**
 * 督查督办
 * (c) Copyright 2017 Xianguan Hu All Rights Reserved.
 * 2017-11-02
 */
(function () {
    supervise = {
        statistics: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                var thisweek = common.myDate.setDate.getCurrentWeek();
                $('#startTime').val(common.myDate.dateFormat(thisweek[0],'yyyy-MM-dd'));
                $('#endTime').val(common.myDate.dateFormat(thisweek[1],'yyyy-MM-dd'));
                /*初始化列表*/
                supervise.statistics.page_list();
                /*查询事件*/
                $('.search').click(function () {
                    supervise.statistics.page_list();
                });
            },
            page_list: function () {
                var param = {
                    startdate: $('#startTime').val(),
                    enddate: $('#endTime').val()
                };
                webserver.query(param, apipath.supervise.statistics.list, methods.search, supervise.statistics.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                $('.creattasks .all').html(data.tasktotalcreate);
                $('.creattasks .yes').html(data.tasktotalcreate-data.taskcreateunfh);
                $('.creattasks .no').html(data.taskcreateunfh);
                $('.accepttasks .all').html(data.tasktotalduty);
                $('.accepttasks .yes').html(data.tasktotalduty-data.taskdutyunfh);
                $('.accepttasks .no').html(data.taskdutyunfh);
                $('.weekplans .all').html(data.plantotalcreate);
                $('.weekplans .yes').html(data.plantotalcreate-data.plancreateunfh);
                $('.weekplans .no').html(data.plancreateunfh);
                // var s1 = [['已完成', Math.floor(parseFloat(data))], ['未完成', Math.ceil(parseFloat(100 - data))]];
                // $.jqplot('pieChart', [s1], {
                //     grid: {
                //         drawBorder: false,
                //         drawGridlines: false,
                //         background: '#ffffff',
                //         shadow: false
                //     },
                //     seriesDefaults: {
                //         renderer: $.jqplot.DonutRenderer,
                //         rendererOptions: {
                //             showDataLabels: true,
                //             sliceMargin: 4,
                //             startAngle: -90,
                //             dataLabels: 'percent',
                //             seriesColors: ["#10C084", "#FF6060"]
                //         }
                //     },
                //     legend: {
                //         show: true,
                //         location: "nw",
                //         border: 'none'
                //     }
                // });
                layer.close(layerIndex);
            }
        },
        tasks: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                supervise.tasks.page_list(1);
                /*查询事件*/
                $('#searchBtn').click(function () {
                    supervise.tasks.page_list(1);
                });
                /*新增任务*/
                $('#creatNew').click(function () {
                    common.showPopbox('新增任务', $('#newTask'), function () {
                        $('#taskName').val('');
                        $('#taskLeader').val('');
                        $('#starter').val('');
                        $('#ender').val('');
                        $('#wasteTime').val('');
                    }, function (layerIndex1) {
                            if ($('#addtaskform').validationEngine('validate')) {
                                layer.close(layerIndex1);
                                var param = {
                                    "taskerid": $('#taskLeaderhid').val(),
                                    "begindate": Date.parse($('#starter').val()),
                                    "days": $('#wasteTime').val(),
                                    "enddate": Date.parse($('#ender').val()),
                                    "taskname": $('#taskName').val()
                                }
                                webserver.query(param, apipath.supervise.tasks.add, methods.add, function (err, TaskId, layerIndex) {
                                    layer.msg('<span style="color:#ffffff">请选择以下操作：</span>', {
                                        time: 0,
                                        btn: ['任务拆分', '取消'],
                                        shadeClose: true,
                                        shade: 0.3,
                                        btn1: function (index) {
                                            layer.close(index);
                                            common.showPopbox('拆分任务：' + $('#taskName').val() , $('#tasksSpilt'), function () {
                                                $('#tasksSpilt .pop-txt .childTaskList').html('');
                                                childTaskNum = 0;
                                                for (var i = 0; i < 2; i++) {
                                                    childTaskNum = childTaskNum + 1;
                                                    supervise.tasks.newChildTask(childTaskNum);
                                                }
                                            }, function (layerIndex2) {
                                                if ($('#childTaskListform').validationEngine('validate')) {
                                                    var arrParams = Array();
                                                    for (var i = 1; i <= $('#tasksSpilt .childTaskTable').length; i++) {
                                                        var params =
                                                            {
                                                                "splitetime": Date.parse($('#childender' + i).val()),
                                                                "splitname": $('#childtaskName' + i).val(),
                                                                "splitstime": Date.parse($('#childstarter' + i).val()),
                                                                "taskid": TaskId,
                                                                "splittaskerid": $('#childtaskLeaderhid' + i).val(),
                                                                "departs":$('#childplandepart'+i).val()
                                                            };
                                                        arrParams.push(params);
                                                    }
                                                    webserver.query(arrParams, apipath.supervise.tasks.addChild, methods.add);
                                                }
                                            },function(index){
                                                layer.close(index);
                                                common.showAlert(1, '总任务新增成功，如新增拆分任务，可点击总任务详情页面，进行拆分', function () {
                                                    window.location.reload();
                                                });
                                            });

                                        },
                                        btn2: function (index) {
                                            layer.close(index);
                                            common.showAlert(1, '总任务新增成功，如新增拆分任务，可点击总任务详情页面，进行拆分', function () {
                                                window.location.reload();
                                            });
                                        }
                                    });
                                });
                            }
                    });
                });
                $("body").delegate(".taskShow>li>a", "click", function (e) {
                    common.cookies.set('taskId', $(e.currentTarget).find('input.taskId').val());
                });
                /**主持人输入框变化的时候，清空隐藏域**/
                $('#taskLeader').bind('input propertychange', function () {
                    $('#taskLeaderhid').val('');
                });
                /**主持人自动补全插件使用**/
                $('#taskLeader').autocomplete({
                    serviceUrl: apipath.meeting.users.list + '?userId=1&token=1&page=1&rows=10',
                    type: 'GET',
                    dataType: 'json',
                    paramName: 'name',
                    zIndex: 20891021,//要超过19891020
                    onSelect: function (suggestion) {
                        $('#taskLeaderhid').val(suggestion.data);
                    },
                    onHint: function (hint) {
                        $('#taskLeader-list').val(hint);
                    },
                    transformResult: function (response) {
                        return {
                            suggestions: $.map(response.data.list, function (dataItem) {
                                return {value: dataItem.userName, data: dataItem.userId};
                            })
                        };
                    },
                    onInvalidateSelection: function () {
                    }
                });

                var childTaskNum = 0;
                $('#creatNewChild').click(function () {
                    childTaskNum = childTaskNum + 1;
                    supervise.tasks.newChildTask(childTaskNum);
                });
            },
            page_list: function (current_page) {
                var param = {
                    keyword: $('#keyword').val(),
                    pageNum: current_page,
                    pageSize: pagination.task_rows_count
                };
                webserver.query(param, apipath.supervise.tasks.list, methods.search, supervise.tasks.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                var arr = new Array();
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<li><a href="tasksdetail.html">' +
                            '<input class="taskId" type="hidden" value="' + data.list[i].taskid + '" />' +
                            '<div class="db-list">' +
                            '<h4  class="displaylength" display-length="38">' + data.list[i].taskname + '</h4>' +
                            '<p>负责人：' + (data.list[i].taskername?data.list[i].taskername:'<span class="lightGrey">(无)</span>') + '</p>' +
                            '<p>时间：' +common.myDate.dateFormat(data.list[i].begindate, 'yyyy年MM月dd日') + ' - ' +
                            common.myDate.dateFormat(data.list[i].enddate, 'yyyy年MM月dd日') +
                            '</p>' +
                            '<div class="circle-box">' +
                            '<p>完成情况</p>' +
                            '<div id="circle' + data.list[i].taskid + '" class="circle">' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</a></li>';
                        if (data.list[i].rate != "NaN") {
                            var p = {
                                "circleId": 'circle' + data.list[i].taskid,
                                data: [["已完成", Math.floor(parseFloat(data.list[i].rate))], ["未完成", Math.ceil(parseFloat(100 - data.list[i].rate))], ["未分解", 0]]
                            };
                            arr.push(p);
                        } else {
                            if(data.list[i].finishstate===1) {
                                var p = {
                                    "circleId": 'circle' + data.list[i].taskid,
                                    data: [["已完成", 100], ["未完成", 0], ["未分解", 0]]
                                };
                                arr.push(p);
                            }else{
                                var p = {
                                    "circleId": 'circle' + data.list[i].taskid,
                                    data: [["已完成", 0], ["未完成", 0], ["未分解", 100]]
                                };
                                arr.push(p);
                            }
                        }
                    }

                }//调用分页
                pagination.Initialization(data.total, pagination.task_rows_count, data.pageNum, supervise.tasks.page_list);
                $('.taskShow').html(html);
                layer.close(layerIndex);
                for (var i = 0; i < arr.length; i++) {
                    $.jqplot(arr[i].circleId, [arr[i].data], {
                        grid: {
                            drawBorder: false,
                            drawGridlines: false,
                            background: '#ffffff',
                            shadow: false
                        },
                        seriesDefaults: {
                            renderer: $.jqplot.DonutRenderer,
                            rendererOptions: {
                                padding:0,
                                showDataLabels: false,
                                sliceMargin: 0,
                                startAngle: -90,
                                dataLabels: 'percent',
                                seriesColors: ["#10C084", "#FF6060", "#EEEEEE"],
                                shadow: false,
                                sliceMargin: 3
                            },
                        }
                    });
                }
                common.displayPart($('.displaylength'));
                layer.close(layerIndex);
            },
            newChildTask: function (num) {
                var html = '';
                if (num != 1) {
                    html = html + '<hr class="line" />';
                }
                html =
                    html + '<table class="childTaskTable t-table">' +
                    '<tr>' +
                    '<td >' +
                    '任务' + num + '：' +
                    '</td>' +
                    '<td>' +
                    '<input id="childtaskName' + num + '" type="text" class="validate[required]" maxlength="20"/>' +
                    '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>' +
                    '负责人' + num + '：' +
                    '</td>' +
                    '<td>' +
                    '<div style="position: relative; height: 30px;">' +
                    '<input type="hidden" class="systemUsers validate[required]" id="childtaskLeaderhid' + num + '" />' +
                    '<input type="text" class="validate[required]" name="childtaskLeader' + num + '" placeholder="输入存在的用户在动态列表中选择" ' +
                    '   id="childtaskLeader' + num + '"' +
                    '   style="position: absolute; z-index: 2; background: transparent;"/>' +
                    '<input type="text" name="childtaskLeader' + num + '" id="childtaskLeader-list' + num + '" disabled="disabled"' +
                    '   style="color:#ccc;position: absolute; background: transparent; z-index: 1;"/>' +
                    '</div>' +
                    '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>' +
                    '任务时间：' +
                    '</td>' +
                    '<td>' +
                    '<input type="text" id="childstarter' + num + '" placeholder="点击选择时间" class="validate[required]"' +
                    'onclick="WdatePicker({dateFmt:\'yyyy-MM-dd\',isShowClear:true,readOnly:true,minDate:\'#F{$dp.$D(\\\'starter\\\')}\',maxDate:\'#F{ $dp.$D(\\\'childender' + num + '\\\') || $dp.$D(\\\'ender\\\')}\'})" style="width: 140px;"/>' +
                    '<span style="color: #999;">—</span>' +
                    '<input type="text" id="childender' + num + '" placeholder="点击选择时间" class="validate[required]"' +
                    'onclick="WdatePicker({dateFmt:\'yyyy-MM-dd\',isShowClear:true,readOnly:true,minDate:\'#F{ $dp.$D(\\\'childstarter' + num + '\\\') || $dp.$D(\\\'starter\\\')}\',maxDate:\'#F{$dp.$D(\\\'ender\\\');}\'})" style="width: 140px;" />' +
                    '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>' +
                    '配合部门：' +
                    '</td>' +
                    '<td>' +
                    '<input id="childplandepart' + num + '" type="text" maxlength="20"/>' +
                    '</td>' +
                    '</tr>' +
                    '</table>';
                $('#tasksSpilt .pop-txt .childTaskList').append(html);

                /**主持人自动补全插件使用**/
                $('#childtaskLeader' + num).autocomplete({
                    serviceUrl: apipath.meeting.users.list + '?userId=1&token=1&page=1&rows=10',
                    type: 'GET',
                    dataType: 'json',
                    paramName: 'name',
                    zIndex: 20891021,//要超过19891020
                    onSelect: function (suggestion) {
                        $('#childtaskLeaderhid' + num).val(suggestion.data);
                    },
                    onHint: function (hint) {
                        $('#childtaskLeader-list' + num).val(hint);
                    },
                    transformResult: function (response) {
                        return {
                            suggestions: $.map(response.data.list, function (dataItem) {
                                return {value: dataItem.userName, data: dataItem.userId};
                            })
                        };
                    },
                    onInvalidateSelection: function () {
                    }
                });

                /**主持人输入框变化的时候，清空隐藏域**/
                $('#childtaskLeader' + num).bind('input propertychange', function () {
                    $('#childtaskLeaderhid' + num).val('');
                });
            }
        },
        tasksdetail: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                var taskId = common.cookies.get('taskId');
                /*初始化列表*/
                supervise.tasksdetail.page_list(taskId);
                var childTaskNum = 0;
                $('#taskSpiltbtn').click(function () {
                    common.showPopbox('拆分任务：' + $('#ptname').text() , $('#tasksSpilt'), function () {
                        $('#tasksSpilt .pop-txt .childTaskList').html('');
                        childTaskNum = 0;
                        for (var i = 0; i < 1; i++) {
                            childTaskNum = childTaskNum + 1;
                            supervise.tasksdetail.newChildTask(childTaskNum);
                        }
                    }, function (layerIndex2) {
                        if ($('#tasksSpiltFrom').validationEngine('validate')) {
                            var arrParams = Array();
                            for (var i = 1; i <= $('#tasksSpilt .childTaskTable').length; i++) {
                                var params =
                                    {
                                        "splitetime": Date.parse($('#childender' + i).val()),
                                        "splitname": $('#childtaskName' + i).val(),
                                        "splitstime": Date.parse($('#childstarter' + i).val()),
                                        "taskid": $('#ptnum').html(),
                                        "splittaskerid": $('#childtaskLeaderhid' + i).val(),
                                        "departs":$('#childplandepart'+i).val()
                                    };
                                arrParams.push(params);
                            }
                            webserver.query(arrParams, apipath.supervise.tasks.addChild, methods.add);
                        }
                    });
                });
                var childTaskNum = 0;
                $('#creatNewChild').click(function () {
                    childTaskNum = childTaskNum + 1;
                    supervise.tasksdetail.newChildTask(childTaskNum);
                });
                /*点击显示修改删除菜单*/
                $("body").delegate(".childTasks .table-box td.pos-re a.icon-menu-cz", "click", function (e) {
                    var n = $('.childTasks .table-box td.pos-re a.icon-menu-cz').index($(e.currentTarget));
                    $('.childTasks .table-box td.pos-re a.icon-menu-cz:not(:eq(' + n + '))').siblings('div.cz-box').addClass('hide');
                    $(e.currentTarget).siblings("div.cz-box").toggleClass('hide');
                });
                /*点击修改子任务*/
                $("body").delegate(".childTasks .table-box td.pos-re .cz-box a.edit", "click", function (e) {
                    var splitid = $(e.currentTarget).parent().parent().parent().find('td.childIdtd').find('.childId').val();
                    var name = $(e.currentTarget).parent().parent().parent().find('td.childIdtd').find('span').html();
                    common.showPopbox('修改子任务“' + name + '”信息', $('#editChildtask'), function () {
                        $('#childender0').val($(e.currentTarget).parent().find('.cd_ender').val());
                        $('#childtaskName0').val(name);
                        $('#childstarter0').val($(e.currentTarget).parent().find('.cd_starter').val());
                        $('#childtaskLeaderhid0').val($(e.currentTarget).parent().find('.childLeaderhid').val());
                        $('#childtaskLeader0').val($(e.currentTarget).parent().parent().parent().find('td.splittaskername').html());
                        $('#childplandepart0').val($(e.currentTarget).parent().parent().parent().find('td.departs').html());
                    }, function (layerIndex1) {
                        if ($('#editChildtaskform').validationEngine('validate')) {
                            layer.close(layerIndex1);
                            var param = {
                                "splitetime": Date.parse($('#childender0').val()),
                                "splitname": $('#childtaskName0').val(),
                                "splitstime": Date.parse($('#childstarter0').val()),
                                "splittaskerid": $('#childtaskLeaderhid0').val(),
                                "taskid": taskId,
                                "departs":$('#childplandepart0').val()
                            };
                            webserver.query(param, apipath.supervise.tasksdetail.edit + splitid, methods.edit);
                        }
                    });
                });
                /*点击完成子任务*/
                $("body").delegate(".childTasks .table-box td.pos-re .cz-box a.complete", "click", function (e) {
                    var td = $(e.currentTarget).parent().parent().parent().find('td.childIdtd');
                    common.showConfirm('请您确认以下信息', '您将设置子任务 “' + $(td).find('span').text() + '” 为完成状态，完成后不可更改', function () {
                    }, function () {
                        webserver.query({"finishstate": 1}, apipath.supervise.tasksdetail.edit + $(td).find('input.childId').val(), methods.edit);
                    });
                });
                /*点击删除子任务*/
                $("body").delegate(".childTasks .table-box td.pos-re .cz-box a.delete", "click", function (e) {
                    var td = $(e.currentTarget).parent().parent().parent().find('td.childIdtd');
                    common.showConfirm('请您确认以下信息', '您将删除子任务 “' +$(td).find('span').text() + '” ', function () {
                    }, function () {
                        webserver.query({}, apipath.supervise.tasksdetail.delete + $(td).find('input.childId').val(), methods.delete);
                    });
                });

                /*点击子任务添加备注*/
                $("body").delegate(".childTasks .table-box td.pos-re .cz-box a.mark", "click", function (e) {
                    var tdparent=$(e.currentTarget).parent().parent().parent();
                    var childId = $(tdparent).find('.childIdtd').find('input.childId').val();
                    var textareatext =$(tdparent).find('.notes').text();
                    common.showPrompt('请填写备注信息',textareatext, function (text,layerIndex) {
                        layer.close(layerIndex);
                        var param = {
                            "notes": text,
                        };
                        webserver.query(param, apipath.supervise.tasksdetail.addmark + childId, methods.edit);
                    });
                });

                /*点击删除总任务*/
                $(".childTasks .btns-box .delete-task").click(function () {
                    common.showConfirm('请您确认以下信息', '您将删除 编号：' + taskId + ' 的总任务', function () {
                    }, function () {
                        webserver.query({}, apipath.supervise.tasks.delete + taskId, methods.delete, function (err, data, layerIndex) {
                            layer.msg(data + '即将返回任务列表', {
                                icon: 6,
                                time: 1500,
                                end: function () {
                                    window.location.href = 'tasks.html';
                                }
                            });
                        });
                    });
                });
                /*点击完成总任务*/
                $(".childTasks .btns-box .complete-task").click(function () {
                    common.showConfirm('请您确认以下信息', '您将设置 编号：' + taskId + ' 的总任务为完成状态，完成后不可更改', function () {
                    }, function () {
                        webserver.query({"finishstate": 1}, apipath.supervise.tasks.edit + taskId, methods.edit);
                    });
                });
                /*点击修改总任务*/
                $('#a_taskEdit').click(function () {
                    common.showPopbox('修改总任务信息', $('#newTask'), function () {
                        $('#taskName').val($('.ptname').html());
                        $('#taskLeader').val($('#ptuser').html());
                        $('#starter').val($('#hidstarter').val());
                        $('#ender').val($('#hidender').val());
                        $('#wasteTime').val($('#days').val());
                        $('#taskLeaderhid').val($('#Leaderhid').val());
                    }, function (layerIndex1) {
                        if ($('#taskeditForm').validationEngine('validate')) {
                            layer.close(layerIndex1);
                            var param = {
                                "taskerid": $('#taskLeaderhid').val(),
                                "begindate": Date.parse($('#starter').val()),
                                "days": $('#wasteTime').val(),
                                "enddate": Date.parse($('#ender').val()),
                                "taskname": $('#taskName').val()
                            }
                            webserver.query(param, apipath.supervise.tasks.edit + taskId, methods.edit, function (err, TaskId, layerIndex) {
                            });
                        }
                    });
                });
                /**主持人输入框变化的时候，清空隐藏域**/
                $('#taskLeader').bind('input propertychange', function () {
                    $('#taskLeaderhid').val('');
                });
                /**主持人自动补全插件使用**/
                $('#taskLeader').autocomplete({
                    serviceUrl: apipath.meeting.users.list + '?userId=1&token=1&page=1&rows=10',
                    type: 'GET',
                    dataType: 'json',
                    paramName: 'name',
                    zIndex: 20891021,//要超过19891020
                    onSelect: function (suggestion) {
                        $('#taskLeaderhid').val(suggestion.data);
                    },
                    onHint: function (hint) {
                        $('#taskLeader-list').val(hint);
                    },
                    transformResult: function (response) {
                        return {
                            suggestions: $.map(response.data.list, function (dataItem) {
                                return {value: dataItem.userName, data: dataItem.userId};
                            })
                        };
                    },
                    onInvalidateSelection: function () {
                    }
                });

                /**主持人自动补全插件使用**/
                $('#childtaskLeader0').autocomplete({
                    serviceUrl: apipath.meeting.users.list + '?userId=1&token=1&page=1&rows=10',
                    type: 'GET',
                    dataType: 'json',
                    paramName: 'name',
                    zIndex: 20891021,//要超过19891020
                    onSelect: function (suggestion) {
                        $('#childtaskLeaderhid0').val(suggestion.data);
                    },
                    onHint: function (hint) {
                        $('#childtaskLeader-list0').val(hint);
                    },
                    transformResult: function (response) {
                        return {
                            suggestions: $.map(response.data.list, function (dataItem) {
                                return {value: dataItem.userName, data: dataItem.userId};
                            })
                        };
                    },
                    onInvalidateSelection: function () {
                    }
                });

                /**主持人输入框变化的时候，清空隐藏域**/
                $('#childtaskLeader0').bind('input propertychange', function () {
                    $('#childtaskLeaderhid0').val('');
                });

            },
            page_list: function (taskId) {
                webserver.query({}, apipath.supervise.tasksdetail.list + taskId, methods.search, supervise.tasksdetail.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var taskId = common.cookies.get('taskId');
                layer.close(layerIndex);
                $('.ptname').html(data.taskname);
                $('#ptnum').html(data.taskid);
                $('#ptuser').html(data.taskername);
                $('#ptdate').html(common.myDate.dateFormat(data.begindate, 'yyyy年MM月dd日') + ' - ' + common.myDate.dateFormat(data.enddate, 'yyyy年MM月dd日'));
                $('#hidstarter').val(common.myDate.dateFormat(data.begindate, 'yyyy-MM-dd'));
                $('#hidender').val(common.myDate.dateFormat(data.enddate, 'yyyy-MM-dd'));
                $('#days').val(data.days);
                $('#Leaderhid').val(data.taskerid);
                var userId = common.cookies.get('!@#2017hd_userId');
                if (!!!data.finishstate && (data.taskerid == userId || data.createrId == userId)) {
                    /*设置按钮隐藏*/
                    $('#taskSpiltbtn').removeClass('hide');
                    $('.complete-task').removeClass('hide');
                    $('#a_taskEdit').removeClass('hide');
                    $('.delete-task').removeClass('hide');
                }
                var html = '<tr>' +
                    '<th width="10%">分任务</th>' +
                    '<th width="10%">负责人</th>' +
                    '<th width="15%">计划完成时间</th>' +
                    '<th width="15%">配合部门</th>' +
                    '<th width="10%">状态</th>' +
                    '<th width="30%">备注</th>' +
                    '<th width="10%">操作</th>' +
                    '</tr>';
                for (var i = 0; i < data.tasksSplits.length; i++) {
                    //common.myDate.dateFormat(data.tasksSplits[i].splitstime, 'yyyy-MM-dd') + ' 至 ' +
                    html = html +
                        '<tr>' +
                        '<td class="childIdtd"><span>' + data.tasksSplits[i].splitname + '</span>' +
                        '<input type="hidden" class="childId" value="' + data.tasksSplits[i].splitid + '" />' +
                        '</td>' +
                        '<td class="splittaskername">' + data.tasksSplits[i].splittaskername + '</td>' +
                        '<td>' +
                         common.myDate.dateFormat(data.tasksSplits[i].splitetime, 'yyyy-MM-dd') +
                        '</td>' +
                        '<td class="departs">'+(data.tasksSplits[i].departs?data.tasksSplits[i].departs:'')+'</td>'+
                        '<td>';
                    if (data.tasksSplits[i].finishstate === 0) {
                        html = html + '<span class="red">' + data.tasksSplits[i].finishdes + '</span>';
                    } else {
                        html = html + '<span class="green">' + data.tasksSplits[i].finishdes + '</span>';
                    }
                    html =html+'</td>' ;
                    html = html +'<td class="notes">' +
                    (data.tasksSplits[i].notes? data.tasksSplits[i].notes:'') +
                    '</td>' ;
                    html = html +
                        '<td class="pos-re">';
                    if (data.tasksSplits[i].finishstate === 0 && (data.taskerid == userId || data.tasksSplits[i].splittaskerid == userId || data.createrId == userId)) {
                        html = html +
                            '<a class="icon-menu-cz" href="#"></a>' +
                            '<div class="hide cz-box">' +
                            '<input type="hidden" class="childLeaderhid" value="' + data.tasksSplits[i].splittaskerid + '" />' ;
                        if (data.taskerid == userId || data.createrId == userId || data.tasksSplits[i].createrId == userId  ) {
                            html = html +'<input type="hidden" class="cd_ender" value="' + common.myDate.dateFormat(data.tasksSplits[i].splitetime, 'yyyy-MM-dd') + '" />' +
                            '<input type="hidden" class="cd_starter" value="' + common.myDate.dateFormat(data.tasksSplits[i].splitstime, 'yyyy-MM-dd') + '" />'+
                                '<a class="edit" href="#">修改</a>' +
                                '<a class="delete" href="#">删除</a>';
                        }
                        html = html + '<a class="mark" href="#">备注</a>' +
                            '<a class="complete" href="#">完成</a>' +
                            '</div>';
                    }
                    html = html +
                        '</td>' +
                        '</tr>';
                }
                $('.childTasks .table-box').html(html);

                var s1 = '';

                if (data.rate != "NaN") {
                    s1 = [["已完成", parseInt(data.rate)], ["未完成", parseInt(100 - data.rate)], ["未分解", 0]];
                } else {
                    if (data.finishstate === 1) {
                        s1 = [["已完成", 100], ["未完成", 0], ["未分解", 0]];
                    } else {

                        s1 = [["已完成", 0], ["未完成", 0], ["未分解", 100]]
                    }
                }

                $.jqplot('circle', [s1], {
                    grid: {
                        drawBorder: false,
                        drawGridlines: false,
                        background: '#ffffff',
                        shadow: false
                    },
                    seriesDefaults: {
                        renderer: $.jqplot.DonutRenderer,
                        rendererOptions: {
                            padding: 0,
                            showDataLabels: false,
                            sliceMargin: 0,
                            startAngle: -90,
                            dataLabels: 'percent',
                            seriesColors: ["#10C084", "#FF6060", "#EEEEEE"],
                            shadow: false,
                            sliceMargin: 3
                        },
                    }
                });

            },
            newChildTask: function (num) {
                var html = '';
                if (num != 1) {
                    html = html + '<hr class="line" />';
                }
                html =
                    html + '<table class="childTaskTable t-table">' +
                    '<tr><td >任务名称：</td><td>' +
                    '<input id="childtaskName' + num + '" class="validate[required]" type="text" maxlength="20"/>' +
                    '</td></tr><tr><td>负责人：' +
                    '</td><td><div style="position: relative; height: 30px;">' +
                    '<input type="hidden" class="systemUsers validate[required]" id="childtaskLeaderhid' + num + '" />' +
                    '<input type="text" class="validate[required]" name="childtaskLeader' + num + '" placeholder="输入存在的用户在动态列表中选择" ' +
                    '   id="childtaskLeader' + num + '"' +
                    ' style="position: absolute; z-index: 2; background: transparent;"/>' +
                    '<input type="text" name="childtaskLeader' + num + '" id="childtaskLeader-list' + num + '" disabled="disabled"' +
                    ' style="color:#ccc;position: absolute; background: transparent; z-index: 1;"/>' +
                    '</div></td></tr><tr><td>任务时间：</td><td>' +
                    '<input type="text" id="childstarter' + num + '" placeholder="点击选择时间" class="validate[required]"' +
                    'onclick="WdatePicker({dateFmt:\'yyyy-MM-dd\',isShowClear:true,readOnly:true,minDate:\'#F{$dp.$D(\\\'hidstarter\\\')}\',maxDate:\'#F{ $dp.$D(\\\'childender' + num + '\\\') || $dp.$D(\\\'hidender\\\')}\'})" style="width: 140px;"/>' +
                    '<span style="color: #999;">—</span>' +
                    '<input type="text" id="childender' + num + '" placeholder="点击选择时间" class="validate[required]"' +
                    ' onclick="WdatePicker({dateFmt:\'yyyy-MM-dd\',isShowClear:true,readOnly:true,minDate:\'#F{ $dp.$D(\\\'childstarter' + num + '\\\') || $dp.$D(\\\'hidstarter\\\')}\',maxDate:\'#F{$dp.$D(\\\'hidender\\\');}\'})" style="width: 140px;" />' +
                    '</td>' +
                    '</tr>' +
                    '<td>' +
                    '配合部门：' +
                    '</td>' +
                    '<td>' +
                    '<input id="childplandepart' + num + '" type="text" maxlength="20"/>' +
                    '</td>' +
                    '</tr>' +
                    '</table>';
                $('#tasksSpilt .pop-txt .childTaskList').append(html);

                /**主持人自动补全插件使用**/
                $('#childtaskLeader' + num).autocomplete({
                    serviceUrl: apipath.meeting.users.list + '?userId=1&token=1&page=1&rows=10',
                    type: 'GET',
                    dataType: 'json',
                    paramName: 'name',
                    zIndex: 20891021,//要超过19891020
                    onSelect: function (suggestion) {
                        $('#childtaskLeaderhid' + num).val(suggestion.data);
                    },
                    onHint: function (hint) {
                        $('#childtaskLeader-list' + num).val(hint);
                    },
                    transformResult: function (response) {
                        return {
                            suggestions: $.map(response.data.list, function (dataItem) {
                                return {value: dataItem.userName, data: dataItem.userId};
                            })
                        };
                    },
                    onInvalidateSelection: function () {
                    }
                });

                /**主持人输入框变化的时候，清空隐藏域**/
                $('#childtaskLeader' + num).bind('input propertychange', function () {
                    $('#childtaskLeaderhid' + num).val('');
                });
            }
        }
    }
})(jQuery)