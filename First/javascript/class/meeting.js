/**
 * 会议室接口交互类
 * (c) Copyright 2017 XianGuan.HU. All Rights Reserved.
 * 2017-10-10
 */
(function () {
    meeting = {
        /**查看订阅**/
        view_book: {
            Initialization: function () {
                /**初始化菜单* */
                common.menusInitialization();
                /**分类获取**/
                meeting.view_book.showTypes();
                /**初始化列表**/
                meeting.view_book.page_list(1);
                /**查询事件*/
                $('.search').click(function () {
                    if ($('.form-search').validationEngine('validate')) {
                        meeting.view_book.page_list(1);
                    }
                });
                /**点击会议室跳转*/
                $("body").delegate(".data-list a", "click", function (e) {
                    common.cookies.set('orderRoomId', $(e.currentTarget).find('.list-one .num').text());
                    common.cookies.set('startDateTime', $("#startTime").val());
                    common.cookies.set('endDateTime', $("#endTime").val());
                });
            },
            showTypes: function () {
                /** 获取分类 **/
                var param = {};
                webserver.query(param, apipath.meeting.types.list, methods.search, function (error, data, layerIndex) {
                    var html = '';
                    for (var i = 0; i < data.length; i++) {
                        html = html + '<option value="' + data[i].typeId + '">' + data[i].typeName + '</option>';
                    }
                    $('#typeId').append(html);
                    layer.close(layerIndex);
                });
            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.view_book_rows_count
                };
                //获取相关条件
                param.floor = $('#floor').val();
                param.maxSize = $('#maxSize').val();
                param.typeId = $('#typeId').val();
                param.rStatus = $('#rStatus').val();
                param.startTime = $('#startTime').val();
                param.endTime = $('#endTime').val();
                webserver.query(param, apipath.meeting.room.list, methods.search, meeting.view_book.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<li>' +
                            '<a href="meetingRoomOrder.html">' +
                            '<ul class="list-one">' +
                            '<li class="num">' +
                            data.list[i]["roomId"] +
                            '</li>' +
                            '<li class="hys">' +
                            '<p>' + data.list[i]["roomName"] + '</p>' +
                            data.list[i]["roomFloor"] + '楼' + data.list[i]["roomLocation"] +
                            '室</li>' +
                            '<li class="rl">' +
                            '容量' + data.list[i]["roomSize"] + '人' +
                            '</li>' +
                            '<li class="lb">' +
                            data.list[i]["typeName"] +
                            '</li>' +
                            '<li class="ss">';
                        for (var j = 0; j < data.list[i].equipList.length; j++) {
                            html = html + data.list[i].equipList[j]["equipName"] + '  ';
                        }
                        html = html + '</li>' +
                            '<li class="zt">';

                        var color = "blue";
                        if (data.list[i]["voStatus"] == '空闲') {
                            color = "blue";
                        } else if (data.list[i]["voStatus"] == '已预订') {
                            color = "green";
                        } else if (data.list[i]["voStatus"] == '使用中') {
                            color = "red";
                        } else if (data.list[i]["voStatus"] == '故障') {
                            color = "red";
                        }

                        html = html + '<span class="' + color + '">' + data.list[i]["voStatus"] + '</span>' +
                            '</li>' +
                            '</ul>' +
                            '</a>' +
                            '</li>';
                    }

                } //调用分页
                pagination.Initialization(data.total, pagination.view_book_rows_count, data.pageNum, meeting.view_book.page_list);
                $('.data-list').html(html);
                layer.close(layerIndex);
            }
        },
        /**会议室管理**/
        manage: {
            Initialization: function () {
                /**初始化菜单* */
                common.menusInitialization();
                /**初始化列表* */
                meeting.manage.page_list(1);
                /**点击会议室跳转*/
                $("body").delegate(".data-list a", "click", function (e) {
                    common.cookies.set('orderRoomId', $(e.currentTarget).find('.list-one .num').text());
                    common.cookies.delete('startDateTime');
                    common.cookies.delete('endDateTime');
                });
                /**预置按钮事件*/
                $("body").delegate(".btn-delete", "click", function (e) {
                    //阻止冒泡
                    e.stopPropagation();
                    e.preventDefault();
                    var name = $(e.currentTarget).parent().siblings("li.hys").children('p').text();
                    common.showConfirm('请您确认以下信息：', '您将删除会议室：' + name, function () {
                    }, function () {
                        var id = $(e.currentTarget).parent().siblings("li.num").text();
                        webserver.query(null, apipath.meeting.room.delete + id, methods.delete);
                    });
                });
                //修改按钮
                $("body").delegate(".btn-details", "click", function (e) {
                    //阻止冒泡
                    e.stopPropagation();
                    e.preventDefault();
                    var roomId = $(e.currentTarget).parent().siblings("li.num").text();
                    var d1 = $.Deferred();
                    var d2 = $.Deferred();
                    var d3 = $.Deferred();

                    meeting.manage.showTypes(d1);
                    meeting.manage.showEquips(d2);
                    meeting.manage.showRoomDetail(d3, roomId);

                    $.when(d1, d2, d3).done(function (v1, v2, v3) {
                        common.showPopbox('修改会议室信息', $('#meeting_add'), function () {
                            /**设置初始值*/
                            var roomEquips = v3.roomEquip.split(',');
                            for (var i = 0; i < roomEquips.length; i++) {
                                $('.equips input:checkbox[value="' + roomEquips[i] + '"]').attr('checked', 'true');
                            }
                            $('#floor').val(v3.roomFloor);
                            $('#room').val(v3.roomLocation);
                            $('#name').val(v3.roomName);
                            $('#number').val(v3.roomNo);
                            $('#personnum').val(v3.roomSize);
                            $('#types').val(v3.roomType);

                        }, function (layerindex) {
                            if ($('.meeting-form').validationEngine('validate')) {
                                var param = {};

                                var equips_chk_value = []; //定义一个数组,存储会议室设备
                                $('.equips input[name="equipslist"]:checked').each(function () {
                                    equips_chk_value.push($(this).val()); //将选中的值添加到数组chk_value中
                                });

                                param.roomEquip = equips_chk_value.join(',');
                                param.roomFloor = $('#floor').val();
                                param.roomLocation = $('#room').val();
                                param.roomName = $('#name').val();
                                param.roomNo = $('#number').val();
                                param.roomSize = $('#personnum').val();
                                param.roomType = $('#types').val();

                                webserver.query(param, apipath.meeting.room.edit + roomId, methods.edit);
                                layer.close(layerindex);
                            }
                        });
                    });
                });
                /**打开新增按钮，并绑定，分类,设备，及容纳人数*/
                $('.list-box li .btn').click(function () {
                    /**使用jquery的延时处理方法，每个ajax请求完成后，
                     *把对应的Deferred置为完成状态，然后用jquery判断全部完成后再进行后续处理
                     */
                    var d1 = $.Deferred();
                    var d2 = $.Deferred();

                    meeting.manage.showTypes(d1);
                    meeting.manage.showEquips(d2);

                    $.when(d1, d2).done(function (v1, v2) {
                        common.showPopbox('新增会议室', $('#meeting_add'), function () {
                            /**赋初始值*/
                            $('#floor').val('');
                            $('#room').val('');
                            $('#name').val('');
                            $('#number').val('');
                            $('#personnum').val('');
                            $('#types').val('');
                        }, function (layerindex) {
                            if ($('.meeting-form').validationEngine('validate')) {
                                var param = {};

                                var equips_chk_value = []; //定义一个数组,存储会议室设备
                                $('.equips input[name="equipslist"]:checked').each(function () {
                                    equips_chk_value.push($(this).val()); //将选中的值添加到数组chk_value中
                                });

                                param.roomEquip = equips_chk_value.join(',');
                                param.roomFloor = $('#floor').val();
                                param.roomLocation = $('#room').val();
                                param.roomName = $('#name').val();
                                param.roomNo = $('#number').val();
                                param.roomSize = $('#personnum').val();
                                param.roomType = $('#types').val();

                                webserver.query(param, apipath.meeting.room.add, methods.add);
                                layer.close(layerindex);
                            }
                        });
                    });

                });

                //顶部的分类
                meeting.manage.showTypes();
                meeting.manage.showEquips();

                /**新增分类按钮*/
                $('#types_add_a').click(function () {
                    common.showPopbox('新增会议室分类', $('#types_add'), function () {
                    }, function (layerindex) {
                        if ($('#types_add input[name="typename"]').val() !== '') {
                            var param = {};
                            param.typeName = $('#types_add input[name="typename"]').val();
                            webserver.query(param, apipath.meeting.types.add, methods.add);
                            layer.close(layerindex);
                        }
                    });
                });
                /**修改分类按钮**/
                $('#types_edit_a').click(function () {
                    var chk_value = []; //定义一个数组
                    $('.types-ck input[name="typeslist"]:checked').each(function () { //遍历每一个名字为interest的复选框，其中选中的执行函数
                        chk_value.push({
                            id: $(this).val(),
                            name: $(this).next('label').text()
                        }); //将选中的值添加到数组chk_value中
                    });
                    if (chk_value.length !== 1) {
                        layer.msg('请您选择一项进行修改', {
                            icon: 0
                        });
                        return;
                    }
                    common.showPopbox('修改会议室分类', $('#types_add'), function () {
                        $('#types_add input[name="typename"]').val(chk_value[0]["name"]);
                    }, function (layerindex) {
                        if ($('#types_add input[name="typename"]').val() !== '') {
                            var param = {};
                            param.typeName = $('#types_add input[name="typename"]').val();
                            webserver.query(param, apipath.meeting.types.edit + chk_value[0]["id"], methods.edit);
                            layer.close(layerindex);
                        }
                    });
                });
                /**删除分类按钮**/
                $('#types_delete_a').click(function () {
                    var chk_value = []; //定义一个数组
                    $('.types-ck input[name="typeslist"]:checked').each(function () { //遍历每一个名字为interest的复选框，其中选中的执行函数
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

                    common.showConfirm('请您确认以下信息：', '您将删除会议室类型：' + namearr.join('、'), function () {
                    }, function () {
                        webserver.query(null, apipath.meeting.types.delete + idarr.join(','), methods.delete);
                    });
                });

                /**新增设备按钮**/
                $('#equips_add_a').click(function () {
                    common.showPopbox('新增会议室设备', $('#equips_add'), function () {
                    }, function (layerindex) {
                        if ($('#equips_add input[name="equipname"]').val() !== "") {
                            var param = {};
                            param.equipName = $('#equips_add input[name="equipname"]').val();
                            webserver.query(param, apipath.meeting.equips.add, methods.add);
                            layer.close(layerindex);
                        }
                    });
                });
                /**修改设备按钮**/
                $('#equips_edit_a').click(function () {
                    var chk_value = []; //定义一个数组
                    $('.equips-ck input[name="equipslist"]:checked').each(function () { //遍历每一个名字为interest的复选框，其中选中的执行函数
                        chk_value.push({
                            id: $(this).val(),
                            name: $(this).next('label').text()
                        }); //将选中的值添加到数组chk_value中
                    });
                    if (chk_value.length !== 1) {
                        layer.msg('请您选择一项进行修改', {
                            icon: 0
                        });
                        return;
                    }
                    common.showPopbox('修改会议室设备', $('#equips_add'), function () {
                        $('#equips_add input[name="equipname"]').val(chk_value[0]["name"]);
                    }, function (layerindex) {
                        if ($('#equips_add input[name="equipname"]').val() !== "") {
                            var param = {};
                            param.equipName = $('#equips_add input[name="equipname"]').val();
                            webserver.query(param, apipath.meeting.equips.edit + chk_value[0]["id"], methods.edit);
                            layer.close(layerindex);
                        }
                    });
                });
                /**删除分类按钮**/
                $('#equips_delete_a').click(function () {
                    var chk_value = []; //定义一个数组
                    $('.equips-ck input[name="equipslist"]:checked').each(function () { //遍历每一个名字为interest的复选框，其中选中的执行函数
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

                    common.showConfirm('请您确认以下信息：', '您将删除会议室设备：' + namearr.join('、'), function () {
                    }, function () {
                        webserver.query(null, apipath.meeting.equips.delete + idarr.join(','), methods.delete);
                    });
                });

            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.view_book_rows_count
                };
                webserver.query(param, apipath.meeting.room.list, methods.search, meeting.manage.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<li>' +
                            '<a href="meetingRoomOrder.html">' +
                            '<ul class="list-one">' +
                            '<li class="num">' +
                            data.list[i]["roomId"] +
                            '</li>' +
                            '<li class="hys">' +
                            '<p>' + data.list[i]["roomName"] + '</p>' +
                            data.list[i]["roomFloor"] + '楼' + data.list[i]["roomLocation"] +
                            '</li>' +
                            '<li class="rl">' +
                            '容量' + data.list[i]["roomSize"] + '人' +
                            '</li>' +
                            '<li class="lb">' +
                            data.list[i]["typeName"] +
                            '</li>' +
                            '<li class="ss">';
                        for (var j = 0; j < data.list[i].equipList.length; j++) {
                            html = html + data.list[i].equipList[j]["equipName"] + '  ';
                        }
                        html = html + '</li>' +
                            '<li class="zt">' +
                            '<button class="btn-delete">删除</button> ' +
                            '<button class="btn-details">修改</button>' +
                            '</li>' +
                            '</ul>' +
                            '</a>' +
                            '</li>';

                    }


                }//调用分页
                pagination.Initialization(data.total, pagination.manage_rows_count, data.pageNum, meeting.manage.page_list);
                $('.data-list').html(html);
                layer.close(layerIndex);
            },
            showEquips: function (d) {
                /**
                 * 获取设备
                 */
                var param = {};
                webserver.query(param, apipath.meeting.equips.list, methods.search, function (error, data, layerIndex) {
                    var html = '';
                    for (var i = 0; i < data.length; i++) {
                        html = html + '<input name="equipslist" id="e' + i + '" value="' + data[i].equipId + '" type="checkbox" /><label for="e' + i + '">' + data[i].equipName + '</label>';
                    }
                    /**
                     * 判断在哪里显示
                     */
                    if (d) {
                        $('.pop-box .pop-txt .t-table .equips').html(html);
                        d.resolve();
                    } else {
                        $('.equips-ck').html(html);
                    }
                    layer.close(layerIndex);
                });

            },
            showTypes: function (d) {
                /**
                 * 获取分类
                 */
                var param = {};
                webserver.query(param, apipath.meeting.types.list, methods.search, function (error, data, layerIndex) {
                    var html = '';

                    if (d) {
                        for (var i = 0; i < data.length; i++) {
                            html = html + '<option value="' + data[i].typeId + '">' + data[i].typeName + '</option>';
                        }
                        $('.pop-box .pop-txt .t-table .types').html(html);
                        d.resolve();
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            html = html + '<input name="typeslist" id="t' + i + '" value="' + data[i].typeId + '" type="checkbox" /><label for="t' + i + '">' + data[i].typeName + '</label>';
                        }
                        $('.types-ck').html(html);
                    }
                    layer.close(layerIndex);
                });
            },
            showRoomDetail: function (d, roomId) {
                /**
                 * 获取指定会议室
                 */
                webserver.query(null, apipath.meeting.room.single + roomId, methods.search, function (error, data, layerIndex) {
                    layer.close(layerIndex);
                    if (d) {
                        d.resolve(data);
                    }
                });

            }
        },
        /**会议室统计**/
        orderTimes: {
            /**初始化**/
            Initialization: function () {
                /**初始化菜单* */
                common.menusInitialization();

                /*初始化時間，默認上個月，寫在前面*/
                var DateArr = common.myDate.setDate.getPreviousMonth();
                $("#startTime").val(common.myDate.dateFormat(DateArr[0],'yyyy-MM-dd'));
                $("#endTime").val(common.myDate.dateFormat(DateArr[1],'yyyy-MM-dd'));

                meeting.orderTimes.list();
                /**查询事件*/
                $('.search').click(function () {
                    meeting.orderTimes.list();
                });

                /**预置详情按钮事件*/
                $("body").delegate(".chart-box .btn-details", "click", function (e) {
                    /**通过cookies传递roomid**/
                    common.cookies.set('orderRoomId', $(e.currentTarget).attr("title"));
                    common.cookies.set('startDateTime', $("#startTime").val());
                    common.cookies.set('endDateTime', $("#endTime").val());
                });
            },
            list: function () {
                var param = {};
                param.startTime = $('#startTime').val();
                param.endTime = $('#endTime').val();
                webserver.query(param, apipath.meeting.orderTimes.list, methods.search, meeting.orderTimes.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.length && data.length > 0) {

                    var totaltimes = 0;
                    for (var i = 0; i < data.length; i++) {
                        totaltimes = totaltimes + data[i].orderTimes;
                    }

                    for (var i = 0; i < data.length; i++) {
                        html = html +
                            '<ul class="chart-box">' +
                            '<li class="hys-details">' +
                            '<p>' + data[i].roomName + '</p>' +
                            '<a title=' + data[i].roomId + ' class="btn-details" href="meetingRoomStatisticsDetail.html">详情</a>' +
                            '</li>' +
                            '<li class="long">';
                        var j = common.RandomNum(1, 7);
                        html = html +
                            '<div class="color-' + j + '" style="width:' + (parseInt(totaltimes) === 0 ? 0 : (parseFloat(data[i].orderTimes) / parseFloat(totaltimes) * 100).toFixed(2)) + '%;">22</div>' +
                            '<span class="color-' + j + '">' + data[i].orderTimes + '次</span>' +
                            '</li>' +
                            '</ul>';
                    }
                }
                $('.chartlist').html(html);
                layer.close(layerIndex);
            }
        },
        /**会议室使用详情**/
        orderDetail: {
            Initialization: function () {
                /**初始化* */
                /**初始化菜单* */
                common.menusInitialization();
                /**获取传递过来的roomid**/
                var roomId = common.cookies.get('orderRoomId');
                if (common.cookies.get('startDateTime') && common.cookies.get('endDateTime')) {
                    $('#startTime').val(common.cookies.get('startDateTime').slice(0, 10));
                    $('#endTime').val(common.cookies.get('endDateTime').slice(0, 10));
                }
                /**列表**/
                meeting.orderDetail.page_list(1, roomId);
                /**房间详情**/
                meeting.orderDetail.roomInfo(roomId);
                /**查询事件*/
                $('.search').click(function () {
                    meeting.orderDetail.page_list(1, roomId);
                });
            },
            page_list: function (current_page, roomId) {
                if (!roomId) {
                    roomId = common.cookies.get('orderRoomId');
                }
                var param = {};
                //获取相关条件
                param.startTime = $('#startTime').val();
                param.endTime = $('#endTime').val();
                param.page = current_page;
                param.rows = pagination.orderDetail_rows_count;
                webserver.query(param, apipath.meeting.orderDetail.list + roomId, methods.search, meeting.orderDetail.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    html = '<tr>' +
                        '<th>开始日期</th>' +
                        '<th>结束时间</th>' +
                        '<th>预定人</th>' +
                        '<th>主持人</th>' +
                        '<th>参会人员</th>' +
                        '<th>主题</th>' +
                        '</tr>';
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<tr>' +
                            '<td>' + common.myDate.dateFormat(data.list[i].orderStarttime, 'yyyy-MM-dd hh:mm:ss') + '</td>' +
                            '<td>' + common.myDate.dateFormat(data.list[i].orderEndtime, 'yyyy-MM-dd hh:mm:ss') + '</td>' +
                            '<td>' + data.list[i].orderUsername + '</td>' +
                            '<td>' + (data.list[i].hostUser?data.list[i].hostUser.userName:'<span class="lightGrey">(无)</span>') + '</td>' +
                            '<td>' + common.arrayList(data.list[i].attendList, 'userName', '、') + '</td>' +
                            '<td>' + data.list[i].orderTopic + '</td>' +
                            '</tr>';
                    }

                } //调用分页
                pagination.Initialization(data.total, pagination.orderDetail_rows_count, data.pageNum, meeting.orderDetail.page_list);
                $('.table-box').html(html);
                layer.close(layerIndex);
            },
            roomInfo: function (roomId) {
                webserver.query(null, apipath.meeting.room.single + roomId, methods.search, function (error, data, layerIndex) {
                    $('.cur-page-txt span').html(roomId + " 号会议室使用详情");
                    $('.hys-txt h2').html(data.roomName).siblings('p').html(data.roomFloor + '楼' + data.roomLocation + '室 &nbsp;|&nbsp; 容量' + data.roomSize + '人&nbsp; | &nbsp;' + data.typeName + '&nbsp; | &nbsp;' + common.arrayList(data.equipList, 'equipName', ' '));
                    layer.close(layerIndex);
                });
            }
        },
        /**会议室预订**/
        preOrder: {
            Initialization: function () {
                /**初始化* */
                /**初始化菜单* */
                common.menusInitialization();
                /**获取传递过来的roomid**/
                var roomId = common.cookies.get('orderRoomId');
                /**列表**/
                meeting.preOrder.list(roomId);
                /**房间详情**/
                meeting.preOrder.roomInfo(roomId);
                /**查询事件*/
                $('.search').click(function () {
                    meeting.preOrder.list(roomId);
                });
                /**预置预定按钮事件*/
                $("body").delegate("ul[class^='day'] li.hy-set a.can-dy", "click", function (e) {
                    common.showPopbox('会议室预定', $('#hysyd'), function () {
                        $('.orderDate').html($(e.currentTarget).parents().siblings('.week').attr('title'));
                        $('.orderUserName').html(JSON.parse(common.cookies.get('!@#2017hd_user')).userName);
                        $('#topic').val('');
                        $('#hostName').val('');
                        $('#attendName').val('');
                        $('#meetingEndTime').val($(e.currentTarget).find('.yd-end').text());
                        $('#meetingStartTime').val($(e.currentTarget).find('.yd-start').text());
                    }, function (layerIndex) {
                        if ($('.order-form').validationEngine('validate')) {
                            meeting.preOrder.confirmOrder(roomId, layerIndex, 'add');
                        }
                    });
                });
                /**导入与会人员*/
                $('#hysyd a.importUsers').click(function () {
                    common.showPopbox('导入与会人员', $('#drry'), function () {
                        /**赋初值**/
                        $('#deptId').val('');
                        $('#userJob').val('');
                        $('#name').val('');
                        meeting.preOrder.deptDropList();
                        meeting.preOrder.attendList();
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
                    meeting.preOrder.attendList();
                });
                /**预置与会人员全选事件**/
                $("body").delegate("#allcheck", "click", function (e) {
                    $('#drry .table-table input[name="attendUser"]').each(function () {
                        $(this).attr('checked', !!$(e.currentTarget).attr('checked'));
                    });
                });
                /**预置选择预定，显示详情**/
                $("body").delegate("ul[class^='day'] li.hy-set a.done", "mouseover", function (e) {
                    common.showTips($(e.currentTarget).find('p').html(), $(e.currentTarget), $(e.currentTarget).css('background-color'), 4000);
                });
                /**点击预定好的修改/删除预定**/
                $("body").delegate("ul[class^='day'] li.hy-set a.lready-dy", "click", function (e) {
                    /**展示选择层，目前最多两种选择，一个取消按钮**/
                    var orderId = $(e.currentTarget).find('input[name="orderId"]').val();
                    layer.msg('<span style="color:#ffffff">请选择以下操作：</span>', {
                        time: 0,
                        btn: ['修改', '删除'],
                        shadeClose: true,
                        shade: 0.3,
                        btn1: function (index) {
                            layer.close(index);
                            webserver.query(null, apipath.meeting.order.single + orderId, methods.search, function (error, data, layerIndex) {
                                common.showPopbox('修改会议室预定', $('#hysyd'), function () {
                                    $('.orderDate').html($(e.currentTarget).parents().siblings('.week').attr('title'));
                                    $('.orderUserName').html($(e.currentTarget).find('.orderUser').text());
                                    $('#topic').val($(e.currentTarget).find('.topic').text());
                                    $('#meetingEndTime').val($(e.currentTarget).find('.yd-end').text());
                                    $('#meetingStartTime').val($(e.currentTarget).find('.yd-start').text());
                                    $('#hostName').val((data.hostUser?data.hostUser.userName:'<span class="lightGrey">(无)</span>'));
                                    $('#hostNamehid').val(data.hostUser.userId);
                                    $('#attendName').val(common.arrayList(data.attendList, 'userName', '、'));
                                    $('#attendId').val(common.arrayList(data.attendList, 'userId', ','));
                                }, function (layerIndex) {
                                    if ($('.order-form').validationEngine('validate')) {
                                        meeting.preOrder.confirmOrder(0, layerIndex, 'edit', orderId);
                                        layer.close(layerIndex);
                                    }
                                });
                                layer.close(layerIndex);
                            });
                        }
                        , btn2: function (index) {
                            layer.close(index);
                            common.showPopbox('删除会议室预定', $('#qxyd'), function () {
                                $('#qxyd .qxyd-orderUser').html($(e.currentTarget).find('.orderUser').text());
                                $('#qxyd .qxyd-orderDate').html($(e.currentTarget).parents().siblings('.week').attr('title'));
                                $('#qxyd .qxyd-orderTime').html($(e.currentTarget).find('.yd-start').text() + '-' + $(e.currentTarget).find('.yd-end').text());
                                $('#qxyd_reason').val('');
                                $('#qxyd_mark').val('');
                            }, function (layerIndex) {
                                meeting.preOrder.cancelOrder($(e.currentTarget).find('input[name="orderId"]').val(), layerIndex);
                                layer.close(layerIndex);
                            });
                        }
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
            list: function (roomId) {
                var timestamp = Date.parse(new Date());
                /*当前时间的默认值*/
                if (!$('#startTime').val()) {
                    $('#startTime').val(common.myDate.dateFormat(timestamp, 'yyyy-MM-dd'));
                }
                //获取当前时间
                $('.data-box h2').html(common.myDate.dateFormat(timestamp, 'yyyy年MM月dd日'));
                webserver.query(null, apipath.meeting.preOrder.list + roomId + "/" + $('#startTime').val(), methods.search, meeting.preOrder.callback_search);
            },
            attendList: function () {
                var params = {};
                params.page = 1;
                params.rows = pagination.deptDropList_rows_count;
                params.deptId = $('#deptId').val();
                params.userJob = $('#userJob').val();
                params.name = $('#name').val();
                webserver.query(params, apipath.meeting.users.list, methods.search, meeting.preOrder.callback_attendList);
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
            callback_search: function (err, data, layerIndex) {

                /**根据当前时间获取本周周一，设置表头，与服务器分开计算了，本地时间变化可导致混乱**/
                var firstDay = common.myDate.FirstDayOfWeek(new Date($('#startTime').val()));
                // var _nowDate = new Date($('#startTime').val());
                // var _week = _nowDate.getDay();
                // var _dayOfMonth = new Date(_nowDate.getFullYear(), (_nowDate.getMonth() + 1), 0).getDate();
                // var _firstDayWeek = -1;
                // var _monday=
                 common.myDate.serverDate($('#startTime').val(), function (err, data, layerIndex) {
                     firstDay=data.monday;
                //     _nowDate = data.time;//当前时间
                //     _week = data.week;//今天是周几
                //     _dayOfMonth = data.dayOfMonth;//本月有多少天
                //     _firstDayWeek = data.firstDayWeek;//本月第一天是周几
                     layer.close(layerIndex);
                 });

                //{week: 1, dayOfMonth: 30, time: 1510560908681, monday: "2017-11-13", firstDayWeek: 3//本月第一天是周几}

                //var myDatepic=new Date();
                for (var i = 0; i < 7; i++) {
                    var datetime = new Date();
                    if (i === 0) {
                        datetime=datetime.setFullYear(firstDay.split('-')[0],parseInt(firstDay.split('-')[1])-1,parseInt(firstDay.split('-')[2])+6);
                    }else{
                        datetime=datetime.setFullYear(firstDay.split('-')[0],parseInt(firstDay.split('-')[1])-1,parseInt(firstDay.split('-')[2])+(i-1));
                    }
                    $('.time-set .day' + i + ' .week').attr('title',common.myDate.dateFormat(datetime, 'yyyy-MM-dd') ).find('p span').text(common.myDate.dateFormat(datetime, 'dd')).parents().parents().siblings('.hy-set').html('');
                }
                /**按秒计算最小长度的百分比*/
                var basicwidth = parseFloat(100 / 14 / 60 / 60 / 1000);
                /**显示模块**/
                if (data.length && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        meeting.preOrder.showOrderModule(data[i], basicwidth);
                    }
                }

                /**获取本周的第一天**/
                /**根据当前时间获取本周周一，设置表头，与服务器分开计算了，本地时间变化可导致混乱**/
                var thisweekfirstDay = common.myDate.FirstDayOfWeek(new Date());
                var _week=new Date().getDay();
                common.myDate.serverDate('', function (err, data, layerIndex) {
                    thisweekfirstDay=data.monday;
                    //     _nowDate = data.time;//当前时间
                         _week = data.week;//今天是周几
                    //     _dayOfMonth = data.dayOfMonth;//本月有多少天
                    //     _firstDayWeek = data.firstDayWeek;//本月第一天是周几
                    layer.close(layerIndex);
                });
                /**移除选中状态**/
                $('.time-set .week').removeClass('cur-week');
                /**设置本日选中**/
                if (Date.parse(thisweekfirstDay) === Date.parse(firstDay)) {
                    $('.time-set .day' + _week + ' .week').addClass('cur-week');
                }
                /**如果查询的周一比当前的周一大，执行填充预定操作，填充可订阅部分**/
                if (Date.parse(firstDay) >= Date.parse(thisweekfirstDay)) {
                    /**填充可订阅部分**/
                    var getToday = common.myDate.dateFormat(new Date(), 'yyyy-MM-dd');
                    for (var i = 0; i < 7; i++) {
                        var currentDay = $('.time-set .day' + i + ' .week').attr('title');
                        /**过去的不能预定*/
                        if ((Date.parse(thisweekfirstDay) === Date.parse(firstDay) && (currentDay >= getToday || i === 0)) || Date.parse(firstDay) > Date.parse(thisweekfirstDay)) {
                            var a_count = $('.time-set .day' + i + ' .hy-set').children('a.done').length;
                            /**当前时间开始的位置**/
                            var nowDateStartPosition = (Date.parse(new Date()) - Date.parse(common.myDate.dateFormat(Date.parse(new Date()), 'yyyy-MM-dd') + ' 06:00:00')) * basicwidth;
                            if (a_count > 0) {
                                /**除了最后未填充部分的宽度，为百分比*/
                                /**父级的宽度*/
                                var parentwidth = $('.time-set .day' + i + ' .hy-set').css('width').replace('px', '');
                                $('.time-set .day' + i + ' .hy-set a.done').each(function () {
                                    /**每个订阅记录距左边第一个的width,百分比**/
                                    var thismarginleft = parseFloat($(this).css('margin-left').replace('px', '')) / parentwidth * 100;
                                    var lastHtml = "";
                                    var prevcount = $(this).prev('a.done').length;
                                    if (prevcount) {
                                        var premarginleft = parseFloat($(this).prev('a.done').css('margin-left').replace('px', '')) / parentwidth * 100;
                                        var prewidth = $(this).prev('a.done').css('width').replace('px', '') / parentwidth * 100;
                                        var orderbtnwidth = thismarginleft - prewidth - premarginleft;
                                        var can_dy_startPosition = prewidth + premarginleft;
                                        /**剩余小于10分钟当作不可预定 2.4=100/14/60*2*10 */
                                        if (orderbtnwidth > 2.4) {
                                            /**今天过了的时间不允许选择**/
                                            if (getToday === currentDay) {
                                                if (nowDateStartPosition > can_dy_startPosition) {
                                                    if (nowDateStartPosition < thismarginleft - 2.4) {
                                                        /**获取未预定的起止时间**/
                                                        orderbtnwidth = orderbtnwidth - (nowDateStartPosition - can_dy_startPosition);
                                                        can_dy_startPosition = nowDateStartPosition;
                                                        lastHtml = '<a style="width:' + (orderbtnwidth - 0.1) + '%;margin-left: ' + (can_dy_startPosition + 0.1) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + common.myDate.dateFormat(new Date().setMinutes(new Date().getMinutes() + 10), 'hh:mm') + '</span><span class="yd-end">' + $(this).find('.yd-start').text() + '</span></p></a>';
                                                    }
                                                } else if (nowDateStartPosition <= can_dy_startPosition) {
                                                    lastHtml = '<a style="width:' + (orderbtnwidth - 0.1) + '%;margin-left: ' + (can_dy_startPosition + 0.1) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + $(this).prev('a.done').find('.yd-end').text() + '</span><span class="yd-end">' + $(this).find('.yd-start').text() + '</span></p></a>';
                                                }
                                            } else {
                                                lastHtml = '<a style="width:' + (orderbtnwidth - 0.2) + '%;margin-left: ' + (can_dy_startPosition + 0.1) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + $(this).prev('a.done').find('.yd-end').text() + '</span><span class="yd-end">' + $(this).find('.yd-start').text() + '</span></p></a>';
                                            }
                                        }
                                    } else {
                                        if (getToday === currentDay) {
                                            if (nowDateStartPosition <= thismarginleft && (thismarginleft - nowDateStartPosition) > 2.4) {
                                                lastHtml = '<a style="width:' + (thismarginleft - nowDateStartPosition - 0.1 ) + '%;margin-left:' + nowDateStartPosition + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + common.myDate.dateFormat(new Date().setMinutes(new Date().getMinutes() + 10), 'hh:mm') + '</span><span class="yd-end">' + $(this).find('.yd-start').text() + '</span></p></a>';
                                            }
                                        } else {
                                            if ((thismarginleft - 0.1) > 2.4) {
                                                lastHtml = '<a style="width:' + (thismarginleft - 0.1) + '%;margin-left:0%" class="can-dy" href="#"><p>＋预定<span class="yd-start">06:00</span><span class="yd-end">' + $(this).find('.yd-start').text() + '</span></p></a>';
                                            }
                                        }
                                    }
                                    $(this).before(lastHtml);
                                });

                                var last = $('.time-set .day' + i + ' .hy-set a.done').last();
                                var lastmarginleft = parseFloat($(last).css('margin-left').replace('px', '')) / parentwidth * 100;
                                var lastwidth = parseFloat($(last).css('width').replace('px', '')) / parentwidth * 100;
                                var lastorderbtnwidth = 100 - lastmarginleft - lastwidth;
                                var lastorderbtnmarginleft = lastwidth + lastmarginleft;

                                /**剩余小于两分钟当作不可预定 0.24=100/14/60*2*10 */
                                if (lastorderbtnwidth > 2.4) {
                                    var lastHtml = '';
                                    if (getToday === currentDay) {
                                        if (nowDateStartPosition > lastorderbtnmarginleft) {
                                            /**获取未预定的起止时间**/
                                            lastorderbtnwidth = lastorderbtnwidth - (nowDateStartPosition - lastorderbtnmarginleft);
                                            lastorderbtnmarginleft = nowDateStartPosition;
                                            lastHtml = '<a style="width:' + (lastorderbtnwidth - 0.1) + '%;margin-left: ' + (nowDateStartPosition + 0.1) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + common.myDate.dateFormat(new Date().setMinutes(new Date().getMinutes() + 10), 'hh:mm') + '</span><span class="yd-end">20:00</span></p></a>';
                                        } else {
                                            /**获取未预定的起止时间**/
                                            lastHtml = '<a style="width:' + (lastorderbtnwidth-0.1) + '%;margin-left: ' + (lastorderbtnmarginleft+0.1) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + $('.time-set .day' + i + ' .hy-set a.done').last().find('p span.yd-end').text() + '</span><span class="yd-end">20:00</span></p></a>';
                                        }
                                    } else {
                                        lastHtml = '<a style="width:' + (lastorderbtnwidth - 0.1) + '%;margin-left: ' + (lastorderbtnmarginleft + 0.1 ) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + $('.time-set .day' + i + ' .hy-set a.done').last().find('p span.yd-end').text() + '</span><span class="yd-end">20:00</span></p></a>';
                                    }
                                    $('.time-set .day' + i + ' .hy-set').append(lastHtml);
                                }
                            } else {
                                var preorderhtml = "";
                                if (currentDay !== getToday) {
                                    nowDateStartPosition = 0;
                                    preorderhtml = '<a style="width:' + (100 - nowDateStartPosition) + '%;margin-left:' + nowDateStartPosition + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">06:00</span><span class="yd-end">20:00</span></p></a>';
                                } else {
                                    preorderhtml = '<a style="width:' + (100 - nowDateStartPosition) + '%;margin-left:' + nowDateStartPosition + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + common.myDate.dateFormat(new Date().setMinutes(new Date().getMinutes() + 10), 'hh:mm') + '</span><span class="yd-end">20:00</span></p></a>';
                                }
                                $('.time-set .day' + i + ' .hy-set').html(preorderhtml);
                            }
                        }
                    }
                }
                layer.close(layerIndex);
            },
            roomInfo: function (roomId) {
                webserver.query(null, apipath.meeting.room.single + roomId, methods.search, function (error, data, layerIndex) {
                    $('.cur-page-txt span').html(roomId + " 号会议室使用详情");
                    $('.hys-txt h2').html(data.roomName).siblings('p').html(data.roomFloor + '楼' + data.roomLocation + '室 &nbsp;|&nbsp; 容量' + data.roomSize + '人&nbsp; | &nbsp;' + data.typeName + '&nbsp; | &nbsp;' + common.arrayList(data.equipList, 'equipName', ' '));
                    layer.close(layerIndex);
                });
            },
            showOrderModule: function (data, basicwidth) {
                /**获取会议时间是星期几**/
                var orderDay = new Date(data.orderStarttime).getDay();
                /**模块长度*/
                var width = (parseInt(data.orderEndtime) - parseInt(data.orderStarttime)) * basicwidth;
                /**模块距左边距*/
                var begintimestamp = Date.parse(new Date($('.time-set .day' + orderDay + ' .week').attr('title') + ' 06:00:00'));
                var marginleft = (parseInt(data.orderStarttime) - parseInt(begintimestamp)) * basicwidth;
                /**当前时间**/
                var timestamp = Date.parse(new Date());
                /**获取会议开始结束时间**/
                var start = common.myDate.dateFormat(data.orderStarttime, 'hh:mm');
                var end = common.myDate.dateFormat(data.orderEndtime, 'hh:mm');
                /**没过期*/
                var html = "";
                if (parseInt(timestamp) > parseInt(data.orderStarttime)) {
                    html = '<a style="width:' + (width - 0.1) + '%;margin-left:' + (marginleft + 0.1) + '%" class="done last-dy" href="#">' +
                        '<input type="hidden" name="orderId" value="' + data.orderId + '" />' +
                        '<p style="display: none">' +
                        '<span class="title">会议主题：</span><span class="topic info">' + data.orderTopic + '</span><br>' +
                        '<span class="title">预定用户：</span><span class="orderUser info">' + data.orderUsername + '</span><br>' +
                        '<span class="title">会场主持：</span><span class="hostName info">' + (data.hostUser?data.hostUser.userName:'<span class="lightGrey">(无)</span>') + '</span><br>' +
                        '<span class="title">起止时间：</span><span class="yd-start">' + start + '</span>-<span class="yd-end">' + end + '</span><br>' +
                        '<span class="title">与会人员：</span><span class="attendName info">' + common.arrayList(data.attendList, 'userName', '、') + '</span></p>' +
                        '</a>';
                }
                else {
                    html = '<a style="width:' + (width - 0.1) + '%;margin-left:' + (marginleft + 0.1) + '%" class="done lready-dy" href="#">' +
                        '<input type="hidden" name="orderId" value="' + data.orderId + '" />' +
                        '<p style="display: none">' +
                        '<span class="title">会议主题：</span><span class="topic info">' + data.orderTopic + '</span><br>' +
                        '<span class="title">预定用户：</span><span class="orderUser info">' + data.orderUsername + '</span><br>' +
                        '<span class="title">会场主持：</span><span class="hostName info">' + (data.hostUser?data.hostUser.userName:'<span class="lightGrey">(无)</span>') + '</span><br>' +
                        '<span class="title">起止时间：</span><span class="yd-start">' + start + '</span>-<span class="yd-end">' + end + '</span><br>' +
                        '<span class="title">与会人员：</span><span class="attendName info">' + common.arrayList(data.attendList, 'userName', '、') + '</span></p>' +
                        '</a>';
                }
                $('.time-set .day' + orderDay + ' .hy-set').append(html);
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
            confirmOrder: function (roomId, PopBox_layerIndex, action, orderId) {
                common.showPopbox('请确认会议室预定信息', $('#qryd'), function () {
                    $('#qryd .qr-orderName').html($('#hysyd .orderUserName').html());
                    $('#qryd .qr-orderDate').html($('#hysyd .orderDate').html());
                    $('#qryd .qr-roomNumber').html(roomId);
                    $('#qryd .qr-topic').html($('#topic').val());
                    $('#qryd .qr-hostName').html($('#hostName').val());
                    $('#qryd .qr-attendList').html($('#attendName').val());
                    $('#qryd .qr-orderTime').html($('#meetingStartTime').val() + '-' + $('#meetingEndTime').val());
                    var roomInfo = $('.top-chioce .hys-txt p').text().split('|');
                    $('#qryd .qr-position').html(roomInfo[0]);
                    $('#qryd .qr-personCount').html(roomInfo[1]);
                    $('#qryd .qr-orderType').html(roomInfo[2]);
                    $('#qryd .qr-equipName').html(roomInfo[3]);

                }, function (PopBoxConfirm_layerIndex) {
                    if (action === "add") {
                        var params = {};
                        params.orderAttend = $('#attendId').val();
                        params.orderEndtime = Date.parse($('#hysyd .t-table .orderDate').text() + ' ' + $('#meetingEndTime').val());
                        params.orderHost = $('#hostNamehid').val();
                        params.orderStarttime = Date.parse($('#hysyd .t-table .orderDate').text() + ' ' + $('#meetingStartTime').val());
                        params.orderTopic = $('#topic').val();
                        params.roomId = roomId;
                        webserver.query(params, apipath.meeting.preOrder.add, methods.add, function (error, data, layerIndex) {
                            var textmsg = '您已成功预定' + data.roomName + '会议室，并向与会人员发出邮件通知；<br>时间：' + common.myDate.dateFormat(new Date(data.orderStarttime), 'yyyy年MM月dd日') + ' ' + common.myDate.dateFormat(new Date(data.orderStarttime), 'hh:mm') + ' - ' + common.myDate.dateFormat(new Date(data.orderEndtime), 'hh:mm');
                            common.showAlert(1, textmsg, function (index) {
                                layer.close(layerIndex);
                                window.location.reload();
                            });
                        });
                    } else if (action === "edit") {
                        var params = {};
                        params.orderAttend = $('#attendId').val();
                        params.orderEndtime = Date.parse($('#hysyd .t-table .orderDate').text() + ' ' + $('#meetingEndTime').val());
                        params.orderHost = $('#hostNamehid').val();
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
                    }
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
            }
        }
    };
})(jQuery);