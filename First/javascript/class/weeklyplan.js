/**
 * 周计划
 * (c) Copyright 2017 Xianguan Hu All Rights Reserved.
 * 2017-11-02
 */
(function () {
    weeklyplan = {
        plans: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化时间*/
                var thisweek = common.myDate.setDate.getCurrentWeek();
                $('#startTime').val(common.myDate.dateFormat(thisweek[0],'yyyy-MM-dd'));
                $('#endTime').val(common.myDate.dateFormat(thisweek[1],'yyyy-MM-dd'));
                /*初始化列表*/
                weeklyplan.plans.page_list(1);
                /*查询事件*/
                $('#searchBtn').click(function () {
                    weeklyplan.plans.page_list(1);
                });
                /*新增周工作计划*/
                $('#creatNew').click(function () {
                    var user = JSON.parse(common.cookies.get('!@#2017hd_user'));
                    common.showPopbox('新增周工作计划', $('#newplan'), function () {
                        $('#planName').val('');
                        $('#starter').val('');
                        $('#ender').val('');
                        $('#wasteTime').val('');
                    }, function (layerIndex1) {
                        if ($('#addplanform').validationEngine('validate')) {
                            layer.close(layerIndex1);
                            var param = {
                                "dutyid": user.userId,
                                "begindate": Date.parse($('#starter').val()),
                                "days": $('#wasteTime').val(),
                                "enddate": Date.parse($('#ender').val()),
                                "planname": $('#planName').val()
                            }
                            webserver.query(param, apipath.weeklyplan.plans.add, methods.add, function (err, planId, layerIndex) {
                                layer.msg('<span style="color:#ffffff">请选择以下操作：</span>', {
                                    time: 0,
                                    btn: ['周工作计划拆分', '取消'],
                                    shadeClose: true,
                                    shade: 0.3,
                                    btn1: function (index) {
                                        layer.close(index);
                                        common.showPopbox('拆分周工作计划：'+$('#planName').val() , $('#plansSpilt'), function () {
                                            $('#plansSpilt .pop-txt .childplanList').html('');
                                            childplanNum = 0;
                                            for (var i = 0; i < 2; i++) {
                                                childplanNum = childplanNum + 1;
                                                weeklyplan.plans.newChildplan(childplanNum);
                                            }
                                        }, function (layerIndex2) {
                                            if ($('#childplanListform').validationEngine('validate')) {
                                                var arrParams = Array();
                                                for (var i = 1; i <= $('#plansSpilt .childplanTable').length; i++) {
                                                    var params =
                                                        {
                                                            "splitendtime": Date.parse($('#childender' + i).val()),
                                                            "splitname": $('#childplanName' + i).val(),
                                                            "splitstrtime": Date.parse($('#childstarter' + i).val()),
                                                            "planid": planId,
                                                            "splitdutyid": user.userId,
                                                            "departs":$('#childplandepart' + i).val()
                                                        };
                                                    arrParams.push(params);
                                                }
                                                webserver.query(arrParams, apipath.weeklyplan.plans.addChild, methods.add);
                                            }
                                        },function(index){
                                            layer.close(index);
                                            common.showAlert(1, '周工作计划新增成功，如新增拆分周工作计划，可点击周工作计划详情页面，进行拆分', function () {
                                                window.location.reload();
                                            });
                                        });

                                    },
                                    btn2: function (index) {
                                        layer.close(index);
                                        common.showAlert(1, '周工作计划新增成功，如新增拆分周工作计划，可点击周工作计划详情页面，进行拆分', function () {
                                            window.location.reload();
                                        });
                                    }
                                });
                            });
                        }
                    });
                });
                $("body").delegate(".planShow>li>a", "click", function (e) {
                    common.cookies.set('planId', $(e.currentTarget).find('input.planId').val());
                });
                var childplanNum = 0;
                $('#creatNewChild').click(function () {
                    childplanNum = childplanNum + 1;
                    weeklyplan.plans.newChildplan(childplanNum);
                });
            },
            page_list: function (current_page) {
                var user = JSON.parse(common.cookies.get('!@#2017hd_user'));
                var param = {
                    startdate:$('#startTime').val(),
                    enddate:$('#endTime').val(),
                    keyword: $('#keyword').val(),
                    deptid: user.deptId,
                    pageNum: current_page,
                    pageSize: pagination.plan_rows_count
                };
                webserver.query(param, apipath.weeklyplan.plans.list, methods.search, weeklyplan.plans.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                var arr = new Array();
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<li><a href="plansdetail.html">' +
                            '<input class="planId" type="hidden" value="' + data.list[i].planid + '" />' +
                            '<div class="db-list">' +
                            '<h1 class="displaylength" display-length="13">' +(data.list[i].dutyname?data.list[i].dutyname:'<span class="lightGrey">(无)</span>') + '</h1>' +
                            '<p class="displaylength" display-length="38" title="'+data.list[i].planname+'">' +  data.list[i].planname + '</p>' +
                            '<p>时间：' +common.myDate.dateFormat(data.list[i].begindate, 'yyyy年MM月dd日') + ' - ' +
                            common.myDate.dateFormat(data.list[i].enddate, 'yyyy年MM月dd日') +
                            '</p>' +
                            '<div class="circle-box">' +
                            '<p>完成情况</p>' +
                            '<div id="circle' + data.list[i].planid + '" class="circle">' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</a></li>';
                        if (data.list[i].rate != "NaN") {
                            var p = {
                                "circleId": 'circle' + data.list[i].planid,
                                data: [["已完成", Math.floor(parseFloat(data.list[i].rate))], ["未完成", Math.ceil(parseFloat(100 - data.list[i].rate))], ["未分解", 0]]
                            };
                            arr.push(p);
                        } else {
                            if(data.list[i].finishstate===1) {
                                var p = {
                                    "circleId": 'circle' + data.list[i].planid,
                                    data: [["已完成", 100], ["未完成", 0], ["未分解", 0]]
                                };
                                arr.push(p);
                            }else{
                                var p = {
                                    "circleId": 'circle' + data.list[i].planid,
                                    data: [["已完成", 0], ["未完成", 0], ["未分解", 100]]
                                };
                                arr.push(p);
                            }
                        }
                    }

                }//调用分页
                pagination.Initialization(data.total, pagination.plan_rows_count, data.pageNum, weeklyplan.plans.page_list);
                $('.planShow').html(html);
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
            newChildplan: function (num) {
                var html = '';
                if (num != 1) {
                    html = html + '<hr class="line" />';
                }
                html =
                    html + '<table class="childplanTable t-table">' +
                    '<tr>' +
                    '<td >' +
                    '计划标题：' +
                    '</td>' +
                    '<td>' +
                    '<input id="childplanName' + num + '" type="text" class="validate[required]" maxlength="20"/>' +
                    '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>' +
                    '执行时段：' +
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
                    '<td >' +
                    '配合部门：' +
                    '</td>' +
                    '<td>' +
                    '<input id="childplandepart' + num + '" type="text" maxlength="20"/>' +
                    '</td>' +
                    '</tr>' +
                    '</table>';
                $('#plansSpilt .pop-txt .childplanList').append(html);
            }
        },
        plansdetail: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                var planId = common.cookies.get('planId');
                var user = JSON.parse(common.cookies.get('!@#2017hd_user'));
                /*初始化列表*/
                weeklyplan.plansdetail.page_list(planId);
                var childplanNum = 0;
                $('#planSpiltbtn').click(function () {
                    common.showPopbox('拆分计划：'+$('#ptname').text(), $('#plansSpilt'), function () {
                        $('#plansSpilt .pop-txt .childplanList').html('');
                        childplanNum = 0;
                        for (var i = 0; i < 1; i++) {
                            childplanNum = childplanNum + 1;
                            weeklyplan.plansdetail.newChildplan(childplanNum);
                        }
                    }, function (layerIndex2) {
                        if ($('#plansSpiltFrom').validationEngine('validate')) {
                            var arrParams = Array();
                            //alert($('#planId').val());
                            for (var i = 1; i <= $('#plansSpilt .childplanTable').length; i++) {
                                var params =
                                    {
                                        "splitendtime": Date.parse($('#childender' + i).val()),
                                        "splitname": $('#childplanName' + i).val(),
                                        "splitstrtime": Date.parse($('#childstarter' + i).val()),
                                        "planid": planId,
                                        "splitdutyid": user.userId,
                                        "departs":$('#childplandepart' + i).val()
                                    };
                                arrParams.push(params);
                            }
                            webserver.query(arrParams, apipath.weeklyplan.plans.addChild, methods.add);
                        }
                    });
                });
                var childplanNum = 0;
                $('#creatNewChild').click(function () {
                    childplanNum = childplanNum + 1;
                    weeklyplan.plansdetail.newChildplan(childplanNum);
                });
                /*点击显示修改删除菜单*/
                $("body").delegate(".childplans .table-box td.pos-re a.icon-menu-cz", "click", function (e) {
                    var n = $('.childplans .table-box td.pos-re a.icon-menu-cz').index($(e.currentTarget));
                    $('.childplans .table-box td.pos-re a.icon-menu-cz:not(:eq(' + n + '))').siblings('div.cz-box').addClass('hide');
                    $(e.currentTarget).siblings("div.cz-box").toggleClass('hide');
                });
                /*点击修改子计划*/
                $("body").delegate(".childplans .table-box td.pos-re .cz-box a.edit", "click", function (e) {
                    var tdparent = $(e.currentTarget).parent().parent().parent();
                    var splitid = $(tdparent).find('td.splitname').find('input.childId').val();
                    var name = $(tdparent).find('td.splitname').find('span').html();
                    var departs = $(tdparent).find('td.departs').html();
                    common.showPopbox('修改子计划' + name + '信息', $('#editChildplan'), function () {
                        $('#childender0').val($(e.currentTarget).parent().find('.cd_ender').val());
                        $('#childplanName0').val(name);
                        $('#childstarter0').val($(e.currentTarget).parent().find('.cd_starter').val());
                        $('#childplandepart0').val(departs)
                    }, function (layerIndex1) {
                        if ($('#editChildplanform').validationEngine('validate')) {
                            layer.close(layerIndex1);
                            var param = {
                                "splitendtime": Date.parse($('#childender0').val()),
                                "splitname": $('#childplanName0').val(),
                                "splitstrtime": Date.parse($('#childstarter0').val()),
                                "splitdutyid": user.userId,
                                "planid": planId,
                                "departs":$('#childplandepart0').val()
                            };
                            webserver.query(param, apipath.weeklyplan.plansdetail.edit + splitid, methods.edit);
                        }
                    });
                });
                /*点击完成子计划*/
                $("body").delegate(".childplans .table-box td.pos-re .cz-box a.complete", "click", function (e) {
                    var td=$(e.currentTarget).parent().parent().parent().find('td.splitname');
                    common.showConfirm('请您确认以下信息', '您将设置子计划 “' + $(td).find('span').text() + '” 为完成状态，完成后不可修改', function () {
                    }, function () {
                        webserver.query({"finishstate": 1}, apipath.weeklyplan.plansdetail.edit + $(td).find('input.childId').val(), methods.edit);
                    });
                });
                /*点击删除子计划*/
                $("body").delegate(".childplans .table-box td.pos-re .cz-box a.delete", "click", function (e) {
                    var td=$(e.currentTarget).parent().parent().parent().find('td.splitname');
                    common.showConfirm('请您确认以下信息', '您将删除子计划 “' + $(td).find('span').text() + '” ', function () {
                    }, function () {
                        webserver.query({}, apipath.weeklyplan.plansdetail.delete +  $(td).find('input.childId').val(), methods.delete);
                    });
                });

                /*点击子计划添加备注*/
                $("body").delegate(".childplans .table-box td.pos-re .cz-box a.mark", "click", function (e) {
                    var tdparent=$(e.currentTarget).parent().parent().parent();
                    var childId = $(tdparent).find('td.splitname').find('input.childId').val();
                    var textareatext = $(tdparent).find('td.notes').html();
                    common.showPrompt('请填写备注信息',textareatext, function (text,layerIndex) {
                        layer.close(layerIndex);
                        var param = {
                            "notes": text,
                        };
                        webserver.query(param, apipath.weeklyplan.plansdetail.addmark + childId, methods.edit);
                    });
                });

                /*点击删除总计划*/
                $(".childplans .btns-box .delete-plan").click(function () {
                    common.showConfirm('请您确认以下信息', '您将删除 编号：' + planId + ' 的总计划', function () {
                    }, function () {
                        webserver.query({}, apipath.weeklyplan.plans.delete + planId, methods.delete, function (err, data, layerIndex) {
                            layer.msg(data + '即将返回计划列表', {
                                icon: 6,
                                time: 1500,
                                end: function () {
                                    window.location.href = 'plans.html';
                                }
                            });
                        });
                    });
                });
                /*点击完成总计划*/
                $(".childplans .btns-box .complete-plan").click(function () {
                    common.showConfirm('请您确认以下信息', '您将设置 编号：' + planId + ' 的总计划为完成状态，完成后不可修改', function () {
                    }, function () {
                        webserver.query({"finishstate": 1}, apipath.weeklyplan.plans.edit + planId, methods.edit);
                    });
                });
                /*点击修改总计划*/
                $('#a_planEdit').click(function () {
                    common.showPopbox('修改总计划信息', $('#newplan'), function () {
                        $('#planName').val($('#ptname').html());
                        $('#planLeader').val($('#ptuser').html());
                        $('#starter').val($('#hidstarter').val());
                        $('#ender').val($('#hidender').val());
                        $('#wasteTime').val($('#days').val());
                    }, function (layerIndex1) {
                        if ($('#planeditForm').validationEngine('validate')) {
                            layer.close(layerIndex1);
                            var param = {
                                "planerid": user.userId,
                                "begindate": Date.parse($('#starter').val()),
                                "days": $('#wasteTime').val(),
                                "enddate": Date.parse($('#ender').val()),
                                "planname": $('#planName').val()
                            }
                            webserver.query(param, apipath.weeklyplan.plans.edit + planId, methods.edit, function (err, planId, layerIndex) {
                            });
                        }
                    });
                });
            },
            page_list: function (planId) {
                webserver.query({}, apipath.weeklyplan.plansdetail.list + planId, methods.search, weeklyplan.plansdetail.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var planId = common.cookies.get('planId');
                layer.close(layerIndex);
                $('#ptname').html(data.planname);
                $('#ptnum').html(data.planid);
                $('#ptuser').html(data.dutyname);
                $('#ptdate').html(common.myDate.dateFormat(data.begindate, 'yyyy年MM月dd日') +
                    ' - ' + common.myDate.dateFormat(data.enddate, 'yyyy年MM月dd日'));
                $('#hidstarter').val(common.myDate.dateFormat(data.begindate, 'yyyy-MM-dd'));
                $('#hidender').val(common.myDate.dateFormat(data.enddate, 'yyyy-MM-dd'));
                $('#days').val(data.days);
                $('#Leaderhid').val(data.dutyid);
                var userId = common.cookies.get('!@#2017hd_userId');
                if (!!!data.finishstate && (data.dutyid == userId || data.createrId == userId)) {
                    /*设置按钮隐藏*/
                    $('#planSpiltbtn').removeClass('hide');
                    $('.complete-plan').removeClass('hide');
                    $('#a_planEdit').removeClass('hide');
                    $('.delete-plan').removeClass('hide');
                }
                var html = '<tr>' +
                    '<th width="20%">分计划</th>' +
                    '<th width="15%">计划完成时间</th>' +
                    '<th width="15%">配合部门</th>' +
                    '<th width="10%">状态</th>' +
                    '<th width="30%">备注</th>' +
                    '<th width="10%">操作</th>' +
                    '</tr>';
                for (var i = 0; i < data.planSplitVos.length; i++) {
                    //common.myDate.dateFormat(data.planSplitVos[i].splitstrtime, 'yyyy-MM-dd') + ' 至 ' +
                    html = html +
                        '<tr>' +
                        '<td class="splitname"><span>' + data.planSplitVos[i].splitname + '</span>' +
                        '<input type="hidden" class="childId" value="' + data.planSplitVos[i].plansplitid + '" />' +
                        '</td>' +
                        '<td>' +
                        common.myDate.dateFormat(data.planSplitVos[i].splitendtime, 'yyyy-MM-dd') +
                        '</td>' +
                        '<td class="departs">'+(data.planSplitVos[i].departs?data.planSplitVos[i].departs:'')+'</td>'+
                        '<td>';
                    if (data.planSplitVos[i].finishstate === 0) {
                        html = html + '<span class="red">' + data.planSplitVos[i].finishdes + '</span>';
                    } else {
                        html = html + '<span class="green">' + data.planSplitVos[i].finishdes + '</span>';
                    }
                    html =html+'</td>' ;
                    html = html +'<td class="notes">' +
                        (data.planSplitVos[i].notes? data.planSplitVos[i].notes:'') +
                        '</td>' ;
                    html = html +
                        '<td class="pos-re">';
                    if (data.planSplitVos[i].finishstate === 0 && (data.dutyid == userId || data.planSplitVos[i].splitplanerid == userId || data.createrId == userId)) {
                        html = html +
                            '<a class="icon-menu-cz" href="#"></a>' +
                            '<div class="hide cz-box">' ;
                        if (data.dutyid == userId || data.createrId == userId || data.tasksSplits[i].createrId == userId) {
                            html = html +
                            '<input type="hidden" class="cd_ender" value="' + common.myDate.dateFormat(data.planSplitVos[i].splitendtime, 'yyyy-MM-dd') + '" />' +
                            '<input type="hidden" class="cd_starter" value="' + common.myDate.dateFormat(data.planSplitVos[i].splitstrtime, 'yyyy-MM-dd') + '" />'+
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
                $('.childplans .table-box').html(html);

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
            newChildplan: function (num) {
                var html = '';
                if (num != 1) {
                    html = html + '<hr class="line" />';
                }
                html =
                    html + '<table class="childplanTable t-table">' +
                    '<tr>' +
                    '<td >' +
                    '计划标题：' +
                    '</td>' +
                    '<td>' +
                    '<input id="childplanName' + num + '" type="text" class="validate[required]" maxlength="20"/>' +
                    '</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>' +
                    '计划时间：' +
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
                    '<td >' +
                    '配合部门：' +
                    '</td>' +
                    '<td>' +
                    '<input id="childplandepart' + num + '" type="text" maxlength="20"/>' +
                    '</td>' +
                    '</tr>' +
                    '</table>';
                $('#plansSpilt .pop-txt .childplanList').append(html);
            }
        }
    }
})(jQuery)