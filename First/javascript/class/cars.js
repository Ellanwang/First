/*
 * 车辆接口交互类
 * (c) Copyright 2017 XianGuan.HU. All Rights Reserved.
 * 2017-10-20
 */
(function () {
    cars = {
        carsOrder:{
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                cars.carsOrder.page_list(1);
                /*查询事件*/
                $('.search').click(function () {
                    cars.carsOrder.page_list(1);
                });
                /*点击车辆跳转，cookie传参*/
                $("body").delegate(".list-box a", "click", function (e) {
                    common.cookies.set('carId', $(e.currentTarget).find('input.carId').val());
                    common.cookies.set('startDateTime', $("#startTime").val());
                    common.cookies.set('endDateTime', $("#endTime").val());
                });
            },
            page_list: function (current_page) {
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.carsOrder_rows_count,
                    typev:$('#typev').val(),
                    capacity:$('#capacity').val(),
                    vestate:$('#vestate').val(),
                    starttime:$('#startTime').val(),
                    endtime:$('#endTime').val()
                };
                webserver.query(param, apipath.cars.carsOrder.list, methods.search, cars.carsOrder.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html=html+
                            '<li>' +
                            '<a href="carsBooking.html">' +
                            '<input type="hidden" class="carId" value="'+data.list[i].id+'" />' +
                            '<ul class="list-one">' +
                            '<li class="num">' +
                            data.list[i].num +
                            '</li>' +
                            '<li class="hys">' +
                            '<p>'+data.list[i].plate+'</p>' +
                            '</li>' +
                            '<li class="rl">' +
                            data.list[i].typev+
                            '</li>' +
                            '<li class="lb">' +
                            data.list[i].dname+
                            '</li>' +
                            '<li class="ss">' +
                            data.list[i].dphone+
                            '</li>' +
                            '<li class="zt">';
                        switch(data.list[i].vestate) {
                            case 0:
                                html=html+'<span class="blue">空闲</span>';
                                break;
                            case 1:
                                html=html+'<span class="green">已预订</span>';
                                break;
                            case 2:
                                html=html+'<span class="red">使用中</span>';
                                break;
                            case 3:
                                html=html+'<span class="red">故障</span>';
                                break;
                            default:
                                break;
                        }
                        html=html+'</li>' +
                            '</ul>' +
                            '</a>' +
                            '</li>';
                    }

                } //调用分页
                pagination.Initialization(data.total, pagination.carsOrder_rows_count, data.pageNum, cars.carsOrder.page_list);
                $('.list-box').html(html);
                layer.close(layerIndex);
            }
        },
        carsManage: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                cars.carsManage.page_list(1);
                /*查询事件*/
                $('.search').click(function () {
                    cars.carsManage.page_list(1);
                });
                var token = common.cookies.get("!@#2017hd_token");
                var userId = common.cookies.get("!@#2017hd_userId");
                /**司机输入框变化的时候，清空隐藏域**/
                $('#driverName').bind('input propertychange', function () {
                    $('#driverNamehid').val('');
                });
                /**司机自动补全插件使用**/
                $('#driverName').autocomplete({
                    serviceUrl: apipath.meeting.users.list + '?userId='+userId+'&token='+token+'&page=1&rows=10',
                    type: 'GET',
                    dataType: 'json',
                    paramName: 'name',
                    zIndex: 20891021,//要超过19891020
                    onSelect: function (suggestion) {
                        $('#driverNamehid').val(suggestion.data);
                        $('#driverPhone').val(suggestion.tel);
                    },
                    onHint: function (hint) {
                        $('#driverName-list').val(hint);
                    },
                    transformResult: function (response) {
                        if(response.status==0) {
                            return {
                                suggestions: $.map(response.data.list, function (dataItem) {
                                    return {value: dataItem.userName, data: dataItem.userId ,tel:dataItem.userTel};
                                })
                            };
                        }
                    },
                    onInvalidateSelection: function () {
                    }
                });
                /*新增事件*/
                $('.add-car').click(function () {
                    common.showPopbox('新增车辆信息', $('#car_add'), function () {
                        /*清空*/
                        $('#num').val('');
                        /*编号*/
                        $('#plate').val('');
                        /*牌号*/
                        $('#capacity').val('');
                        /*乘坐人数*/
                        $('#typev').val('');
                        /*车型*/
                        // /*绑定驾驶员信息*/
                        // cars.carsManage.showDrivers(function(){
                        //     $('#driverId').val(0);
                        //     $('#driverPhone').val($("#driverId").find("option:selected").attr("title"));
                        // });
                    }, function (layerindex) {
                        if ($('#addcarform').validationEngine('validate')) {
                            var params = {};
                            params.num = $('#num').val();
                            /*编号*/
                            params.plate = $('#plate').val();
                            /*牌号*/
                            params.capacity = $('#capacity').val();
                            /*乘坐人数*/
                            params.typev = $('#typev').val();
                            /*车型*/
                            params.driverid = $('#driverNamehid').val();
                            webserver.query(params, apipath.cars.carsManage.add, methods.add);
                        }
                    });
                });
                // /*绑定change事件*/
                // $("#driverId").change(function(e){
                //     $('#driverPhone').val($(e.currentTarget).find("option:selected").attr("title"));
                // });
                /*点击修改*/
                $("body").delegate("table.carsList .btn-details", "click", function (e) {
                    common.showPopbox('修改车辆信息', $('#car_add'), function () {
                        var tdlist = $(e.currentTarget).parent().parent().find('td');
                        /*绑定下拉司机*/
                        // cars.carsManage.showDrivers(function(){
                        //     $('#driverId').val(tdlist.eq(4).find('.driverIdhid').val());
                        //     $('#driverPhone').val($('#driverId').find("option:selected").attr("title"));
                        // });
                        $('#num').val(tdlist.eq(0).text());
                        /*编号*/
                        $('#plate').val(tdlist.eq(1).text());
                        /*牌号*/
                        $('#capacity').val(tdlist.eq(3).text());
                        /*乘坐人数*/
                        $('#typev').val(tdlist.eq(2).text());
                        /*车型*/
                        $('#driverName').val(tdlist.eq(4).text());
                        $('#driverNamehid').val(tdlist.eq(4).find('input.driverIdhid').val());
                        $('#driverPhone').val(tdlist.eq(5).text());
                    }, function (layerindex) {
                        if ($('#addcarform').validationEngine('validate')) {
                            var params = {};
                            params.num = $('#num').val();
                            /*编号*/
                            params.plate = $('#plate').val();
                            /*牌号*/
                            params.capacity = $('#capacity').val();
                            /*乘坐人数*/
                            params.typev = $('#typev').val();
                            /*车型*/
                            params.driverid = $('#driverNamehid').val();
                            webserver.query(params, apipath.cars.carsManage.edit + $(e.currentTarget).parent().parent().find('td').eq(0).find('.carIdhid').val(), methods.edit);
                            layer.close(layerindex);
                        }
                    });
                });
                /*点击删除*/
                $("body").delegate("table.carsList .btn-delete", "click", function (e) {
                    common.showConfirm('请您确认以下信息', '您将删除"' + $(e.currentTarget).parent().parent().find('td').eq(1).text() + '"的相关信息', function () {
                    }, function () {
                        webserver.query(null, apipath.cars.carsManage.delete + $(e.currentTarget).parent().parent().find('td').eq(0).find('.carIdhid').val(), methods.delete);
                    });
                });

            },
            page_list: function (current_page) {
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.carsManage_rows_count
                };
                //获取相关条件
                param.keyword = $('#carNumber').val();
                webserver.query(param, apipath.cars.carsManage.list, methods.search, cars.carsManage.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '<tr>' +
                    '<th>编号</th>' +
                    '<th>车牌号</th>' +
                    '<th>车型</th>' +
                    '<th>可乘坐人数</th>' +
                    '<th>驾驶员</th>' +
                    '<th>联系方式</th>' +
                    // '<th>保养项目</th>' +
                    // '<th>保养日期／里程数</th>' +
                    // '<th>下次保养日期／里程数</th>' +
                    // '<th>保养次数</th>' +
                    // '<th>险种</th>' +
                    // '<th>保险日期</th>' +
                    // '<th>保险费用</th>' +
                    // '<th>到期时间</th>' +
                    // '<th>本次保养费用</th>' +
                    // '<th>年检日期</th>' +
                    // '<th>下次年检日期</th>' +
                    // '<th>年检费用</th>' +
                    // '<th>年检次数</th>' +
                    '<th>操作</th>' +
                    '</tr>';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<tr>' +
                            '<td>' + data.list[i].num + '<input type="hidden" class="carIdhid" value="' + data.list[i].id + '" /></td>' +
                            '<td>' + data.list[i].plate + '</td>' +
                            '<td>' + data.list[i].typev + '</td>' +
                            '<td>' + data.list[i].capacity + '</td>' +
                            '<td>' + data.list[i].dname + '<input type="hidden" class="driverIdhid" value="'+data.list[i].driverid+'" /></td>' +
                            '<td>' + data.list[i].dphone + '</td>' +
                            // '<td>' + (data.list[i].veMaintainsVo === null ? '' : common.arrayList(data.list[i].veMaintainsVo.maintainsVoList, 'mparagrame', ' ')) + '</td>' +
                            // '<td>' + (data.list[i].veMaintainsVo === null ? '' : (common.myDate.dateFormat(new Date(data.list[i].veMaintainsVo.mdate), 'MM-dd') + '/' + data.list[i].veMaintainsVo.mileage) + 'km') + '</td>' +
                            // '<td>' + (data.list[i].veMaintainsVo === null ? '' : (common.myDate.dateFormat(new Date(data.list[i].veMaintainsVo.nmdate), 'MM-dd') + '/' + data.list[i].veMaintainsVo.nmileage) + 'km') + '</td>' +
                            // '<td>' + (data.list[i].veMaintainsVo === null ? '' : data.list[i].veMaintainsVo.mnumber) + '</td>' +
                            // '<td>' + (data.list[i].veinsuranceVo === null ? '' : common.arrayList(data.list[i].veinsuranceVo.insurancesVoList, 'intype', ' ')) + '</td>' +
                            // '<td>' + (data.list[i].veinsuranceVo === null ? '' : common.myDate.dateFormat(new Date(data.list[i].veinsuranceVo.indate), 'yyyy-MM-dd')) + '</td>' +
                            // '<td>' + (data.list[i].veinsuranceVo === null ? '' : (data.list[i].veinsuranceVo.intfee + '元')) + '</td>' +
                            // '<td>' + (data.list[i].veinsuranceVo === null ? '' : common.myDate.dateFormat(new Date(data.list[i].veinsuranceVo.eindate), 'yyyy-MM-dd')) + '</td>' +
                            // '<td>' + (data.list[i].veMaintainsVo === null ? '' : (data.list[i].veMaintainsVo.mtfee + '元')) + '</td>' +
                            // '<td>' + (data.list[i].veannualcheck === null ? '' : common.myDate.dateFormat(new Date(data.list[i].veannualcheck.ckdate), 'yyyy-MM-dd')) + '</td>' +
                            // '<td>' + (data.list[i].veannualcheck === null ? '' : common.myDate.dateFormat(new Date(data.list[i].veannualcheck.nckdate), 'yyyy-MM-dd')) + '</td>' +
                            // '<td>' + (data.list[i].veannualcheck === null ? '' : (data.list[i].veannualcheck.ckfee + '元')) + '</td>' +
                            // '<td>' + (data.list[i].veannualcheck === null ? '' : data.list[i].veannualcheck.cknumber) + '</td>' +
                            '<td>' +
                            '<button class="btn-delete">删除</button> ' +
                            '<button class="btn-details">修改</button>' +
                            '</td>' +
                            '</tr>';
                    }

                }//调用分页
                pagination.Initialization(data.total, pagination.carsManage_rows_count, data.pageNum, cars.carsManage.page_list);
                $('.carsList').html(html);
                layer.close(layerIndex);
            },
            showDrivers:function(callback){
                webserver.query(null, apipath.cars.drivers.list, methods.search, function(error,data,layerIndex){
                    var html='';
                    for(var i =0 ;i<data.length;i++)
                    {
                        html = html + '<option title="'+data[i].dphone+'" value="'+data[i].driverid+'">'+data[i].dname+'</option>';
                    }
                    $('#driverId').html(html);
                    callback();
                    layer.close(layerIndex);
                });
            }
        },
        carsLog: {
            Initialization: function () {
                var carId = common.cookies.get('orderCarId');
                if (common.cookies.get('startDateTime') && common.cookies.get('endDateTime')) {
                    $('#startTime').val(common.cookies.get('startDateTime'));
                    $('#endTime').val(common.cookies.get('endDateTime'));
                }
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                cars.carsLog.page_list(1,carId);
                /**车辆详情**/
                cars.carsLog.carInfo(carId);
                /*查询事件*/
                $('.search').click(function () {
                   cars.carsLog.page_list(1,carId);
               });
            },
            carInfo:function(carId){
                webserver.query(null, apipath.cars.carsManage.single + carId, methods.search, function (error, data, layerIndex) {
                    $('.cur-page-txt span').html(carId + " 号车辆使用详情");
                    $('.hys-txt h2').html(data.num).siblings('p').html(data.plate + '  &nbsp;| &nbsp; ' + data.typev + '  &nbsp; | &nbsp;  ' + data.dname + '&nbsp; | &nbsp;' + data.dphone) ;
                    layer.close(layerIndex);
                });
            },
            page_list:function (current_page,carId) {
                if(!carId){
                    carId = common.cookies.get('carId');
                }
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.carsLog_rows_count
                };
                //获取相关条件
                param.startdate = $('#startTime').val();
                param.enddate = $('#endTime').val();
                webserver.query(param, apipath.cars.carsLog.list + carId, methods.search, cars.carsLog.callback_search);
            },
            callback_search:function(error,data,layerIndex){
                var html = '';
                if (data.total && data.total > 0) {
                    html = '<tr>' +
                        '<th>使用日期</th>' +
                        '<th>使用时长</th>' +
                        '<th>使用人</th>' +
                        '<th>出发地</th>' +
                        '<th>目的地</th>' +
                        '<th>出车原因</th>' +
                        '<th>单次油耗</th>' +
                        '<th>行驶公里数</th>' +
                        '</tr>' ;
                    for (var i = 0; i < data.list.length; i++) {
                        html = html +
                            '<tr>' +
                            '<td>'+common.myDate.dateFormat(data.list[i].bedatetime,'yyyy-MM-dd')+'</td>' +
                            '<td>'+((parseInt(data.list[i].endatetime)-parseInt(data.list[i].bedatetime))/1000/60/60)+'h</td>' +
                            '<td>'+data.list[i].username+'</td>' +
                            '<td>'+data.list[i].departure+'</td>' +
                            '<td>'+data.list[i].destination+'</td>' +
                            '<td>'+data.list[i].reason+'</td>' +
                            '<td>'+data.list[i].oil+'L</td>' +
                            '<td>'+data.list[i].distance+'km</td>' +
                            '</tr>'
                    }

                }//调用分页
                pagination.Initialization(data.total, pagination.carsLog_rows_count, data.pageNum, cars.carsLog.page_list);
                $('table.carsLogList.table-box').html(html);
                layer.close(layerIndex);
            }
        },
        singleCarInsurance: {
            Initialization: function () {
                var carId = common.cookies.get('carId');
                $('.main .cur-page-txt').html(carId + '号车辆保险信息详情');
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                cars.singleCarInsurance.page_list(1, carId);
                /*查询事件*/
                $('.search').click(function () {
                    cars.singleCarInsurance.page_list(1, carId);
                });

                /*新增险种*/
                $('#InsuranceItem_add .xianzhong .addItem').click(function () {
                    if ($('#InsuranceItemfrom').validationEngine('validate')) {
                        if ($('#Item').val() !== "" && $('#money').val() !== "") {
                            var html =
                                '<li>' +
                                '<div class="ItemsValue default clearfix">' +
                                '<p class="fl">' + $('#Item').val() + '</p>' +
                                '<p class="fr">' + $('#money').val() + '元</p>' +
                                '</div>' +
                                '<span class="a-delete" >删除</span>' +
                                '</li>';
                            $(this).parent().parent().siblings('.xian-classes').append(html);
                            $('#Item').val('');
                            $('#money').val('');
                        }
                    }
                });
                /*删除险种*/
                $("body").delegate("#InsuranceItem_add .xian-classes .a-delete", "click", function (e) {
                    $(this).parents('li').remove();
                });

                /*新增事件*/
                $('.addInsurance').click(function () {
                    common.showPopbox(' ① 添加保险概要信息', $('#carsInsurance_add'), function () {
                    }, function (layerIndex1) {
                        if ($('#addInsuranceform').validationEngine('validate')) {
                            common.showPopbox(' ② 添加保险项目信息', $('#InsuranceItem_add'), function () {
                                layer.close(layerIndex1);
                            }, function (layerIndex2) {

                                layer.close(layerIndex2);
                                var params = {};
                                params.eindate = new Date($('#nextInsuranceTime').val());
                                params.indate = new Date($('#insuranceTime').val());
                                params.innum = $('#innum').val();
                                params.viid = carId;

                                webserver.query(params, apipath.cars.singleCarInsurance.add, methods.add, function (error, data, layerIndex) {

                                    var ItemArr = new Array();
                                    $('#InsuranceItem_add .xian-classes .ItemsValue').each(function () {
                                        var ItemValue = {
                                            "infee": $(this).find('p.fr').text().replace('元', ''),
                                            "intype": $(this).find('p.fl').text(),
                                            "vsid": data
                                        };
                                        ItemArr.push(ItemValue);
                                    });
                                    if (ItemArr.length > 0) {
                                        webserver.query(ItemArr, apipath.cars.InsuranceItem.add + "/" + data, methods.add);
                                    } else {
                                        layer.close(layerIndex);
                                        common.showAlert('0', '您已成功添加保险信息,但未添加保险项目,若添加保险项目,请点击"' + $('#innum').val() + '年度保险信息"进行修改添加.', function () {
                                            window.location.reload();
                                        })
                                    }
                                });
                            });
                        }
                    });
                });


                /*点击显示详情*/
                $("body").delegate(".Insurance-list .open-details .ds a", "click", function (e) {
                    $(e.currentTarget).parent().parent().parent().toggleClass('open');
                });
                /*删除*/
                $("body").delegate(".Insurance-list .zt .btn-delete", "click", function (e) {
                    common.showConfirm('请您确认以下信息', '您将删除' + $(e.currentTarget).parent().siblings('.hys1').find('p').text() + '的相关信息', function () {
                    }, function () {
                        var id=$(e.currentTarget).parent().find('input.InsuranceId').val();
                        webserver.query(null, apipath.cars.singleCarInsurance.delete + id, methods.delete);
                    });
                });
                /*修改*/
                $("body").delegate(".Insurance-list .zt .btn-details", "click", function (e) {
                    var id=$(e.currentTarget).parent().find('input.InsuranceId').val();
                    common.showPopbox(' ① 修改保险概要信息', $('#carsInsurance_add'), function () {
                        webserver.query(null, apipath.cars.singleCarInsurance.single+id, methods.search, function (error, data, layerIndex) {

                            $('#innum').val(data.innum);
                            $('#nextInsuranceTime').val(common.myDate.dateFormat(data.eindate,'yyyy-MM-dd'));
                            $('#insuranceTime').val(common.myDate.dateFormat(data.indate,'yyyy-MM-dd'));
                            $('#Item').val('');
                            $('#money').val('');

                            var html = '';
                            for (var j = 0; j < data.insurancesVoList.length; j++) {
                                html = html+'<li>' +
                                    '<div class="ItemsValue default clearfix">' +
                                    '<p class="fl">' + data.insurancesVoList[j].intype + '</p>' +
                                    '<p class="fr">' + data.insurancesVoList[j].infee + '元</p>' +
                                    '</div>' +
                                    '<span class="a-delete" >删除</span>' +
                                    '</li>';
                            }
                            $('#InsuranceItem_add .xian-classes').html(html);
                            layer.close(layerIndex);
                        })

                    }, function (layerIndex1) {
                        if ($('#addInsuranceform').validationEngine('validate')) {
                            common.showPopbox(' ② 修改保险项目信息', $('#InsuranceItem_add'), function () {
                                layer.close(layerIndex1);
                            }, function (layerIndex2) {
                                layer.close(layerIndex2);
                                var params = {};
                                params.eindate = new Date($('#nextInsuranceTime').val());
                                params.indate = new Date($('#insuranceTime').val());
                                params.innum = $('#innum').val();
                                params.viid = carId;

                                webserver.query(params, apipath.cars.singleCarInsurance.edit + id, methods.edit, function (error, data, layerIndex) {

                                    var ItemArr = new Array();
                                    $('#InsuranceItem_add .xian-classes .ItemsValue').each(function () {
                                        var ItemValue = {
                                            "infee": $(this).find('p.fr').text().replace('元', ''),
                                            "intype": $(this).find('p.fl').text(),
                                            "vsid": id
                                        };
                                        ItemArr.push(ItemValue);
                                    });
                                    // if (ItemArr.length > 0) {
                                    //     webserver.query(ItemArr, apipath.cars.InsuranceItem.add + "/" + id, methods.add);
                                    // }
                                    webserver.query(ItemArr, apipath.cars.InsuranceItem.add + "/" + id, methods.add);
                                });
                            });
                        }
                    });
                });

            },
            page_list: function (current_page, carId) {
                if(!carId){
                    carId = common.cookies.get('carId');
                }
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.singleCarInsurance_rows_count
                };
                //获取相关条件
                param.startdate = $('#startTime').val();
                param.enddate = $('#endTime').val();
                webserver.query(param, apipath.cars.singleCarInsurance.list + carId, methods.search, cars.singleCarInsurance.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<li>' +
                            '<div class="open-details ">' +
                            '<ul class="list-two">' +
                            '<li class="hys1">' +
                            '<p>' + data.list[i].innum + '年度保险信息</p>' +
                            common.myDate.dateFormat(new Date(data.list[i].indate), 'yyyy年MM月dd日') +
                            '</li>' +
                            '<li class="rl">' +
                            data.list[i].intfee + '元' +
                            '</li>' +
                            '<li class="ds">' +
                            '<a href="#">详情<i class="jt-t"></i></a>' +
                            '</li>' +
                            '<li class="zt">' +
                            '<input type="hidden" class="InsuranceId" value="'+data.list[i].id+'" />' +
                            '<button class="btn-delete">删除</button> ' +
                            '<button class="btn-details">修改</button>' +
                            '</li>' +
                            '</ul>' +
                            '<div class="baoxian-details">' +
                            '<ul class="clearfix baoxian-txt">' +
                            '<li>保险项目：<br />';
                        for (var j = 0; j < data.list[i].insurancesVoList.length; j++) {
                            html = html + (j + 1) + '、' + data.list[i].insurancesVoList[j].intype + ' —— ' + data.list[i].insurancesVoList[j].infee + '元<br />';
                        }

                        html = html + '本年度保险费用：' + data.list[i].intfee + '元 ;</li>' +
                            '<li>' +
                            '保险日期：<br />' +
                            common.myDate.dateFormat(new Date(data.list[i].indate), 'yyyy年MM月dd日') +
                            '</li>' +
                            '<li>' +
                            '到险日期：<br />' +
                            common.myDate.dateFormat(new Date(data.list[i].eindate), 'yyyy年MM月dd日') +
                            '</li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>' +
                            '</li>';
                    }

                }//调用分页
                pagination.Initialization(data.total, pagination.singleCarInsurance_rows_count, data.pageNum, cars.singleCarInsurance.page_list);
                $('.Insurance-list').html(html);
                layer.close(layerIndex);
            }
        },
        carsInsurance: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                cars.carsInsurance.page_list(1);
                /*点击更多跳转*/
                $("body").delegate(".baoxian-list .baoxian .san-more a", "click", function (e) {
                    common.cookies.set('carId', $(e.currentTarget).find('input.CarInsuranceId').val());
                });
            },
            page_list: function (current_page) {
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.carsInsurance_rows_count
                };
                webserver.query(param, apipath.cars.carsInsurance.list, methods.search, cars.carsInsurance.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<ul class="baoxian">' +
                            '<li class="bh-txt">' +
                            '<p><span>' + data.list[i].num + '</span><br>' + data.list[i].plate + '<br>' + data.list[i].typev + '</p>' +
                            '</li>' +
                            '<li class="last-baoxian">' +
                            '<table>' +
                            '<tr>' +
                            '<th colspan="4">最近一次保险</th>' +
                            '</tr>' +
                            '<tr class="border">' +
                            '<td width="25%" rowspan="2">保险总费用<br>' + data.list[i].totalfee + '元</td>' +
                            '<td width="25%">保险时间</td>' +
                            '<td width="25%">保险费用</td>' +
                            '<td width="25%">到险时间</td>' +
                            '</tr>' +
                            '<tr class="b-r">' +
                            '<td>' + common.myDate.dateFormat(new Date(data.list[i].indate), 'yyyy年MM月dd日') + '</td>' +
                            '<td>¥' + data.list[i].intfee + '</td>' +
                            '<td>' + common.myDate.dateFormat(new Date(data.list[i].eindate), 'yyyy年MM月dd日') + '</td>' +
                            '</tr>' +
                            '</table>' +
                            '</li>' +
                            '<li class="san-more">' +
                            '<a href="singleCarInsurance.html" >' +
                            '<input type="hidden" class="CarInsuranceId" value="'+data.list[i].id+'" />' +
                            '<p>更多保险<br />信息</p>' +
                            '<i class="icon-more"></i>' +
                            '</a>' +
                            '</li>' +
                            '</ul>';
                    }

                }//调用分页
                pagination.Initialization(data.total, pagination.carsInsurance_rows_count, data.pageNum, cars.carsInsurance.page_list);
                $('.baoxian-list').html(html);
                layer.close(layerIndex);
            }
        },
        carsBooking:{
            Initialization: function () {
                /*初始化* */
                /*初始化菜单* */
                common.menusInitialization();
                /*获取传递过来的roomid*/
                var carId = common.cookies.get('carId');
                /*列表*/
                cars.carsBooking.list(carId);
                /*查询事件*/
                $('.search').click(function () {
                    cars.carsBooking.list(carId);
                });
                var user = JSON.parse(common.cookies.get('!@#2017hd_user'));
                /*预置预定按钮事件*/
                $("body").delegate("ul[class^='day'] li.hy-set a.can-dy", "click", function (e) {
                    common.showPopbox('车辆预定', $('#carsOrder'), function () {
                         $('.orderDate').html($(e.currentTarget).parent().siblings('.week').attr('title'));
                         $('.orderUserName').html(user.userName);
                         $('#destination').val('');
                         $('#depart').val('');
                         $('#reason').val('');
                        $('#carEndTime').val($(e.currentTarget).find('.yd-end').text());
                        $('#carStartTime').val($(e.currentTarget).find('.yd-start').text());
                    }, function (layerIndex) {
                        if ($('.order-form').validationEngine('validate')) {
                            cars.carsBooking.confirmOrder(carId, layerIndex, 'add');
                        }
                    });
                });
                /*预置选择预定，显示详情*/
                $("body").delegate("ul[class^='day'] li.hy-set a.done", "mouseover", function (e) {
                    common.showTips($(e.currentTarget).find('p').html(), $(e.currentTarget), $(e.currentTarget).css('background-color'), 4000);
                });
                /*点击预定好的修改/删除预定*/
                $("body").delegate("ul[class^='day'] li.hy-set a.lready-dy", "click", function (e) {
                    /*展示选择层，目前最多两种选择，一个取消按钮*/
                    var orderId = $(e.currentTarget).find('input[name="orderId"]').val();
                    layer.msg('<span style="color:#ffffff">请选择以下操作：</span>', {
                        time: 0,
                        btn: ['修改', '删除'],
                        shadeClose: true,
                        shade: 0.3,
                        btn1: function (index) {
                            layer.close(index);
                            common.showPopbox('修改车辆预定', $('#carsOrder'), function () {
                                $('.orderDate').html($(e.currentTarget).parent().siblings('.week').attr('title'));
                                $('.orderUserName').html(user.userName);
                                $('#order_destination').val($(e.currentTarget).find('.destination').text());
                                $('#order_departure').val($(e.currentTarget).find('.departure').text());
                                $('#order_reason').val($(e.currentTarget).find('.reason').text());
                                $('#carEndTime').val($(e.currentTarget).find('.yd-end').text());
                                $('#carStartTime').val($(e.currentTarget).find('.yd-start').text());
                            }, function (layerIndex) {
                                 if ($('.order-form').validationEngine('validate')) {
                                cars.carsBooking.confirmOrder(carId, layerIndex, 'edit', orderId);
                                //     layer.close(layerIndex);
                                 }
                            });
                        }
                        , btn2: function (index) {
                            layer.close(index);
                            common.showPopbox('删除车辆预定', $('#carsOrderCancel'), function () {
                                $('#carsOrderCancel .qxyd-orderUser').html($(e.currentTarget).find('.creater').text());
                                $('#carsOrderCancel .qxyd-orderDate').html($(e.currentTarget).parent().siblings('.week').attr('title'));
                                $('#carsOrderCancel .qxyd-orderTime').html($(e.currentTarget).find('.yd-start').text() + '-' + $(e.currentTarget).find('.yd-end').text());
                                $('#qxyd_reason').val('');
                                $('#qxyd_mark').val('');
                            }, function (layerIndex) {
                                cars.carsBooking.cancelOrder($(e.currentTarget).find('input[name="orderId"]').val(), layerIndex);
                                layer.close(layerIndex);
                            });
                        }
                    });
                });
            },
            list: function (carId) {
                var timestamp = Date.parse(new Date());
                /*当前时间的默认值*/
                if (!$('#startTime').val()) {
                    $('#startTime').val(common.myDate.dateFormat(timestamp, 'yyyy-MM-dd'));
                }
                //获取当前时间
                $('.data-box h2').html(common.myDate.dateFormat(timestamp, 'yyyy年MM月dd日'));
                var params={};
                params.date=$('#startTime').val();
                webserver.query(params, apipath.cars.carsBooking.singleOrder + carId , methods.search, cars.carsBooking.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                $('#driverId').val(data.driverid);
                $('#carsOrder .driverInfo').text(data.dname+'/'+data.phone);
                $('.cur-page-txt span').html(data.id + " 号车使用详情");
                $('.hys-txt h2').html(data.num).siblings('p').html(data.plate + '  &nbsp;| &nbsp; ' + data.typev + '  &nbsp; | &nbsp;  ' + data.dname + '&nbsp; | &nbsp;' + data.phone) ;

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

                /*按秒计算最小长度的百分比*/
                var basicwidth = parseFloat(100 / 14 / 60 / 60 / 1000);
                /*显示模块*/
                if (data.veorderList.length && data.veorderList.length > 0) {
                    for (var i = 0; i < data.veorderList.length; i++) {
                        cars.carsBooking.showOrderModule(data.veorderList[i], basicwidth);
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
                /*如果查询的周一比当前的周一大，执行填充预定操作，填充可订阅部分*/
                if (Date.parse(firstDay) >= Date.parse(thisweekfirstDay)) {
                    /*填充可订阅部分*/
                    var getToday = common.myDate.dateFormat(new Date(), 'yyyy-MM-dd');
                    for (var i = 0; i < 7; i++) {
                        var currentDay = $('.time-set .day' + i + ' .week').attr('title');
                        /*过去的不能预定*/
                        if ((Date.parse(thisweekfirstDay) === Date.parse(firstDay) && (currentDay >= getToday || i === 0)) || Date.parse(firstDay) > Date.parse(thisweekfirstDay)) {
                            var a_count = $('.time-set .day' + i + ' .hy-set').children('a.done').length;
                            /*当前时间开始的位置*/
                            var nowDateStartPosition = (Date.parse(new Date()) - Date.parse(common.myDate.dateFormat(Date.parse(new Date()), 'yyyy-MM-dd') + ' 06:00:00')) * basicwidth;
                            if (a_count > 0) {
                                /*除了最后未填充部分的宽度，为百分比*/
                                /*父级的宽度*/
                                var parentwidth = $('.time-set .day' + i + ' .hy-set').css('width').replace('px', '');

                                $('.time-set .day' + i + ' .hy-set a.done').each(function () {
                                    /*每个订阅记录距左边第一个的width,百分比*/
                                    var thismarginleft = parseFloat($(this).css('margin-left').replace('px', '')) / parentwidth * 100;
                                    var lastHtml = "";
                                    var prevcount = $(this).prev('a.done').length;
                                    if (prevcount) {
                                        var premarginleft = parseFloat($(this).prev('a.done').css('margin-left').replace('px', '')) / parentwidth * 100;
                                        var prewidth = $(this).prev('a.done').css('width').replace('px', '') / parentwidth * 100;
                                        var orderbtnwidth = thismarginleft - prewidth - premarginleft;
                                        var can_dy_startPosition = prewidth + premarginleft;
                                        /*剩余小于10分钟当作不可预定 2.4=100/14/60*2*10 */
                                        if (orderbtnwidth > 2.4) {
                                            /*今天过了的时间不允许选择*/
                                            if (getToday === currentDay) {
                                                if (nowDateStartPosition > can_dy_startPosition) {
                                                    if (nowDateStartPosition < thismarginleft - 2.4) {
                                                        /*获取未预定的起止时间*/
                                                        orderbtnwidth = orderbtnwidth - (nowDateStartPosition - can_dy_startPosition);
                                                        can_dy_startPosition = nowDateStartPosition;
                                                        lastHtml = '<a style="width:' + (orderbtnwidth - 0.1) + '%;margin-left: ' + (can_dy_startPosition + 0.1) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + common.myDate.dateFormat(new Date().setMinutes(new Date().getMinutes() + 10), 'hh:mm') + '</span><span class="yd-end">' + $(this).find('.yd-start').text() + '</span></p></a>';
                                                    }
                                                } else if (nowDateStartPosition <= can_dy_startPosition) {
                                                    lastHtml = '<a style="width:' + (orderbtnwidth - 0.1) + '%;margin-left: ' + (can_dy_startPosition + 0.1) + '%" class="c an-dy" href="#"><p>＋预定<span class="yd-start">' + $(this).prev('a.done').find('.yd-end').text() + '</span><span class="yd-end">' + $(this).find('.yd-start').text() + '</span></p></a>';
                                                }
                                            } else {
                                                lastHtml = '<a style="width:' + (orderbtnwidth - 0.2) + '%;margin-left: ' + (can_dy_startPosition + 0.1) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + $(this).prev('a.done').find('.yd-end').text() + '</span><span class="yd-end">' + $(this).find('.yd-start').text() + '</span></p></a>';
                                            }
                                        }
                                    } else {
                                        if (getToday === currentDay) {
                                            if (nowDateStartPosition <= thismarginleft && (thismarginleft - nowDateStartPosition)>2.4) {
                                                lastHtml = '<a style="width:' + (thismarginleft - nowDateStartPosition - 0.1 ) + '%;margin-left:' + nowDateStartPosition + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">'+ common.myDate.dateFormat(new Date().setMinutes(new Date().getMinutes() + 10), 'hh:mm')+'</span><span class="yd-end">' + $(this).find('.yd-start').text() + '</span></p></a>';
                                            }
                                        } else {
                                            if((thismarginleft - 0.1)>2.4) {
                                                lastHtml = '<a style="width:' + (thismarginleft - 0.1) + '%;margin-left:0%" class="can-dy" href="#"><p>＋预定<span class="yd-start">06:00</span><span class="yd-end">' + $(this).find('.yd-start').text() + '</span></p></a>';
                                            }
                                        }
                                    }
                                    $(this).before(lastHtml);
                                });
                                var last = $('.time-set .day' + i + ' .hy-set a.done').last();
                                if(last.length>0) {
                                    var lastmarginleft = parseFloat($(last).css('margin-left').replace('px', '')) / parentwidth * 100;
                                    var lastwidth = parseFloat($(last).css('width').replace('px', '')) / parentwidth * 100;
                                    var lastorderbtnwidth = 100 - lastmarginleft - lastwidth;
                                    var lastorderbtnmarginleft = lastwidth + lastmarginleft;

                                    /*剩余小于两分钟当作不可预定 0.24=100/14/60*2*10 */
                                    if (lastorderbtnwidth > 2.4) {
                                        var lastHtml = '';
                                        if (getToday === currentDay) {
                                            if (nowDateStartPosition > lastorderbtnmarginleft) {
                                                /*获取未预定的起止时间*/
                                                lastorderbtnwidth = lastorderbtnwidth - (nowDateStartPosition - lastorderbtnmarginleft);
                                                lastorderbtnmarginleft = nowDateStartPosition;
                                                lastHtml = '<a style="width:' + (lastorderbtnwidth - 0.1) + '%;margin-left: ' + (nowDateStartPosition + 0.1) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + common.myDate.dateFormat(new Date().setMinutes(new Date().getMinutes() + 10), 'hh:mm') + '</span><span class="yd-end">20:00</span></p></a>';
                                            } else {
                                                /*获取未预定的起止时间*/
                                                lastHtml = '<a style="width:' + (lastorderbtnwidth-0.1) + '%;margin-left: ' + (lastorderbtnmarginleft+0.1) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + $('.time-set .day' + i + ' .hy-set a.done').last().find('p span.yd-end').text() + '</span><span class="yd-end">20:00</span></p></a>';
                                            }
                                        } else {
                                            lastHtml = '<a style="width:' + (lastorderbtnwidth - 0.1) + '%;margin-left: ' + (lastorderbtnmarginleft + 0.1 ) + '%" class="can-dy" href="#"><p>＋预定<span class="yd-start">' + $('.time-set .day' + i + ' .hy-set a.done').last().find('p span.yd-end').text() + '</span><span class="yd-end">20:00</span></p></a>';
                                        }
                                        $('.time-set .day' + i + ' .hy-set').append(lastHtml);
                                    }
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
            showOrderModule: function (data, basicwidth) {
                var orderDay = new Date(data.bedatetime).getDay();
                /*模块长度*/
                var width = (parseInt(data.endatetime) - parseInt(data.bedatetime)) * basicwidth;
                /*模块距左边距*/
                var begintimestamp = Date.parse(new Date($('.time-set .day' + orderDay + ' .week').attr('title') + ' 06:00:00'));
                var marginleft = (parseInt(data.bedatetime) - parseInt(begintimestamp)) * basicwidth;
                /*当前时间*/
                var timestamp = Date.parse(new Date());
                /*获取会议开始结束时间*/
                var start = common.myDate.dateFormat(data.bedatetime, 'hh:mm');
                var end = common.myDate.dateFormat(data.endatetime, 'hh:mm');
                /*没过期*/
                var html = "";
                var a_class="";
                if (parseInt(timestamp) > parseInt(data.bedatetime)) {
                    a_class=" last-dy";
                }
                else {
                    a_class=" lready-dy";
                }
                html = '<a style="width:' + (width - 0.1) + '%;margin-left:' + (marginleft + 0.1) + '%" class="done '+a_class+'" href="#">' +
                    '<input type="hidden" name="orderId" value="' + data.id + '" />' +
                    '<p style="display: none">' +
                    '<span class="title">预定用户：</span><span class="creater info">' + data.creater + '</span><br>' +
                    '<span class="title">起止时间：</span><span class="yd-start">' + start + '</span>-<span class="yd-end">' + end + '</span><br>' +
                    '<span class="title">出发地点：</span><span class="departure info">' + data.departure + '</span><br>' +
                    '<span class="title">目的地点：</span><span class="destination info">' + data.destination + '</span><br>' +
                    '<span class="title">使用原因：</span><span class="reason info">' + data.reason + '</span><br>' +
                    '</p>' +
                    '</a>';
                $('.time-set .day' + orderDay + ' .hy-set').append(html);
            },
            confirmOrder: function (carId, PopBox_layerIndex, action, orderId) {
                common.showPopbox('请确认车辆预定信息', $('#carsOrderConfirm'), function () {
                    $('#carsOrderConfirm .qr-orderName').html($('#carsOrder .orderUserName').html());
                    $('#carsOrderConfirm .qr-orderDate').html($('#carsOrder .orderDate').html());
                    $('#carsOrderConfirm .qr-reason').html($('#order_reason').val());
                    $('#carsOrderConfirm .qr-destination').html($('#order_destination').val());
                    $('#carsOrderConfirm .qr-departure').html($('#order_departure').val());
                    $('#carsOrderConfirm .qr-orderTime').html($('#carStartTime').val() + '-' + $('#carEndTime').val());
                }, function (PopBoxConfirm_layerIndex) {
                    var orderUserId=common.cookies.get("!@#2017hd_userId");
                     if (action === "add") {
                        var params = {};
                        params.departure = $('#order_departure').val();
                        params.destination = $('#order_destination').val();
                        params.reason=$('#order_reason').val();
                        params.veid=carId;
                        params.driverid=$('#driverId').val();
                        params.userid=orderUserId;
                        params.endatetime = Date.parse($('#carsOrder .t-table .orderDate').text() + ' ' + $('#carEndTime').val());
                        params.bedatetime = Date.parse($('#carsOrder .t-table .orderDate').text() + ' ' + $('#carStartTime').val());
                        webserver.query(params, apipath.cars.carsBooking.add, methods.add, function (error, data, layerIndex) {

                            var textmsg = '您已成功预定编号为：' + data.num + ' 的车辆，并向该车司机发出通知；<br>时间：' + common.myDate.dateFormat(new Date(data.begindate), 'yyyy年MM月dd日') + ' ' + common.myDate.dateFormat(new Date(data.begindate), 'hh:mm') + ' - ' + common.myDate.dateFormat(new Date(data.enddate), 'hh:mm');
                            common.showAlert(1, textmsg, function (index) {
                                layer.close(layerIndex);
                                window.location.reload();
                            });
                        });
                    } else if (action === "edit") {
                         var params = {};
                         params.departure = $('#order_departure').val();
                         params.destination = $('#order_destination').val();
                         params.reason=$('#order_reason').val();
                         params.veid=carId;
                         params.driverid=$('#driverId').val();
                         params.userid= orderUserId;
                         params.endatetime = Date.parse($('#carsOrder .t-table .orderDate').text() + ' ' + $('#carEndTime').val());
                         params.bedatetime = Date.parse($('#carsOrder .t-table .orderDate').text() + ' ' + $('#carStartTime').val());
                         webserver.query(params, apipath.cars.carsBooking.edit+orderId, methods.edit, function (error, data, layerIndex) {
                             var textmsg = '您已成功预定' + data.num + '号车，并向司机发出通知；<br>时间：' + common.myDate.dateFormat(new Date(data.begindate), 'yyyy年MM月dd日') + ' ' + common.myDate.dateFormat(new Date(data.begindate), 'hh:mm') + ' - ' + common.myDate.dateFormat(new Date(data.enddate), 'hh:mm');
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
                webserver.query(params, apipath.cars.carsBooking.delete + orderId, methods.delete, function (error, data, layerIndex) {
                    layer.close(layerIndex);
                });
            }
        },
        carsAnnualInspection:{
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                cars.carsAnnualInspection.page_list(1);
                /*点击更多跳转*/
                $("body").delegate(".baoxian-list .baoxian .san-more a", "click", function (e) {
                    common.cookies.set('carId', $(e.currentTarget).find('input.CarAnnualInspectionId').val());
                });
            },
            page_list: function (current_page) {
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.carsAnnualInspection_rows_count
                };
                webserver.query(param, apipath.cars.carsAnnualInspection.list, methods.search, cars.carsAnnualInspection.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<ul class="baoxian">' +
                            '<li class="bh-txt">' +
                            '<p><span>' + data.list[i].num + '</span><br>' + data.list[i].plate + '<br>' + data.list[i].typev + '</p>' +
                            '</li>' +
                            '<li class="last-baoxian">' +
                            '<table>' +
                            '<tr>' +
                            '<th colspan="4">最近一次年检</th>' +
                            '</tr>' +
                            '<tr class="border">' +
                            '<td width="25%" rowspan="2">年检总费用<br>' + data.list[i].checkfee + '元</td>' +
                            '<td width="25%">年检时间</td>' +
                            '<td width="25%">年检费用</td>' +
                            '<td width="25%">到险时间</td>' +
                            '</tr>' +
                            '<tr class="b-r">' +
                            '<td>' + common.myDate.dateFormat(new Date(data.list[i].ckdate), 'yyyy年MM月dd日') + '</td>' +
                            '<td>¥' + data.list[i].ckfee + '</td>' +
                            '<td>' + common.myDate.dateFormat(new Date(data.list[i].nckdate), 'yyyy年MM月dd日') + '</td>' +
                            '</tr>' +
                            '</table>' +
                            '</li>' +
                            '<li class="san-more">' +
                            '<a href="singleCarAnnualInspection.html" >' +
                            '<input type="hidden" class="CarAnnualInspectionId" value="'+data.list[i].id+'" />' +
                            '<p>更多年检<br />信息</p>' +
                            '<i class="icon-more"></i>' +
                            '</a>' +
                            '</li>' +
                            '</ul>';
                    }

                }//调用分页
                pagination.Initialization(data.total, pagination.carsAnnualInspection_rows_count, data.pageNum, cars.carsAnnualInspection.page_list);
                $('.baoxian-list').html(html);
                layer.close(layerIndex);
            }
        },
        singleCarAnnualInspection:{
            Initialization: function () {
                var carId = common.cookies.get('carId');
                $('.main .cur-page-txt').html(carId + '号车辆年检信息详情');
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                cars.singleCarAnnualInspection.page_list(1, carId);
                /*查询事件*/
                $('.search').click(function () {
                    cars.singleCarAnnualInspection.page_list(1, carId);
                });

                /*新增事件*/
                $('.addInspection').click(function () {
                    common.showPopbox('新增年检信息', $('#addAnnualInspection'), function () {
                        $('#number').val('');
                        $('#thisTime').val('');
                        $('#nextTime').val('');
                        $('#totalFee').val('');
                    }, function (layerIndex1) {
                        if ($('#addAnnualInspectionform').validationEngine('validate')) {
                            var params = {};
                            params.cknumber = $('#number').val();
                            params.ckdate = Date.parse($('#thisTime').val());
                            params.nckdate = Date.parse($('#nextTime').val());
                            params.ckfee = $('#totalFee').val();
                            params.vaid = carId;
                            webserver.query(params, apipath.cars.singleCarAnnualInspection.add, methods.add);
                            layer.close(layerIndex1);
                        }
                    });
                });
                /*删除*/
                $("body").delegate(".AnnualInspection-list .zt .btn-delete", "click", function (e) {
                    common.showConfirm('请您确认以下信息', '您将删除' + $(e.currentTarget).parent().siblings('.hys1').find('p').text() + '的相关信息', function () {
                    }, function () {
                        var id=$(e.currentTarget).parent().find('input.AnnualInspectionId').val();
                        webserver.query(null, apipath.cars.singleCarAnnualInspection.delete + id, methods.delete);
                    });
                });
                /*修改*/
                $("body").delegate(".AnnualInspection-list .zt .btn-details", "click", function (e) {
                    var id=$(e.currentTarget).parent().find('input.AnnualInspectionId').val();
                    common.showPopbox('修改年检信息', $('#addAnnualInspection'), function () {
                        webserver.query(null, apipath.cars.singleCarAnnualInspection.single+id, methods.search, function (error, data, layerIndex) {

                            $('#number').val(data.cknumber);
                            $('#thisTime').val(common.myDate.dateFormat(data.ckdate,'yyyy-MM-dd hh:mm:ss'));
                            $('#nextTime').val(common.myDate.dateFormat(data.nckdate,'yyyy-MM-dd hh:mm:ss'));
                            $('#totalFee').val(data.ckfee);
                            layer.close(layerIndex);
                        });
                    },function(layerIndex1){
                        if ($('#addAnnualInspectionform').validationEngine('validate')) {
                            var params = {};
                            params.cknumber = $('#number').val();
                            params.ckdate = Date.parse($('#thisTime').val());
                            params.nckdate = Date.parse($('#nextTime').val());
                            params.ckfee = $('#totalFee').val();
                            params.vaid = carId;
                            webserver.query(params, apipath.cars.singleCarAnnualInspection.edit + id, methods.edit);
                            layer.close(layerIndex1);
                        }
                    });
                });
            },
            page_list: function (current_page, carId) {
                if(!carId){
                    carId = common.cookies.get('carId');
                }
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.singleCarAnnualInspection_rows_count
                };
                //获取相关条件
                param.startdate = $('#startTime').val();
                param.enddate = $('#endTime').val();
                webserver.query(param, apipath.cars.singleCarAnnualInspection.list + carId, methods.search, cars.singleCarAnnualInspection.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html+
                            '<li>' +
                            '<div class="open-details">' +
                            '<ul class="list-two">' +
                            '<li class="hys1">' +
                            '<p>'+data.list[i].cknumber+'年度年检信息</p>' +
                            common.myDate.dateFormat(data.list[i].ckdate,'yyyy-MM-dd')+
                            '<span class="next-nianjian">下次年检时间：'+common.myDate.dateFormat(data.list[i].nckdate,'yyyy-MM-dd')+'</span>' +
                            '</li>' +
                            '<li class="rl">' +
                            '年检费用：' +
                            data.list[i].ckfee+
                            '</li>' +
                            '<li class="zt">' +
                            '<input type="hidden" class="AnnualInspectionId" value="'+data.list[i].id+'" />' +
                            '<button class="btn-delete">删除</button> ' +
                            '<button class="btn-details">修改</button>' +
                            '</li>' +
                            '</ul>' +
                            '</div>' +
                            '</li>' ;
                    }

                }//调用分页
                pagination.Initialization(data.total, pagination.singleCarAnnualInspection_rows_count, data.pageNum, cars.singleCarAnnualInspection.page_list);
                $('.AnnualInspection-list').html(html);
                layer.close(layerIndex);
            }
        },
        carsOrderTimes:{
            /**初始化**/
            Initialization: function () {
                /**初始化菜单* */
                common.menusInitialization();

                /*初始化時間，默認上個月，寫在前面*/
                var DateArr = common.myDate.setDate.getPreviousMonth();
                $("#startTime").val(common.myDate.dateFormat(DateArr[0],'yyyy-MM-dd'));
                $("#endTime").val(common.myDate.dateFormat(DateArr[1],'yyyy-MM-dd'));

                cars.carsOrderTimes.list();
                /**查询事件*/
                $('.search').click(function () {
                    cars.carsOrderTimes.list();
                });

                /**预置详情按钮事件*/
                $("body").delegate(".chart-box .btn-details", "click", function (e) {
                    /**通过cookies传递roomid**/
                    common.cookies.set('orderCarId', $(e.currentTarget).attr("title"));
                    common.cookies.set('startDateTime', $("#startTime").val());
                    common.cookies.set('endDateTime', $("#endTime").val());
                });
            },
            list: function () {
                var param = {};
                param.startdate = $('#startTime').val();
                param.enddate = $('#endTime').val();
                webserver.query(param, apipath.cars.carsOrderTimes.list, methods.search, cars.carsOrderTimes.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.length && data.length > 0) {

                    var totaltimes = 0;
                    for (var i = 0; i < data.length; i++) {
                        totaltimes = totaltimes + data[i].count;
                    }

                    for (var i = 0; i < data.length; i++) {
                        
                        html= html+
                            '<ul class="chart-box">' +
                            '<li class="hys-details">' +
                            '<p>'+ data[i].num +' '+data[i].plate+'</p>' +
                            '<a title="'+data[i].id+'"  class="btn-details" href="carsLog.html">详情</a>' +
                            '</li>' +
                            '<li class="long">' ;
                        var j = common.RandomNum(1, 7);
                        html = html +
                            '<div class="color-' + j + '" style="width:' + (parseInt(totaltimes) === 0 ? 0 : (parseFloat(data[i].count) / parseFloat(totaltimes) * 100).toFixed(2)) + '%;"></div>' +
                            '<span class="color-' + j + '">' + data[i].count + '次</span>' +
                            '</li>' +
                            '</ul>';
                    }
                }
                $('.chartlist').html(html);
                layer.close(layerIndex);
            }
        },
        singleCarVehicle: {
            Initialization: function () {
                var carId = common.cookies.get('carId');
                $('.main .cur-page-txt').html(carId + '号车辆保养信息详情');
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                cars.singleCarVehicle.page_list(1, carId);
                /*查询事件*/
                $('.search').click(function () {
                    cars.singleCarVehicle.page_list(1, carId);
                });

                /*新增保养项目*/
                $('#VehicleItem_add .xianzhong .addItem').click(function () {
                    if ($('#VehicleItemfrom').validationEngine('validate')) {
                        if ($('#Item').val() !== "" && $('#money').val() !== "") {
                            var html =
                                '<li>' +
                                '<div class="ItemsValue default clearfix">' +
                                '<p class="fl">' + $('#Item').val() + '</p>' +
                                '<p class="fr">' + $('#money').val() + '元</p>' +
                                '</div>' +
                                '<span class="a-delete" >删除</span>' +
                                '</li>';
                            $(this).parent().parent().siblings('.xian-classes').append(html);
                            $('#Item').val('');
                            $('#money').val('');
                        }
                    }
                });
                /*删除保养项目*/
                $("body").delegate("#VehicleItem_add .xian-classes .a-delete", "click", function (e) {
                    $(this).parents('li').remove();
                });
                /*新增事件*/
                $('.addVehicle').click(function () {
                    common.showPopbox(' ① 添加保养概要信息', $('#Vehicle_add'), function () {
                    }, function (layerIndex1) {
                        if ($('#addCarVehicleform').validationEngine('validate')) {
                            common.showPopbox(' ② 添加保养项目信息', $('#VehicleItem_add'), function () {
                                layer.close(layerIndex1);
                            }, function (layerIndex2) {
                                layer.close(layerIndex2);
                                var params = {};
                                params.mileage = $('#maintenanceKM').val();
                                params.nmileage = $('#nextMaintenanceKM').val();
                                params.vmid = carId;
                                params.nmdate = new Date($('#nextVehicleTime').val());
                                params.mdate = new Date($('#VehicleTime').val());
                                params.mnumber = $('#num').val();

                                webserver.query(params, apipath.cars.singleCarVehicle.add, methods.add, function (error, data, layerIndex) {
                                    var ItemArr = new Array();
                                    $('#VehicleItem_add .xian-classes .ItemsValue').each(function () {
                                        var ItemValue = {
                                            "mfee": $(this).find('p.fr').text().replace('元', ''),
                                            "mparagrame": $(this).find('p.fl').text(),
                                            "vmtid": data
                                        };
                                        ItemArr.push(ItemValue);
                                    });
                                    if (ItemArr.length > 0) {
                                        webserver.query(ItemArr, apipath.cars.carsVehicleItem.add + "/" + data, methods.add);
                                    } else {
                                        layer.close(layerIndex);
                                        common.showAlert('0', '您已成功添加保养信息,但未添加保养项目,若添加保养项目,请点击"保养第' + $('#num').val() + '次"进行修改添加.', function () {
                                            window.location.reload();
                                        })
                                    }
                                });
                            });
                        }
                    });
                });
                /*点击显示详情*/
                $("body").delegate(".vehicle-list .open-details .ds a", "click", function (e) {
                    $(e.currentTarget).parent().parent().parent().toggleClass('open');
                });
                /*删除*/
                $("body").delegate(".vehicle-list .zt .btn-delete", "click", function (e) {
                    common.showConfirm('请您确认以下信息', '您将删除' + $(e.currentTarget).parent().siblings('.hys1').find('p').text() + '的相关信息', function () {
                    }, function () {
                        var id=$(e.currentTarget).parent().find('input.VehicleId').val();
                        webserver.query(null, apipath.cars.singleCarVehicle.delete + id, methods.delete);
                    });
                });
                /*修改*/
                $("body").delegate(".vehicle-list .zt .btn-details", "click", function (e) {
                    var id=$(e.currentTarget).parent().find('input.VehicleId').val();
                    common.showPopbox(' ① 修改保养概要信息', $('#Vehicle_add'), function () {
                        webserver.query(null, apipath.cars.singleCarVehicle.single+id, methods.search, function (error, data, layerIndex) {

                            $('#maintenanceKM').val(data.mileage);
                            $('#nextMaintenanceKM').val(data.nmileage);
                            $('#nextVehicleTime').val(common.myDate.dateFormat(new Date(data.nmdate),'yyyy-MM-dd'));
                            $('#VehicleTime').val(common.myDate.dateFormat(new Date(data.mdate),'yyyy-MM-dd'));
                            $('#num').val(data.mnumber);
                            var html = '';
                            for (var j = 0; j < data.maintainsVoList.length; j++) {
                                html = html+'<li>' +
                                    '<div class="ItemsValue default clearfix">' +
                                    '<p class="fl">' + data.maintainsVoList[j].mparagrame + '</p>' +
                                    '<p class="fr">' + data.maintainsVoList[j].mfee + '元</p>' +
                                    '</div>' +
                                    '<span class="a-delete" >删除</span>' +
                                    '</li>';
                            }
                            $('#VehicleItem_add .xian-classes').html(html);
                            layer.close(layerIndex);
                        })

                    }, function (layerIndex1) {
                        common.showPopbox(' ② 修改保养项目信息', $('#VehicleItem_add'), function () {
                            layer.close(layerIndex1);
                        }, function (layerIndex2) {
                            layer.close(layerIndex2);
                            var params = {};
                            params.mileage= $('#maintenanceKM').val();
                            params.nmileage=$('#nextMaintenanceKM').val();
                            params.vmid=carId;
                            params.nmdate = new Date($('#nextVehicleTime').val());
                            params.mdate = new Date($('#VehicleTime').val());
                            params.mnumber = $('#num').val();

                            webserver.query(params, apipath.cars.singleCarVehicle.edit+id, methods.edit, function (error, data, layerIndex) {

                                var ItemArr = new Array();
                                $('#VehicleItem_add .xian-classes .ItemsValue').each(function () {
                                    var ItemValue = {
                                        "mfee": $(this).find('p.fr').text().replace('元', ''),
                                        "mparagrame": $(this).find('p.fl').text(),
                                        "vmtid": id
                                    };
                                    ItemArr.push(ItemValue);
                                });
                                webserver.query(ItemArr, apipath.cars.carsVehicleItem.add+"/"+id, methods.add);
                                // if(ItemArr.length>0) {
                                //     webserver.query(ItemArr, apipath.cars.carsVehicleItem.add+"/"+id, methods.add);
                                // }
                            });
                        });

                    });
                });
            },
            page_list: function (current_page, carId) {
                if(!carId){
                    carId = common.cookies.get('carId');
                }
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.singleCarVehicle_rows_count
                };
                //获取相关条件
                param.startdate = $('#startTime').val();
                param.enddate = $('#endTime').val();
                webserver.query(param, apipath.cars.singleCarVehicle.list + carId, methods.search, cars.singleCarVehicle.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<li>' +
                            '<div class="open-details ">' +
                            '<ul class="list-two">' +
                            '<li class="hys1">' +
                            '<p>保养第' + data.list[i].mnumber + '次</p>' +
                            common.myDate.dateFormat(new Date(data.list[i].mdate), 'yyyy年MM月dd日') +
                            '</li>' +
                            '<li class="rl">' +
                            data.list[i].mtfee + '元' +
                            '</li>' +
                            '<li class="ds">' +
                            '<a href="#">详情<i class="jt-t"></i></a>' +
                            '</li>' +
                            '<li class="zt">' +
                            '<input type="hidden" class="VehicleId" value="'+data.list[i].id+'" />' +
                            '<button class="btn-delete">删除</button> ' +
                            '<button class="btn-details">修改</button>' +
                            '</li>' +
                            '</ul>' +
                            '<div class="baoxian-details">' +
                            '<ul class="clearfix baoxian-txt">' +
                            '<li>保养项目：<br />';
                        for (var j = 0; j < data.list[i].maintainsVoList.length; j++) {
                            html = html + (j + 1) + '、' + data.list[i].maintainsVoList[j].mparagrame + ' —— ' + data.list[i].maintainsVoList[j].mfee + '元<br />';
                        }

                        html = html + '本次保养费用：' + data.list[i].mtfee + '元 ;</li>' +
                            '<li>' +
                            '保养日期：<br />' +
                            common.myDate.dateFormat(new Date(data.list[i].mdate), 'yyyy年MM月dd日') +
                            '</li>' +
                            '<li>' +
                            '到险日期：<br />' +
                            common.myDate.dateFormat(new Date(data.list[i].nmdate), 'yyyy年MM月dd日') +
                            '</li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>' +
                            '</li>';
                    }

                }//调用分页
                pagination.Initialization(data.total, pagination.singleCarVehicle_rows_count, data.pageNum, cars.singleCarVehicle.page_list);
                $('.vehicle-list').html(html);
                layer.close(layerIndex);
            }
        },
        carsVehicle: {
            Initialization: function () {
                /*初始化菜单*/
                common.menusInitialization();
                /*初始化列表*/
                cars.carsVehicle.page_list(1);
                /*点击更多跳转*/
                $("body").delegate(".baoxian-list .baoxian .san-more a", "click", function (e) {
                    common.cookies.set('carId', $(e.currentTarget).find('input.carsVehicleId').val());
                });
            },
            page_list: function (current_page) {
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.carsVehicle_rows_count
                };
                webserver.query(param, apipath.cars.carsVehicle.list, methods.search, cars.carsVehicle.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<ul class="baoxian">' +
                            '<li class="bh-txt">' +
                            '<p><span>' + data.list[i].num + '</span><br>' + data.list[i].plate + '<br>' + data.list[i].typev + '</p>' +
                            '</li>' +
                            '<li class="last-baoxian">' +
                            '<table>' +
                            '<tr>' +
                            '<th colspan="4">最近一次保养</th>' +
                            '</tr>' +
                            '<tr class="border">' +
                            '<td width="25%" rowspan="2">保养总费用<br>' + data.list[i].mtotalfee + '元</td>' +
                            '<td width="25%">保养时间</td>' +
                            '<td width="25%">保养费用</td>' +
                            '<td width="25%">下次保养时间</td>' +
                            '</tr>' +
                            '<tr class="b-r">' +
                            '<td>' + common.myDate.dateFormat(new Date(data.list[i].mdate), 'yyyy年MM月dd日') + '</td>' +
                            '<td>¥' + data.list[i].mtfee + '</td>' +
                            '<td>' + common.myDate.dateFormat(new Date(data.list[i].nmdate), 'yyyy年MM月dd日') + '</td>' +
                            '</tr>' +
                            '</table>' +
                            '</li>' +
                            '<li class="san-more">' +
                            '<a href="singleCarVehicle.html">' +
                            '<input type="hidden" class="carsVehicleId" value="'+data.list[i].id+'" />' +
                            '<p>更多保养<br />信息</p>' +
                            '<i class="icon-more"></i>' +
                            '</a>' +
                            '</li>' +
                            '</ul>';
                    }

                } //调用分页
                pagination.Initialization(data.total, pagination.carsVehicle_rows_count, data.pageNum, cars.carsVehicle.page_list);
                $('.baoxian-list').html(html);
                layer.close(layerIndex);
            }
        },
    }
})(jQuery);