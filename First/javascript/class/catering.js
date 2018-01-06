/**
 * 餐饮管理接口交互类
 * (c) Copyright 2017 Xiaoxiao Wang All Rights Reserved.
 * 2017-10-17
 */
var catering = {
    /**菜单主页**/
    menuIndex:{
        Initialization:function() {
            //初始化
            common.menusInitialization();
            catering.menuIndex.list();
            catering.menuIndex.datalist();
            catering.menuIndex.personOrder();
            $("#history-btn").click(function() {
                window.location.href = "../../html/catering/menuHistory.html";
            });
        },
        personOrder:function() {
            webserver.query({}, apipath.catering.menuIndex.singleList, methods.search, catering.menuIndex.callback_guest);
        },
        callback_guest:function(err, data, layerIndex) {
            layer.close(layerIndex);
            if (data.orderId == null) {
                $("#personBook").html("今日个人订餐总人数" + data.personalOrders + "人");
                $("#guestOrder").text("开始订餐");
                $("#guestOrder").click(function() {
                    // var nowdata = new Date();
                    // common.myDate.serverDate('',function(err,data,layerIndex2){
                    //     layer.close(layerIndex2);
                    //     nowdata=data.data.time;
                    // })
                    // nowdata = common.myDate.dateFormat(nowdata,'hh');
                    // if(nowdata>10){
                    //     layer.msg('订餐时间为上午10点之前，已超过订餐时段不允许订餐',{icon: 2,
                    //         time: 1500});
                    //     return;
                    // }
                    // $("#personBook").html("今日个人订餐总人数" + (data.personalOrders + 1) + "人");
                    var id = data.orderId;
                    var param = {};
                    param.orderId = id;
                    webserver.query(id, apipath.catering.menuIndex.singleAdd, methods.add, function(err, data, layerIndex1) {
                        layer.close(layerIndex1);
                        layer.msg('预定成功，即将刷新本页面！', {
                            icon: 6,
                            time: 1500,
                            end: function() {
                                window.location.reload();
                            }
                        });
                    });
                });
            } else {
                $("#personBook").html("今日个人订餐总人数" + data.personalOrders + "人");
                $("#guestOrder").text("取消订餐");
                $("#guestOrder").addClass("btn btn-dc btn-qxdc");
                $("#guestOrder").click(function() {
                    // $("#personBook").html("今日个人订餐总人数" + (data.personalOrders - 1) + "人");
                    var id = data.orderId;
                    var param = {};
                    param.orderId = id;
                    webserver.query(param, apipath.catering.menuIndex.singleDelete + id, methods.delete);
                });
                layer.close(layerIndex);
            }
        },
        datalist:function() {
            webserver.query({}, apipath.catering.menuIndex.singleList, methods.search, function(err, data, layerIndex){
                if (!data.guestOrders) {
                    $("#guestTotal").html("今日客餐总人数0人");
                } else {
                    $("#guestTotal").html("今日客餐总人数" + data.guestOrders + "人");
                }
                if (!data.guestOrderId) {
                    $("#preNum").html("0");
                    $("#startOrder").text("客餐预订");
                    $("#startOrder").click(function() {
                        common.showPopbox("客餐预定", $("#foodOrder"), function() {
                            //数据初始化
                            $("#bookNo").val('');
                            // webserver.query({}, apipath.catering.menuIndex.guestList+common.cookies.get('!@#2017hd_userId'), methods.search, function(err, data, layerIndex1) {
                            $('#preNum').html(0);
                            // layer.close(layerIndex1);
                            // });
                        }, function(err, data, layerIndex) {
                            if ($("#orderNum").validationEngine("validate")) {
                                var param = {};
                                var date = new Date();
                                param.guestNum = $("#bookNo").val();
                                param.guestOrderDate = date;
                                param.guestOrderId = 0;
                                param.userId = common.cookies.get("!@#2017hd_userId");
                                webserver.query(param, apipath.catering.menuIndex.add, methods.add, function(err, data, layerIndex1) {
                                    layer.close(layerIndex1);
                                    layer.msg('预定成功，即将刷新本页面！', {
                                        icon: 6,
                                        time: 1500,
                                        end: function() {
                                            window.location.reload();
                                        }
                                    });
                                });
                                layer.close(layerIndex);
                            }
                        });
                    });
                } else {
                    $("#preNum").html(data.guestOrders);
                    $("#startOrder").addClass("btn btn-dc btn-qxdc");
                    $("#startOrder").text("修改客餐");
                    $("#startOrder").click(function() {
                        common.showPopbox("客餐预定", $("#foodOrder"), function() {
                            //数据初始化
                            webserver.query({}, apipath.catering.menuIndex.guestList+data.guestOrderId, methods.search, function(err, data, layerIndex1) {
                                $('#preNum').html(data.guestNum);
                                $("#bookNo").val(data.guestNum);
                                layer.close(layerIndex1);
                            });
                        }, function(layerIndex) {
                            if ($("#orderNum").validationEngine("validate")) {
                                var param = {};
                                param.guestNum = $("#bookNo").val();
                                webserver.query(param, apipath.catering.menuIndex.editList + data.guestOrderId, methods.edit, function(err,data,layerIndex1) {
                                    layer.close(layerIndex1);
                                    layer.msg('修改成功，即将刷新本页面！', {
                                        icon: 6,
                                        time: 1500,
                                        end: function() {
                                            window.location.reload();
                                        }
                                    });
                                });
                                layer.close(layerIndex);
                            }
                        });
                    });
                }
                layer.close(layerIndex);
            });
        },
        list:function() {
            var param = {};
            webserver.query(param, apipath.catering.menuIndex.list, methods.search, catering.menuIndex.callback_search);
        },
        callback_search:function(err, data, layerIndex) {
            //获取本周第一天
            var html1 = "";
            if (data.length > 0) {
                html1 = "<tr>" + '<th width="10%">时间</th>' + '<th width="10%">凉菜</th>' + '<th width="10%">热菜</th>' + '<th width="10%">汤</th>' + '<th width="10%">主食</th>' + '<th width="10%">水果</th>' + "</tr>";
                for (var i = 0; i < data.length; i++) {
                    var today = common.myDate.dateFormat(new Date(), "yyyy-MM-dd");
                    if (today == common.myDate.dateFormat(data[i].menuDate, "yyyy-MM-dd")) {
                        $("#todayOrder").html('<p id="todayOrder">今日订餐份数：<span>' + data[i].orderTimes + "份</span>");
                    }
                    html1 = html1 + "<tr>" + '<td class="day' + i + ' curday">星期' + (i + 1) + "</td>" + "<td>" + data[i].menuCold + "</td>" + "<td>" + data[i].menuHot + "</td>" + "<td>" + data[i].menuSoup + "</td>" + "<td>" + data[i].menuMain + "</td>" + "<td>" + data[i].menuFruit + "</td>" + "</tr>";
                }
            }
            $("#dataTable").html(html1);
            layer.close(layerIndex);
        }
    },
    /**历史菜单**/
    historyMenu:{
        Initialization:function() {
            /**初始化**/
            common.menusInitialization();
            /**初始化列表**/
            catering.historyMenu.page_list(1);
            /**查询事件**/
            $(".btn").click(function() {
                catering.historyMenu.page_list(1);
            });
            $("#inputMenu").attr("disabled", true);
            $("#button").click(function() {
                $("#inputMenu").attr("disabled", false);
            });
        },
        page_list:function(current_page) {
            var param = {
                page:current_page,
                rows:pagination.menu_history_rows_count
            };
            //获取时间和菜名
            param.date = $("#date").val();
            param.dishName = $("#dishName").val();
            webserver.query(param, apipath.catering.historyMenu.list, methods.search, catering.historyMenu.callback_menuSearch);
        },
        //查询回调
        callback_menuSearch:function(err, data, layerIndex) {
            var html = "";
            if (data.total && data.total > 0) {
                html = '<tr id="historyTitle">' + '<th width="10%">时间</th>' + '<th width="10%">凉菜</th>' + '<th width="10%">热菜</th>' + '<th width="10%">汤</th>' + '<th width="10%">主食</th>' + '<th width="10%">水果</th>' + "</tr>";
                for (var i = 0; i < data.list.length; i++) {
                    html = html + '<tr id="historyDetail">' + "<td>" + common.myDate.dateFormat(data.list[i].menuDate, "yyyy-MM-dd") + "</td>" + "<td>" + data.list[i].menuCold + "</td>" + "<td>" + data.list[i].menuHot + "</td>" + "<td>" + data.list[i].menuSoup + "</td>" + "<td>" + data.list[i].menuMain + "</td>" + "<td>" + data.list[i].menuFruit + "</td>" + "</tr>";
                }
            }
            //调用分页
            pagination.Initialization(data.total, pagination.menu_history_rows_count, data.pageNum, catering.historyMenu.page_list);
            $(".table-box").html(html);
            layer.close(layerIndex);
        }
    },
    /**菜单管理**/
    //这个还有问题
    menu_management:{
        Initialization:function() {
            /**初始化菜单**/
            common.menusInitialization();
            catering.menu_management.list();
            //$('.table-box .inputMenu').attr('disabled', 'disabled');
            $("body").delegate(".table-box .editBtn", "click", function(e) {
                if ($(".table-box .inputMenu")[0].hasAttribute("disabled")) {
                    $(this).text("提交");
                    //$(this).addClass('btn-details btn-input');
                    var param = {};
                    webserver.query(param, apipath.catering.menuManagement.list, methods.search, function(err, data, layerIndex) {
                        alert($("#searchDate").val());
                        if (data.menuId == null) {
                            $(".table-box .editBtn").click(function() {
                                var param = {};
                                //param.menuDate = common.myDate.FirstDayOfWeek(new Date() + 4 * 3600 * 1000 * 7);
                                //          					var thisMonday = common.myDate.FirstDayOfWeek(new Date());
                                //          					for (var i = 0; i < 5; i++) {
                                //          						var dateTime = new Date().setDate(thisMonday.getDate() + (i + 7));
                                //          					}
                                if ($("#searchDate").val() == data.menuDate) {
                                    layer.alert("已存在该日期菜单，请选择其他时间");
                                } else {
                                    param.menuDate = $("#searchDate").val();
                                    param.menuCold = $(".table-box .inputMenu").eq(0).val();
                                    param.menuHot = $(".table-box .inputMenu").eq(1).val();
                                    param.menuSoup = $(".table-box .inputMenu").eq(2).val();
                                    param.menuMain = $(".table-box .inputMenu").eq(3).val();
                                    param.menuFruit = $(".table-box .inputMenu").eq(4).val();
                                    webserver.query(param, apipath.catering.menuManagement.add, methods.add);
                                }
                            });
                        } else {}
                        layer.close(layerIndex);
                    });
                    $(".table-box .inputMenu").removeAttr("disabled");
                    $(".table-box .editBtn").click(function() {
                        var param = {};
                        param.menuCold = $(".table-box .inputMenu").eq(0).val();
                        param.menuHot = $(".table-box .inputMenu").eq(1).val();
                        param.menuSoup = $(".table-box .inputMenu").eq(2).val();
                        param.menuMain = $(".table-box .inputMenu").eq(3).val();
                        param.menuFruit = $(".table-box .inputMenu").eq(4).val();
                        webserver.query(param, apipath.catering.menuManagement.add, methods.add);
                    });
                } else {
                    $(this).text("编辑");
                    //$(this).removeClass("btn-details btn-input");
                    $(this).addClass("btn-details");
                    $(".table-box .inputMenu").attr("disabled", "disabled");
                }
            });
            $("#button").text("修改");
            $("body").delegate("#createMenu", "click", function(e) {
                var param = {};
                var html = "";
                html = '<table class="table-box mgt15">' + "<tr>" + '<th width="10%">时间</th>' + '<th width="10%">凉菜</th>' + '<th width="10%">热菜</th>' + '<th width="10%">汤</th>' + '<th width="10%">主食</th>' + '<th width="10%">水果</th>' + '<th width="10%">操作</th>';
                "</tr>";
                html = html + "<tr>" + '<td><input placeholder="请选择时间" id="searchDate" type="text" onclick="WdatePicker({isShowClear:true, readOnly:true})" onfocus="WdatePicker({startDate:&apos;%y-%M-#{%d+7}&apos;})"/></td>' + '<td><input type="text" style="background:transparent; border:none;" disabled="disabled"  class="inputMenu" maxlength="10"/></td>' + '<td><input type="text" style="background:transparent; border:none;" disabled="disabled"  class="inputMenu" maxlength="10"/></td>' + '<td><input type="text" style="background:transparent; border:none;" disabled="disabled" class="inputMenu" maxlength="10"/></td>' + '<td><input type="text" style="background:transparent; border:none;" disabled="disabled" class="inputMenu" maxlength="10"/></td>' + '<td><input type="text" style="background:transparent; border:none;" disabled="disabled" class="inputMenu" maxlength="10"/></td>' + '<td><button class="btn-details editBtn" >编辑</button></td>' + "</tr>";
                html = html + "</table>";
                $("#createTable").html(html);
            });
            $("#historyBtn").click(function() {
                window.location.href = "../../html/catering/menuHistory.html";
            });
        },
        list:function() {
            var param = {};
            webserver.query(param, apipath.catering.menuManagement.list, methods.search, catering.menu_management.callback_menuData);
        },
        callback_menuData:function(err, data, layerIndex) {
            //根据当前时间获取本周的第一天, 统共显示从周一到周五的菜单,所以需要知道当前周是哪个周
            //根据日期来获取菜单
            //var firstDay = common.myDate.FirstDayOfWeek(new Date($('#dateTime').val()));
            var html = "";
            if (data.length > 0) {
                html = '<tr id="historyTitle">' + '<th width="10%">时间</th>' + '<th width="10%">凉菜</th>' + '<th width="10%">热菜</th>' + '<th width="10%">汤</th>' + '<th width="10%">主食</th>' + '<th width="10%">水果</th>' + "</tr>";
                for (var i = 0; i < data.length; i++) {
                    html = html + "<tr>" + '<td class="menuTime" data-sort-field-ftime="' + common.myDate.dateFormat(data[i].menuDate, "yyyyMMdd") + '">' + common.myDate.dateFormat(data[i].menuDate, "yyyy-MM-dd") + "</td>" + "<td>" + data[i].menuCold + "</td>" + "<td>" + data[i].menuHot + "</td>" + "<td>" + data[i].menuSoup + "</td>" + "<td>" + data[i].menuMain + "</td>" + "<td>" + data[i].menuFruit + "</td>" + "</tr>";
                }
            }
            $(".table-box").append(html);
            layer.close(layerIndex);
        }
    },
    /*包间管理*/
    parlor_management:{
        Initialization:function() {
            /**初始化菜单**/
            common.menusInitialization();
            /**初始化列表**/
            catering.parlor_management.page_list(1);
            /**初始化新建包间按钮**/
            $(".btn").click(function() {
                catering.parlor_management.page_list(1);
            });
            //预置按钮事件
            $("body").delegate(".btn-delete", "click", function(e) {
                //阻止冒泡
                e.stopPropagation();
                e.preventDefault();
                //var id = $(e.currentTarget).parent().siblings("tr.room_detail").children("td.room_id").text();
                var name = $(e.currentTarget).parents().siblings("td.room_name").text();
                common.showConfirm("请您确认以下信息：", "您将删除包间：" + name, function() {}, function() {
                    var roomId = $(e.currentTarget).parents().siblings("td.room_id").text();
                    webserver.query(null, apipath.catering.caterRoom.delete + roomId, methods.delete);
                });
            });
            //修改按钮事件
            $("body").delegate(".btn-details", "click", function(e) {
                //阻止冒泡
                e.stopPropagation();
                e.preventDefault();
                var roomID = $(e.currentTarget).parents().siblings("td.room_id").text();
                var details = $.Deferred();
                catering.parlor_management.showRoomDetail(details, roomID);
                $.when(details).done(function(v1) {
                    common.showPopbox("修改包间信息", $("#addParlor"), function() {
                        //设置初始值
                        $("#roomName").val(v1.roomName);
                        $("#roomSize").val(v1.roomSize);
                    }, function(layerIndex) {
                        if ($("#parlor").validationEngine("validate")) {
                            var param = {};
                            param.roomName = $("#roomName").val();
                            param.roomSize = $("#roomSize").val();
                            webserver.query(param, apipath.catering.caterRoom.edit + roomID, methods.edit);
                            layer.close(layerIndex);
                        }
                    });
                });
            });
            //新增包间按钮
            $(".btn").click(function() {
                common.showPopbox("新增包间", $("#addParlor"), function() {
                    //初始化房间名称和房间大小
                    $("#roomName").val("");
                    $("#roomSize").val("");
                }, function(layerIndex) {
                    if ($("#parlor").validationEngine("validate")) {
                        var param = {};
                        param.roomName = $("#roomName").val();
                        param.roomSize = $("#roomSize").val();
                        webserver.query(param, apipath.catering.caterRoom.add, methods.add, catering.parlor_management.callback_search);
                        layer.close(layerIndex);
                    }
                });
            });
        },
        page_list:function(current_page) {
            var param = {};
            /**获取相关条件**/
            //param.roomName = 1;//$("#roomName").val();
            //param.roomSize = 20;//$("#roomSize").val();
            param.page = current_page;
            param.rows = pagination.parlor_management_rows_count;
            webserver.query(param, apipath.catering.caterRoom.list, methods.search, catering.parlor_management.callback_search);
        },
        /**查询回调**/
        callback_search:function(err, data, layerIndex) {
            //console.log(data);
            var html = "";
            if (data.total && data.total > 0) {
                html = "<tr>" + '<th width="10%">包间序号</th>' + '<th width="10%">包间名称</th>' + '<th width="10%">容量人数</th>' + '<th width="10%">操作</th>' + "</tr>";
                for (var i = 0; i < data.list.length; i++) {
                    html = html + '<tr class="room_detail">' + '<td class="room_id">' + data.list[i].roomId + "</td>" + '<td class="room_name">' + data.list[i].roomName + "</td>" + '<td class="room_size">' + data.list[i].roomSize + "</td>" + "<td>" + '<button class="btn-delete">' + "删除" + "</button>" + " " + '<button class="btn-details">' + "修改" + "</button>" + "</td>" + "</tr>";
                }
            }
            //调用分页
            pagination.Initialization(data.total, pagination.parlor_management_rows_count, data.pageNum, catering.parlor_management.page_list);
            $(".table-box").html(html);
            layer.close(layerIndex);
        },
        showRoomDetail:function(d, roomName) {
            //获取指定的包间
            webserver.query(null, apipath.catering.caterRoom.single + roomName, methods.search, function(err, data, layerIndex) {
                layer.close(layerIndex);
                if (d) {
                    d.resolve(data);
                }
            });
        }
    },
    //包间预订
    view_book:{
        //显示包间列表
        Initialization:function() {
            //初始化菜单
            common.menusInitialization();
            //初始化列表
            catering.view_book.page_list(1);
            //查询事件
            $(".btn").click(function() {
                catering.view_book.page_list(1);
            });
            var today = common.myDate.dateFormat(new Date(), "yyyy-MM-dd");
            $("#searchDate").val(today);
            //点击包间弹出层
            $("body").delegate(".btn-details", "click", function(e) {
                e.stopPropagation();
                e.preventDefault();
                var roomId = $(e.currentTarget).parent().parent().find(".bookId").text();
                var num = $(e.currentTarget).parent().parent().find("span.roomSize").text();
                common.showPopbox("预订包间", $("#roomBook"), function() {
                    //设置初始值
                    //$("#userName").val('');
                    $("#bookTime").val("");
                    $("#bookNum").val("");
                }, function(layerIndex) {
                    if ($("#bookroom").validationEngine("validate")) {
                        var orderNum = $("#bookNum").val();
                        if (parseInt(orderNum) <= parseInt(num)) {
                            var param = {};
                            param.roomId = roomId;
                            param.roomOrderDate = $("#bookTime").val();
                            param.roomOrderNum = orderNum;
                            param.roomOrderId = 0;
                            webserver.query(param, apipath.catering.roomBook.add, methods.add);
                            layer.close(layerIndex);
                        } else {
                            common.showTimeMsg("0", "预订人数不可超过包间容量");
                        }
                    }
                });
            });
            $("body").delegate(".btn-delete", "click", function(e) {
                e.stopPropagation();
                e.preventDefault();
                var param = {
                    page:1,
                    rows:pagination.room_book_rows_count
                };
                webserver.query(param, apipath.catering.caterRoom.list, methods.search, function(err, data, layerIndex) {
                    var id = JSON.parse(common.cookies.get("!@#2017hd_userId"));
                    var orderId = $(e.currentTarget).parent().parent().find(".orderId").text();
                    var roomName = $(e.currentTarget).parent().parent().find(".hys").text();
                    var roomId = $(e.currentTarget).parent().parent().find(".bookId").text();
                    var roomOrderId = $(e.currentTarget).parent().parent().find(".roomOrderId").text();
                    console.log(id);
                    if (orderId == id) {
                        //          				var roomName = $(e.currentTarget).parent().parent().find('.hys').text();
                        //							var roomId = $(e.currentTarget).parent().parent().find('.bookId').text();
                        common.showConfirm("请您确认以下信息:", "您将取消包间预订 :" + roomName, function() {}, function() {
                            webserver.query(null, apipath.catering.roomBook.deleteOrder + roomOrderId, methods.delete);
                        });
                    } else {
                        layer.alert("您没有权限取消该包间预订 ");
                    }
                });
            });
        },
        page_list:function(current_page) {
            var param = {
                page:current_page,
                rows:pagination.room_book_rows_count
            };
            param.date = $("#searchDate").val();
            param.roomSize = $("#roomSize").val();
            param.status = $("#roomStatus option:selected").val();
            webserver.query(param, apipath.catering.roomBook.list, methods.search, catering.view_book.callback_search);
        },
        /**查询回调**/
        callback_search:function(err, data, layerIndex) {
            var html = "";
            if (data.total && data.total > 0) {
                for (var i = 0; i < data.list.length; i++) {
                    html = html + "<li>" + '<a href="#">' + '<ul class="list-one">' + '<li style="display:none" class="bookId">' + data.list[i].roomId + "</li>" + '<li style="display:none" class="roomOrderId">' + data.list[i].roomOrderId + "</li>" + '<li style="display:none" class="orderId">' + data.list[i].orderBy + "</li>" + '<li class="hys"><p>' + data.list[i]["roomName"] + "</p></li>" + '<li class="rl">容量<span class="roomSize">' + data.list[i]["roomSize"] + "</span></li>" + '<li class="zt1" style="width:15%; text-align: right;">';
                    var style = "btn-details";
                    if (data.list[i]["voStatus"] == 0) {
                        html = html + '<button class="' + style + '">空　闲</button>';
                    } else if (data.list[i]["voStatus"] == 1) {
                        style = "btn-delete";
                        //status = "已预订";
                        html = html + '<button class="' + style + '">已预订</button>';
                    }
                    html = html + "</li>" + "</ul>" + "</a>" + "</li>";
                }
            }
            //调用分页
            pagination.Initialization(data.total, pagination.view_book_rows_count, data.pageNum, catering.view_book.page_list);
            $(".list-box").html(html);
            layer.close(layerIndex);
        }
    }
};