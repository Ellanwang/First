/**
 * (c) Copyright 2017 XianGuan.HU. All Rights Reserved.
 * 2017-10-10
 * 我的
 */
(function () {
    my = {
        Scrapped: {
            Initialization: function () {
                /*初始化用户名*/
                common.menusInitialization();
                /*初始化列表*/
                my.Scrapped.page_list(1);
                /*删除报废*/
                $("body").delegate(".my-box .my .delapply", "click", function (e) {
                    var scrapId = $(e.currentTarget).parent().find('input.scrapId').eq(0).val();
                    common.showConfirm('请您确认以下信息：', '您将要取消 编号：' + scrapId + ' 的报废信息', function () {
                    }, function () {
                        webserver.query(null, apipath.my.scrapped.delete + scrapId, methods.delete);
                    });
                });
                /*重新报废*/
                $("body").delegate(".my-box .my .reapply", "click", function (e) {
                    var scrapId = $(e.currentTarget).parent().find('input.scrapId').eq(0).val();
                    common.showConfirm('请您确认以下信息：', '您将要重新提交 编号：' + scrapId + ' 的报废信息', function () {
                    }, function () {
                        webserver.query(null, apipath.my.scrapped.edit + scrapId, methods.edit);
                    })
                });
                /*查询*/
                $('.search').click(function () {
                    my.Scrapped.page_list(1);
                });
            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.Scrapped_rows_count,
                    date: $('#Date').val()
                };
                webserver.query(param, apipath.my.scrapped.list, methods.search, my.Scrapped.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<li>' +
                            '<div class="my pos-re">' +
                            '<ul class="clearfix txt-baofei">' +
                            '<li>' +
                            '编号：' + data.list[i].scrapId + '<br />分类：' +
                            data.list[i].assetsTypeName + '<br />位置：' + data.list[i].assetsLoc +
                            '<br />报废缘由：' + data.list[i].scrapReason + '' +
                            '</li>' +
                            '<li>' +
                            '申请时间：' + common.myDate.dateFormat(data.list[i].scrapDate, 'yyyy-MM-dd') +
                            '<br />名称：' + data.list[i].assetsName + '<br />数量：' + data.list[i].scrapNum +
                            '</li>' +
                            '</ul>';
                        switch (data.list[i].scrapStatus) {
                            case 0:
                                html = html + '<p class="check-wait">等待审核</p>' +
                                    '<div class="clearfix mgt15 btns-box-my1">' +
                                    '<div class="fr">' +
                                    '<input type="hidden" class="scrapId" value="' + data.list[i].scrapId + '" />' +
                                    '<button class="btn delapply">取消报废</button>' +
                                    '</div>' +
                                    '</div>';
                                break;
                            case 1:
                                html = html +
                                    '<p class="check-have">已完成</p>' +
                                    '<div class="clearfix mgt15 btns-box-my1">' +
                                    '</div>';
                                break;
                            case 2:
                                html = html +
                                    '<p class="no-reason">未通过原因：' + data.list[i].checkReason + '</p>' +
                                    '<p class="check-wait">未通过审核</p>' +
                                    '<div class="clearfix mgt15 btns-box-my1">' +
                                    '<div class="fr">' +
                                    '<input type="hidden" class="scrapId" value="' + data.list[i].scrapId + '" />' +
                                    '<button class="btn reapply">重新报废</button>' +
                                    '</div>' +
                                    '</div>';
                                break;
                        }
                        html = html + '</div>' +
                            '</li>';
                    }
                   
                }
				 //调用分页
                    pagination.Initialization(data.total, pagination.Scrapped_rows_count, data.pageNum, my.Scrapped.page_list);
                $('.my-box').html(html);
                layer.close(layerIndex);
            }
        },
        scrappedCheck: {
            Initialization: function () {
                /*初始化用户名*/
                common.menusInitialization();
                /*初始化列表*/
                my.scrappedCheck.page_list(1);
                /*通过审核*/
                $("body").delegate(".my-box .my .pass", "click", function (e) {
                    var checkId = $(e.currentTarget).parent().find('input.checkId').eq(0).val();
                    common.showConfirm('请您确认以下信息：', '您将要审核通过 编号：' + checkId + ' 的报废信息', function () {
                    }, function () {
                        webserver.query({}, apipath.my.scrappedCheck.edit + '1/' + checkId, methods.edit);
                    });
                });
                /*不通过审核*/
                $("body").delegate(".my-box .my .nopass", "click", function (e) {
                    var checkId = $(e.currentTarget).parent().find('input.checkId').eq(0).val();
                    common.showPopbox('请填写此报废信息不通过的原因', $('#noPass'), function () {
                        $('#nopassReason').val('');
                    }, function () {
                        if ($('#checkform').validationEngine('validate')) {
                            var params = {};
                            params.checkReason = $('#nopassReason').val();
                            webserver.query(params, apipath.my.scrappedCheck.edit + '2/' + checkId, methods.edit);
                        }
                    });
                });
                /*查询*/
                $('.search').click(function () {
                    my.scrappedCheck.page_list(1);
                });
            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.scrappedCheck_rows_count,
                    date: $('#Date').val()
                };
                webserver.query(param, apipath.my.scrappedCheck.list, methods.search, my.scrappedCheck.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<li>' +
                            '<div class="my pos-re">' +
                            '<ul class="clearfix txt-baofei">' +
                            '<li>' +
                            '编号：' + data.list[i].checkId + '<br>申请部门:' + data.list[i].deptName + '<br>分类：' + data.list[i].assetsTypeName +
                            '<br>位置：' + data.list[i].assetsLoc + '<br>报废缘由：' + data.list[i].scrapReason +
                            '</li>' +
                            '<li>' +
                            '申请人：' + data.list[i].userName + '<br>申请时间：' + common.myDate.dateFormat(data.list[i].scrapDate, 'yyyy-MM-dd') +
                            '<br />名称：' + data.list[i].assetsName + '<br />数量：' + data.list[i].scrapNum +
                            '</li>' +
                            '</ul>';
                        switch (data.list[i].checkOprate) {
                            case 0:
                                html = html +
                                    '<p class="check-wait">等待审核</p>' +
                                    '<div class="clearfix mgt15 btns-box-my1">' +
                                    '<div class="fr">' +
                                    '<input type="hidden" class="checkId" value="' + data.list[i].checkId + '" />' +
                                    '<button class="pass btn">通过</button> ' +
                                    '<button class="nopass btn">不通过</button>' +
                                    '</div>' +
                                    '</div>';
                                break;
                            case 1:
                                html = html +
                                    '<p class="check-have">已审核</p>' +
                                    '<div class="clearfix mgt15 btns-box-my1">' +
                                    '</div>';
                                break;
                            case 2:
                                html = html +
                                    '<p class="check-wait">未通过</p>' +
                                    '<p class="no-reason">未通过原因：' + data.list[i].checkReason + '</p>' +
                                    '<div class="clearfix mgt15 btns-box-my1">' +
                                    '</div>';
                                break;
                        }
                        html = html + '</div>' +
                            '</li>';
                    }
                    
                }
				//调用分页
                    pagination.Initialization(data.total, pagination.scrappedCheck_rows_count, data.pageNum, my.scrappedCheck.page_list);
                $('.my-box').html(html);
                layer.close(layerIndex);
            }
        },
        cars: {
            Initialization: function () {
                /*初始化用户名*/
                common.menusInitialization();
                /*初始化列表*/
                my.cars.page_list(1);

                /*查询*/
                $('.search').click(function () {
                    my.cars.page_list(1);
                });
                /*点击预定好的删除车辆预定*/
                $("body").delegate(".my-box .my .cancelmeet", "click", function (e) {
                    var orderId = $(e.currentTarget).parent().find('.orderId').val();
                    common.showPopbox('取消车辆预定', $('#carsOrderCancel'), function () {
                        webserver.query(null, apipath.cars.carsOrder.single + orderId, methods.search, function (err, data, layerIndex) {
                            $('#carsOrderCancel .qxyd-orderUser').html(data.creater);
                            $('#carsOrderCancel .qxyd-orderDate').html(common.myDate.dateFormat(data.bedatetime, 'yyyy-MM-dd'));
                            $('#carsOrderCancel .qxyd-orderTime').html(common.myDate.dateFormat(data.bedatetime, 'hh:mm') + '-' + common.myDate.dateFormat(data.endatetime, 'hh:mm'));
                            $('#qxyd_reason').val('');
                            $('#qxyd_mark').val('');
                            layer.close(layerIndex);
                        });
                    }, function (layerIndex) {
                        my.cars.cancelOrder(orderId, layerIndex);
                        layer.close(layerIndex);

                    });
                });
                /*点击预定好的修改预定*/
                $("body").delegate(".my-box .my .editmeet", "click", function (e) {
                    var orderId = $(e.currentTarget).parent().find('.orderId').val();
                    common.showPopbox('修改车辆预定', $('#carsOrder'), function () {
                        webserver.query(null, apipath.cars.carsOrder.single + orderId, methods.search, function (err, data, layerIndex) {

                            $('.orderDate').html(common.myDate.dateFormat(data.bedatetime, 'yyyy-MM-dd'));
                            $('.orderUserName').html(data.creater);
                            $('.driverInfo').html($(e.currentTarget).parent().find('span.driverInfo_sp').html());
                            $('#order_destination').val(data.destination);
                            $('#order_departure').val(data.departure);
                            $('#order_reason').val(data.reason);
                            $('#carEndTime').val(common.myDate.dateFormat(data.endatetime, 'hh:mm'));
                            $('#carStartTime').val(common.myDate.dateFormat(data.bedatetime, 'hh:mm'));
                            $('#driverId').val(data.driverid);
                            layer.close(layerIndex);
                        });
                    }, function (layerIndex) {
                        var carId = $(e.currentTarget).parent().find('.carId').val();
                         if ($('#editmyordercar').validationEngine('validate')) {
                             my.cars.confirmOrder(carId, layerIndex, orderId);
                             //layer.close(layerIndex);
                         }
                    });
                });
            },
            confirmOrder: function (carId, PopBox_layerIndex, orderId) {
                common.showPopbox('请确认车辆预定信息', $('#carsOrderConfirm'), function () {
                    $('#carsOrderConfirm .qr-orderName').html($('#carsOrder .orderUserName').html());
                    $('#carsOrderConfirm .qr-orderDate').html($('#carsOrder .orderDate').html());
                    $('#carsOrderConfirm .qr-reason').html($('#order_reason').val());
                    $('#carsOrderConfirm .qr-destination').html($('#order_destination').val());
                    $('#carsOrderConfirm .qr-departure').html($('#order_departure').val());
                    $('#carsOrderConfirm .qr-orderTime').html($('#carStartTime').val() + '-' + $('#carEndTime').val());
                }, function (PopBoxConfirm_layerIndex) {
                    var params = {};
                    params.departure = $('#order_departure').val();
                    params.destination = $('#order_destination').val();
                    params.reason = $('#order_reason').val();
                    params.veid = carId;
                    params.driverid = $('#driverId').val();
                    params.userid = 1;
                    params.endatetime = Date.parse($('#carsOrder .t-table .orderDate').text() + ' ' + $('#carEndTime').val());
                    params.bedatetime = Date.parse($('#carsOrder .t-table .orderDate').text() + ' ' + $('#carStartTime').val());

                    webserver.query(params, apipath.cars.carsBooking.edit + orderId, methods.edit, function (error, data, layerIndex) {
                        var textmsg = '您已成功预定编号为：' + data.num + ' 的车辆，并向该车司机发出通知；<br>时间：' +
                            common.myDate.dateFormat(new Date(data.begindate), 'yyyy年MM月dd日') + ' ' +
                            common.myDate.dateFormat(new Date(data.begindate), 'hh:mm') + ' - ' +
                            common.myDate.dateFormat(new Date(data.enddate), 'hh:mm');
                        common.showAlert(1, textmsg, function (index) {
                            layer.close(layerIndex);
                            window.location.reload();
                        });
                    });
                    layer.close(PopBoxConfirm_layerIndex);
                    layer.close(PopBox_layerIndex);
                });
            },
            cancelOrder: function (orderId, layerIndex) {
                var params = {};
                params.reason = $('#qxyd_reason').val();
                params.remark = $('#qxyd_mark').val();
                webserver.query(params, apipath.cars.carsBooking.delete + orderId, methods.delete, function (error, data, layerIndex) {
                    layer.close(layerIndex);
                });
            },
            page_list: function (current_page) {
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.myCars_rows_count,
                    sdate: $('#startTime').val(),
                    edate: $('#endTime').val()
                };
                webserver.query(param, apipath.my.cars.list, methods.search, my.cars.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<li>' +
                            '<div class="my">' +
                            '<h2>' + common.myDate.dateFormat(Date.parse(data.list[i].bedatetime), 'yyyy-MM-dd') + '<span>' + common.myDate.dateFormat(Date.parse(data.list[i].bedatetime), 'hh:mm') + ' - ' + common.myDate.dateFormat(Date.parse(data.list[i].endatetime), 'hh:mm') + '</span></h2>' +
                            '<p>驾驶员：' + data.list[i].dname + '&nbsp;&nbsp;｜&nbsp;&nbsp;联系电话：' +(data.list[i].dphone?data.list[i].dphone:'<span class="lightGrey">(无)</span>') + '&nbsp;&nbsp;｜&nbsp;&nbsp;车牌号：' + data.list[i].plate + '<br>出发地：' + data.list[i].departure + '&nbsp;&nbsp;｜&nbsp;&nbsp;目的地：' + data.list[i].destination + '<br>事由：' + data.list[i].reason +
                            '</p>';
                        if (Date.parse(new Date(data.list[i].bedatetime)) - Date.parse(new Date()) > 0) {
                            html = html + '<div class="clearfix mgt15 btns-box-my">' +
                                '<div class="last-txt">' +
                                common.myDate.timeLength(Date.parse(new Date()), Date.parse(new Date(data.list[i].bedatetime))) +
                                '</div>' +
                                '<div class="fr">' +
                                '<span class="hide driverInfo_sp">'+data.list[i].dname+'/'+(data.list[i].dphone?data.list[i].dphone:'<span class="lightGrey">(无)</span>')+'</span>' +
                                '<input type="hidden" class="orderId" value="' + data.list[i].id + '" />' +
                                '<input type="hidden" class="orderUser" value="' + data.list[i].username + '" />' +
                                '<input type="hidden" class="carId" value="' + data.list[i].veid + '" />' +
                                '<button class="btn btn-qxyd cancelmeet">取消</button> ' +
                                '<button class="btn editmeet">修改</button>' +
                                '</div>' +
                                '</div>';
                        } else {
                            if(Date.parse(new Date())-Date.parse(new Date(data.list[i].endatetime)) < 0){
                                html = html + '<div class="clearfix mgt15 btns-box-my">' +
                                    '<p class="fr finish-txt" style="color:red">进行中</p>' +
                                    '</div>';
                            }else {
                                html = html + '<div class="clearfix mgt15 btns-box-my">' +
                                    '<p class="fr finish-txt">已完成</p>' +
                                    '</div>';
                            }
                        }
                        html = html + '</div>' +
                            '</li>';
                    }
                   
                }
				 //调用分页
                    pagination.Initialization(data.total, pagination.myCars_rows_count, data.pageNum, my.cars.page_list);
                $('.my-box').html(html);
                layer.close(layerIndex);
            }
        },
        meeting: {
            Initialization: function () {
                /*初始化用户名*/
                common.menusInitialization();
                /*初始化列表*/
                my.meeting.page_list(1);
                /*取消预定*/
                $("body").delegate(".my-box .my .cancelmeet", "click", function (e) {
                    var orderId = $(e.currentTarget).parent().find('input.orderId').eq(0).val();
                    common.showPopbox('删除会议室预定', $('#qxyd'), function () {
                        $('#qxyd .qxyd-orderUser').html($(e.currentTarget).parent().find('.orderUser').val());
                        $('#qxyd .qxyd-orderDate').html($(e.currentTarget).parent().parent().siblings('h2').text().split(' ')[0]);
                        $('#qxyd .qxyd-orderTime').html($(e.currentTarget).parent().parent().siblings('h2').find('span').text());
                        $('#qxyd_reason').val('');
                        $('#qxyd_mark').val('');
                    }, function (layerIndex) {
                        my.meeting.cancelOrder(orderId, layerIndex);
                        layer.close(layerIndex);
                    });
                });
                /*查询*/
                $('.search').click(function () {
                    my.meeting.page_list(1);
                });

                /**导入与会人员*/
                $('#hysyd a.importUsers').click(function () {
                    common.showPopbox('导入与会人员', $('#drry'), function () {
                        /**赋初值**/
                        $('#deptId').val('');
                        $('#userJob').val('');
                        $('#name').val('');
                        my.meeting.deptDropList();
                        my.meeting.attendList();
                    }, function (layerindex) {
                        var attendUser = common.arrayPutList($('#drry .table-table input[name="attendUser"]:checked'), ',');
                        var targetIdArr = common.string2Array(attendUser.id, ',');
                        var targetNameArr = common.string2Array(attendUser.name, '、');
                        var oldIdArr = common.string2Array($('#attendId').val(), ',');
                        var oldNameArr = common.string2Array($('#attendName').val(), '、');
                        var mergeArrayId = common.mergeArray(oldIdArr, targetIdArr);
                        var mergeArrayName = common.mergeArray(oldNameArr, targetNameArr);
                        $('#attendName').val(mergeArrayName.mergeArray.join('、'));
                        $('#attendId').val(mergeArrayId.mergeArray.join(','));
                        layer.close(layerindex);
                    });
                });
                /**清除与会人员*/
                $('#hysyd a.clearUsers').click(function () {
                    $('#attendName').val('');
                    $('#attendId').val('');
                });
                /**与会人员查询按钮**/
                $('#drry .searchAttend').click(function () {
                    my.meeting.attendList();
                });
                /**预置与会人员全选事件**/
                $("body").delegate("#allcheck", "click", function (e) {
                    $('#drry .table-table input[name="attendUser"]').each(function () {
                        $(this).attr('checked', !!$(e.currentTarget).attr('checked'));
                    });
                });

                /**点击修改预定**/
                $("body").delegate(".my-box .my .editmeet", "click", function (e) {
                    var orderId = $(e.currentTarget).parent().find('.orderId').val();
                    webserver.query(null, apipath.meeting.order.single + orderId, methods.search, function (error, data, layerIndex) {

                        common.showPopbox('修改会议室预定', $('#hysyd'), function () {
                            $('.orderDate').html(common.myDate.dateFormat(data.orderStarttime, 'yyyy-MM-dd'));
                            $('.orderUserName').html(data.orderUsername);
                            $('#topic').val(data.orderTopic);
                            $('#meetingEndTime').val(common.myDate.dateFormat(data.orderEndtime, 'hh:mm'));
                            $('#meetingStartTime').val(common.myDate.dateFormat(data.orderStarttime, 'hh:mm'));
                            $('#hostName').val((data.hostUser?data.hostUser.userName:'<span class="lightGrey">(无)</span>'));
                            $('#hostNamehid').val(data.hostUser.userId);
                            $('#attendName').val(common.arrayList(data.attendList, 'userName', '、'));
                            $('#attendId').val(common.arrayList(data.attendList, 'userId', ','));
                        }, function (layerIndex) {
                            if ($('.order-form').validationEngine('validate')) {
                            my.meeting.confirmOrder(data.roomId, layerIndex, orderId);
                            layer.close(layerIndex);
                            }
                        });
                        layer.close(layerIndex);
                    });
                });
                /**主持人输入框变化的时候，清空隐藏域**/
                $('#hostName').bind('input propertychange', function () {
                    $('#hostNamehid').val('');
                });
                /**主持人自动补全插件使用**/
                $('#hostName').autocomplete({
                    serviceUrl: apipath.meeting.users.list + '?userId=1&token=1&page=1&rows=10',
                    type: 'GET',
                    dataType: 'json',
                    paramName: 'name',
                    zIndex: 20891021,//要超过19891020
                    onSelect: function (suggestion) {
                        $('#hostNamehid').val(suggestion.data);
                    },
                    onHint: function (hint) {
                        $('#hostName-list').val(hint);
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
            },
            attendList: function () {
                var params = {};
                params.page = 1;
                params.rows = pagination.deptDropList_rows_count;
                params.deptId = $('#deptId').val();
                params.name = $('#name').val();
                webserver.query(params, apipath.meeting.users.list, methods.search, my.meeting.callback_attendList);
            },
            callback_attendList: function (error, data, layerIndex) {
                var html = '<tr><th><input id="allcheck" type="checkbox" /></th>' +
                    '<th>姓名</th>' +
                    '<th style="width: 34%;">部门</th></tr>';
                for (var i = 0; i < data.list.length; i++) {
                    html = html +
                        '<tr><td><input type="checkbox" value="' + data.list[i].userId + '" name="attendUser" /></td>' +
                        '<td class="userName">' + data.list[i].userName + '</td>' +
                        '<td>' + data.list[i].deptName + '</td></tr>';
                }
                $('#drry .table-table').html(html);
                layer.close(layerIndex);
            },
            deptDropList: function () {
                var params = {};
                params.page = 1;
                params.rows = pagination.attendList_rows_count;
                webserver.query(params, apipath.meeting.dept.list, methods.search, function (error, data, layerIndex) {
                    var html = '<option value="">不限</option>';
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<option value="' + data.list[i].deptId + '">' + data.list[i].deptName + '</option>';
                    }
                    $('#deptId').html(html);
                });
            },
            confirmOrder: function (roomId, PopBox_layerIndex, orderId) {
                common.showPopbox('请确认会议室预定信息', $('#qryd'), function () {
                    $('#qryd .qr-orderName').html($('#hysyd .orderUserName').html());
                    $('#qryd .qr-orderDate').html($('#hysyd .orderDate').html());
                    $('#qryd .qr-roomNumber').html(roomId);
                    $('#qryd .qr-topic').html($('#topic').val());
                    $('#qryd .qr-hostName').html($('#hostName').val());
                    $('#qryd .qr-attendList').html($('#attendName').val());
                    $('#qryd .qr-orderTime').html($('#meetingStartTime').val() + '-' + $('#meetingEndTime').val());
                    webserver.query(null, apipath.meeting.room.single + roomId, methods.search, function (error, data, layerIndex) {
                        $('#qryd .qr-position').html(data.roomNo + '室');
                        $('#qryd .qr-personCount').html(data.roomSize + '人');
                        $('#qryd .qr-orderType').html(data.typeName);
                        $('#qryd .qr-equipName').html(common.arrayList(data.equipList, 'equipName', ' '));
                        layer.close(layerIndex);
                    });
                }, function (PopBoxConfirm_layerIndex) {
                    var params = {};
                    params.orderAttend = $('#attendId').val();
                    params.orderEndtime = Date.parse($('#hysyd .t-table .orderDate').text() + ' ' + $('#meetingEndTime').val());
                    params.orderHost =  $('#hostNamehid').val();
                    params.orderStarttime = Date.parse($('#hysyd .t-table .orderDate').text() + ' ' + $('#meetingStartTime').val());
                    params.orderTopic = $('#topic').val();
                    params.roomId = roomId;
                    webserver.query(params, apipath.meeting.order.edit + orderId, methods.edit, function (error, data, layerIndex) {
                        layer.close(layerIndex);
                        var textmsg = '您已成功预定' + data.roomName + '会议室，并向与会人员发出邮件通知；<br>时间：' + common.myDate.dateFormat(new Date(data.orderStarttime), 'yyyy年MM月dd日') + ' ' + common.myDate.dateFormat(new Date(data.orderStarttime), 'hh:mm') + ' - ' + common.myDate.dateFormat(new Date(data.orderEndtime), 'hh:mm');
                        common.showAlert(1, textmsg, function (index) {
                            layer.close(layerIndex);
                            window.location.reload();
                        });
                    });
                    layer.close(PopBoxConfirm_layerIndex);
                    layer.close(PopBox_layerIndex);
                });
            },
            cancelOrder: function (orderId, layerIndex) {
                var params = {};
                params.reason = $('#qxyd_reason').val();
                params.remark = $('#qxyd_mark').val();
                webserver.query(params, apipath.meeting.order.delete + orderId, methods.delete, function (error, data, layerIndex) {
                    layer.close(layerIndex);
                });
            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.myMeeting_rows_count,
                    date: $('#Date').val()
                };
                webserver.query(param, apipath.my.meeting.list, methods.search, my.meeting.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<li>' +
                            '<div class="my">' +
                            '<h2>' + common.myDate.dateFormat(data.list[i].orderStarttime, 'yyyy-MM-dd') + ' <span>' + common.myDate.dateFormat(data.list[i].orderStarttime, 'hh:mm') + ' - ' + common.myDate.dateFormat(data.list[i].orderEndtime, 'hh:mm') + '</span></h2>' +
                            '<p>' + data.list[i].roomId + '号会议室<br>主持人：' + (data.list[i].hostUser?data.list[i].hostUser.userName:'<span class="lightGrey">(无)</span>') + '<br>主题：' + data.list[i].orderTopic +
                            '</p>';
                        if (Date.parse(new Date(data.list[i].orderStarttime)) - Date.parse(new Date()) > 0) {
                            var strDate=common.myDate.timeLength(Date.parse(new Date()), Date.parse(new Date(data.list[i].orderStarttime)));
                            html = html + '<div class="clearfix mgt15 btns-box-my">' +
                                '<div class="last-txt">' +
                                strDate+
                                '</div>' +
                                '<div class="fr">' +
                                '<input type="hidden" class="orderId" value="' + data.list[i].orderId + '" />' +
                                '<input type="hidden" class="orderUser" value="' + data.list[i].orderUsername + '" />' +
                                '<button class="btn btn-qxyd cancelmeet">删除</button> ' +
                                '<button class="btn editmeet">修改</button>' +
                                '</div>' +
                                '</div>';
                        } else {
                            if(Date.parse(new Date())-Date.parse(new Date(data.list[i].orderEndtime)) < 0){
                                html = html + '<div class="clearfix mgt15 btns-box-my">' +
                                    '<p class="fr finish-txt" style="color:red">进行中</p>' +
                                    '</div>';
                            }else {
                                html = html + '<div class="clearfix mgt15 btns-box-my">' +
                                    '<p class="fr finish-txt">已完成</p>' +
                                    '</div>';
                            }
                        }
                        html = html + '</div>' +
                            '</li>';
                    }
                   
                }
				 //调用分页
                    pagination.Initialization(data.total, pagination.myMeeting_rows_count, data.pageNum, my.meeting.page_list);
                $('.my-box').html(html);
                layer.close(layerIndex);
            }
        },
        trips: {
            Initialization: function () {
                /*初始化用户名*/
                common.menusInitialization();
                /*初始化列表*/
                my.trips.page_list(1);

                /*查询*/
                $('.search').click(function () {
                    my.trips.page_list(1);
                });
                /*开始行程*/
                $("body").delegate(".my-box .my .btn-start", "click", function (e) {
                    var orderId = $(e.currentTarget).parent().find('.orderId').val();
                    common.showConfirm('请您确认以下信息', '您将开始此段行程', function () {
                    }, function () {
                        var params = {};
                        webserver.query(params, apipath.cars.drivers.start + orderId, methods.edit);
                    });
                });
                /*结束行程*/
                $("body").delegate(".my-box .my .btn-jieshu", "click", function (e) {
                    var orderId = $(e.currentTarget).parent().find('.orderId').val();
                    common.showPopbox('结束行程', $('#endTask'), function () {
                        $('#endTask .userName').text($(e.currentTarget).parent().find('.orderUser').val());
                        $('#endTask .userDate').text($(e.currentTarget).parent().find('.orderDate').val());
                        $('#endTask .departure').text($(e.currentTarget).parent().find('.orderDeparture').val());
                        $('#endTask .destination').text($(e.currentTarget).parent().find('.orderDestination').val());
                    }, function (layerIndex) {
                         if ($('#ordertripform').validationEngine('validate')) {
                             var params = {
                                 "distance": $('#mileageCount').val(),
                                 "oil": $('#oilCount').val()
                             };
                             webserver.query(params, apipath.cars.drivers.end + orderId, methods.edit);
                             layer.close(layerIndex);
                         }
                    });
                });
            },
            page_list: function (current_page) {
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.myTrips_rows_count,
                    sdate: $('#startTime').val(),
                    edate: $('#endTime').val()
                };
                webserver.query(param, apipath.cars.drivers.orderlist, methods.search, my.trips.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<li>' +
                            '<div class="my">' +
                            '<h2>' + common.myDate.dateFormat(Date.parse(data.list[i].bedatetime), 'yyyy-MM-dd') +
                            '<span>' + common.myDate.dateFormat(Date.parse(data.list[i].bedatetime), 'hh:mm') + ' - ' + common.myDate.dateFormat(Date.parse(data.list[i].endatetime), 'hh:mm') + '</span></h2>' +
                            '<p>预定用户：' + data.list[i].username + '&nbsp;&nbsp;｜&nbsp;&nbsp;联系电话：' + data.list[i].usertel +
                            '<br>出发地：' + data.list[i].departure + '&nbsp;&nbsp;｜&nbsp;&nbsp;目的地：' + data.list[i].destination +
                            '</p>';
                        switch (data.list[i].mstate) {
                            case 0:
                                html = html + '<div class="clearfix mgt15 btns-box-my">' +
                                    '<div class="last-txt">' ;
                                if (Date.parse(new Date(data.list[i].bedatetime)) - Date.parse(new Date()) > 0) {
                                    html = html +  common.myDate.timeLength(Date.parse(new Date()), Date.parse(new Date(data.list[i].bedatetime))) ;
                                }
                                else {
                                    html = html + '超过预定时间';
                                }
                                html = html + '</div>' +
                                '<div class="fr">' +
                                '<input type="hidden" class="orderId" value="' + data.list[i].id + '" />' +
                                '<button class="btn btn-start">开始行程</button>' +
                                '</div>' +
                                '</div>';
                                break;
                            case 1:
                                html = html + '<div class="clearfix mgt15 btns-box-my">' +
                                    '<p class="fr finish-txt">已完成</p>' +
                                    '</div>';
                                break;
                            case 2:
                                html = html + '<div class="clearfix mgt15 btns-box-my">' +
                                    '<div class="last-txt">' +
                                    '</div>' +
                                    '<div class="fr">' +
                                    '<input type="hidden" class="orderId" value="' + data.list[i].id + '" />' +
                                    '<input type="hidden" class="orderUser" value="' + data.list[i].username + '" />' +
                                    '<input type="hidden" class="orderDate" value="' + common.myDate.dateFormat(Date.parse(data.list[i].bedatetime),'yyyy-MM-dd hh:mm') +
                                    ' - '+common.myDate.dateFormat(Date.parse(data.list[i].endatetime),'hh:mm') +'" />' +
                                    '<input type="hidden" class="orderDeparture" value="' + data.list[i].departure + '" />' +
                                    '<input type="hidden" class="orderDestination" value="' + data.list[i].destination + '" />' +
                                    '<button class="btn btn-jieshu">结束行程</button>' +
                                    '</div>' +
                                    '</div>';
                                break;
                            default:
                                break;
                        }
                        html = html + '</div>' +
                            '</li>';
                    }
                    
                }
				//调用分页
                    pagination.Initialization(data.total, pagination.myTrips_rows_count, data.pageNum, my.trips.page_list);
                $('.my-box').html(html);
                layer.close(layerIndex);
            }
        },
        Ordermeal: {
            Initialization: function () {
                /*初始化用户名*/
                common.menusInitialization();
                /*初始化列表*/
                my.Ordermeal.page_list();

                /*查询*/
                $('.search').click(function () {
                    my.Ordermeal.page_list();
                });
            },
            page_list: function () {
                var param = {};
                webserver.query(param, apipath.my.food.list, methods.search, my.Ordermeal.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var nowDate = new Date();
                var week = nowDate.getDay();
                var dayOfMonth = new Date(nowDate.getFullYear(), (nowDate.getMonth() + 1), 0).getDate();
                var firstDayWeek = -1;
                common.myDate.serverDate('', function (err, data, layerIndex) {
                    nowDate = data.time;
                    week = data.week;
                    dayOfMonth = data.dayOfMonth;
                    firstDayWeek = data.firstDayWeek;
                    layer.close(layerIndex);
                });
                $('.top-chioce .hys-txt h2').html(common.myDate.dateFormat(nowDate, 'yyyy年MM月dd日') + '&nbsp;&nbsp;' + common.myDate.DigitalUppercase(week));
                var html =
                    '<tr>' +
                    '<th>星期一</th>' +
                    '<th>星期二</th>' +
                    '<th>星期三</th>' +
                    '<th>星期四</th>' +
                    '<th>星期五</th>' +
                    '<th>星期六</th>' +
                    '<th>星期日</th>' +
                    '</tr>';
                var day = 0;
                for (var j = 0; j < Math.ceil(dayOfMonth / 7); j++) {
                    html = html + '<tr>';
                    for (var i = 1; i < 8; i++) {
                        if(j === 0 ) {
                            if (firstDayWeek > i) {
                                html = html + '<td></td>';
                            }else{
                                day =day + 1;
                                html = html + '<td class="day' + (Array(2).join(0) + day).slice(-2) + '">' + day + '</td>';
                            }
                        } else {
                            if (day < dayOfMonth) {
                                day =day + 1;
                                html = html + '<td class="day' + (Array(2).join(0) + day).slice(-2) + '">' + day + '</td>';
                            } else {
                                html = html + '<td></td>';
                            }
                        }
                    }
                    html = html + '</tr>';
                }
                $('.dc-table').html(html);
                /*展示详情*/
                for (var i = 0; i < data.length; i++) {
                    var html = '<span class="hover-box">';
                    if (data[i].orderId) {
                        html = html + '您已订餐' +
                            '<br>';
                    }
                    if (data[i].guestNum) {
                        html = html + '您已订客餐：' + data[i].guestNum + '人'+'<br>';
                    }
                    if (data[i].roomOrderNum) {
                        html = html + '您已订' + data[i].roomOrderNum + '人包间';
                    }
                    html = html + '</span>';
                    var thisday = parseInt(data[i].orderDate);
                    var classday = common.myDate.dateFormat(thisday, 'dd');
                    thisday=common.myDate.dateFormat(parseInt(data[i].orderDate),'yyyy-MM-dd');
                    if (Date.parse(thisday) < Date.parse(common.myDate.dateFormat(parseInt(nowDate),'yyyy-MM-dd'))) {
                        $('.dc-table').find('td.day' + classday).addClass('dc-have').append(html);
                    } else {
                        $('.dc-table').find('td.day' + classday).addClass('dc-ing').append(html);
                    }
                }
                layer.close(layerIndex);
            }
        },
    }
})(jQuery);