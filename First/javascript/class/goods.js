/**
 * Created by Administrator on 2017/10/24 0024.
 */

(function () {
    goods = {
        goods: {
            Initialization: function () {
                /**初始化菜单**/
                common.menusInitialization();
                /**初始化列表**/
                goods.goods.page_list(1);
                //执行分类
                goods.goods.showTypes();

                goods.goods.showUser(1);
                /**查询事件**/
                $('.search').click(function () {
                    goods.goods.page_list(1);
                });

                //添加类型事件
                $('#typeAdd').click(function () {
                    common.showPopbox('新增物品分类', $('#types_add'), function () {
                    }, function (layerindex) {
                        if ($('.types-form').validationEngine('validate')) {
                            var param = {};
                            param.typeName = $('#types_add input[name="typename"]').val();
                            webserver.query(param, apipath.goods.types.add, methods.add);
                            layer.close(layerindex);
                        }
                    });
                });
                //删除类型
                $('#typeDel').click(function () {
                    var chk_value = []; //定义一个数组
                    $('#goods_type_list input[type="checkbox"]:checked').each(function () { //遍历每一个名字为interest的复选框，其中选中的执行函数

                        chk_value.push({
                            id: $(this).attr('class'),
                            name: $(this).attr('value')
                        });
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
                    common.showConfirm('请您确认以下信息：', '您将删除物品类型：' + namearr.join('、'), function () {
                    }, function () {
                        var param = {};
                        webserver.query(param, apipath.goods.types.del + idarr.join(','), methods.delete);
                    });
                });

                /**修改类型按钮**/
                $('#typeDetail').click(function () {
                    var chk_value = []; //定义一个数组
                    $('#goods_type_list input[type="checkbox"]:checked').each(function () { //遍历每一个名字为interest的复选框，其中选中的执行函数
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
                    common.showPopbox('修改物品类型', $('#types_add'), function () {
                        $('#typename').val(chk_value[0]["name"]);
                    }, function (layerindex) {
                        var param = {};
                        param.typeName = $('#typename').val();
                        if ($('.types-form').validationEngine('validate')) {
                            webserver.query(param, apipath.goods.types.det + chk_value[0]["id"], methods.edit);
                            layer.close(layerindex);
                        }
                    });

                });

                /**点击领取按钮*/
                $('.btns-cz .lingqu').click(function (e) {
                    common.showPopbox('领取办公用品', $('#goods-lingqu-pop'), function () {

                        $('.search_goods').click(function () { //按编号查找
                            if($('#mm').val()!="") {
                                goods.goods.show_goodsNo();
                            }else{
                                common.showTimeMsg('0','物品编号不能为空！');
                                return;
                            }
                        });
                        $('.search_goodsName').click(function () {  //按名称查找
                            goods.goods.show_goodsName();
                        });

                        goods.goods.deptTypeList(1);
                    }, function (layerindex) {     // 确定执行函数

                        //物品id,价格id,领取数量,领取人id,领取部门id,领取日期
                        // "deptId": 1,
                        //     "goodsId": 0,
                        //     "outDate": "2017-10-31T00:25:12.153Z",
                        //     "outId": 0,
                        //     "outNum": 5,
                        //     "priceId": 1
                        var param = {};
                        param.deptId = $('#deptId').val();
                        param.goodsId = $('#gLingqu_id').text();
                        param.outDate = $('#startTime').val();
                        //param.outId = $('#userList').val();
                        param.outNum = $('#aaa').val();
                        param.priceId = $("#wp").val();
                        param.outUser = $('#userList').val();
                        if ($('.goods_lingqu').validationEngine('validate')) {
                            webserver.query(param, apipath.goods.goodsReceive.list, methods.add);
                            layer.close(layerindex);
                        }
                    });
                });

                //点击入库按钮
                $('.btns-cz .ruku').click(function () {
                    common.showPopbox('入库办公用品', $('#goods-ruku-pop'), function () {
                        /**赋初始值*/
                        $('#goodsName').val('');
                        $('#goodsNo').val('');
                        $('#goodsPri').val('');
                        $('#date_goods').val('');
                        $('#goods_Num').val('');
                        $('#type_pop').val('');
                        $('#goods_user').val('');
                        // goods.goods.showUser(1);
                    }, function (layerindex) {
                        // var gNo = $('#goodsNo').val();
                        // var gName = $('#goodsName').val();
                        // var gType = $('#type_pop').val();
                        // var gPrice = $('#goodsPri').val();
                        // var gNum = $('#goods_Num').val();
                        // var gPerson = $('#goods_user').val();
                        // var gTime = $('#date_goods').val();
                        var param = {};
                        // "goodsName": "水桶","goodsNo": "123546789","goodsPrice": 100,"inDate": "2017-10-30T03:00:17.022Z",
                        // "inNum":"3","typeId": 2,"userName": "习近平"
                        param.goodsName = $('#goodsName').val();
                        param.goodsNo = $('#goodsNo').val();
                        param.goodsPrice = $('#goodsPri').val();
                        param.inDate = $('#date_goods').val();
                        param.inNum = $('#goods_Num').val();
                        param.typeId = $('#type_pop').val();
                        param.inUser = $('#goods_user').val();
                        if ($('.goods_ruku').validationEngine('validate')) {
                            webserver.query(param, apipath.goods.goods.add, methods.add);
                            layer.close(layerindex);
                        }
                    });
                })
                $("body").delegate(".btn-delete", "click", function (e) {   //删除
                    e = e || window.event;
                    //阻止冒泡和默认行为
                    e.stopPropagation();
                    e.preventDefault();

                    common.showConfirm('请您确认以下信息', '您将删除"' + $(e.currentTarget).parent().parent().find('td').eq(2).text() + '"的相关信息', function () {
                    }, function () {
                        var id = $(e.currentTarget).parent().parent().find('td').eq(0).attr('class');

                        webserver.query(null, apipath.goods.goods.del + id, methods.delete);
                    });
                });


                $("body").delegate(".btn-details", "click", function (e) {   //修改
                    e = e || window.event;
                    //阻止冒泡和默认行为
                    e.stopPropagation();
                    e.preventDefault();
                    var priceId = $(e.currentTarget).parent().prev().prev().prev().attr('class');
                    var id = $(e.currentTarget).parent().prev().prev().prev().prev().prev().prev().attr('class');
                    var details = $.Deferred();
                    goods.goods.showUserDetail(details, id, priceId);
                    $.when(details).done(function (v1) {
                        common.showPopbox('修改办公用品', $('#goods-pop'), function () {

                            $('#goods_name').val(v1.goodsName);
                            $('#No').val(v1.goodsNo);
                            $('#goodsType-pop-id').val(v1.typeId);
                            $('#pri').val(v1.goodsPrice);
                            $('#n').val(v1.goodsNum);

                        }, function (layerindex) {  //点击确定执行函数
                            if ($('.goods_detail').validationEngine('validate')) {
                                var param = {};
                                var gooId = $(e.currentTarget).parent().parent().find('td').eq(0).attr('class');
                                var priId = $(e.currentTarget).parent().parent().find('td').eq(3).attr('class');
                                // var gooId = $('#No').attr('class');
                                // var priId = $('#xxx').attr('class');

                                // param.goodsId = $('#No').attr('class');
                                // param.priceId = $('#pri').attr('class');
                                param.goodsName = $('#goods_name').val();
                                param.goodsNo = $('#No').val();
                                param.goodsNum = $('#n').val();
                                param.goodsPrice = $('#pri').val();
                                param.typeId = $("#goodsType-pop-id").val();

                                webserver.query(param, apipath.goods.goods.goodsPut + gooId + '/' + priId, methods.edit);
                                layer.close(layerindex);
                            }
                        })
                    });
                });

                var token = common.cookies.get("!@#2017hd_token");
                var userId = common.cookies.get("!@#2017hd_userId");
                /**主持人输入框变化的时候，清空隐藏域**/
                $('#hostName').bind('input propertychange', function () {
                    $('#hostNamehid').val('');
                    $('#priceIdhid').val('');
                });
                /**主持人自动补全插件使用**/
                $('#hostName').autocomplete({
                    serviceUrl: apipath.goods.goods.goodsName + '?userId=' + userId + '&token=' + token + '&page=1&rows=10',
                    type: 'GET',
                    dataType: 'json',
                    paramName: 'name',
                    zIndex: 20891021,//要超过19891020
                    onSelect: function (suggestion) {
                        $('#hostNamehid').val(suggestion.data);
                        // $('#priceIdhid').val(suggestion.priceId);
                        goods.goods.show_goodsName();
                    },
                    onHint: function (hint) {
                        $('#hostName-list').val(hint);
                    },
                    transformResult: function (response) {
                        return {
                            suggestions: $.map(response.data, function (dataItem) {console.log(dataItem)
                                var ff = '';
                                for(var i=0;i<dataItem.priceList.length;i++){
                                    ff += '<option value="'+dataItem.priceList[i].priceId+'">'+dataItem.priceList[i].goodsPrice+'</option>';
                                }
                                $('#wp').html(ff);
                                console.log(ff);
                                return {
                                    value: dataItem.goodsName,
                                    data: dataItem.goodsId,
                                    // priceId: dataItem.priceList

                                };
                            })
                        };
                    },
                    onInvalidateSelection: function () {
                    }
                });
            },
            showUserDetail: function (d, userId, priceId) {

                webserver.query({}, apipath.goods.goods.goodsPut + userId + '/' + priceId, methods.search, function (err, data, layerIndex) {
                    // console.log(data);
                    layer.close(layerIndex);
                    if (d) {
                        d.resolve(data);
                    }
                });
            },
            show_goods_no: function (d, goodsNo) {
                //按物品编号查找
                webserver.query({}, apipath.goods.goods.goodsPut + goodsNo, methods.search, function (error, data, layerIndex) {
                    layer.close(layerIndex);
                    if (d) {
                        d.resolve(data);
                    }
                });
            },
            show_goods_name: function (d, goodsId,priId) {
                webserver.query({}, apipath.goods.goods.goodsSearch + goodsId + '/' + priId, methods.search, function (err, data, layerIndex) {
                    layer.close(layerIndex);
                    if (d) {
                        d.resolve(data);
                    }
                });
            },
            show_goodsNo: function () {
                var id = $('#mm').val();
                var details = $.Deferred();
                goods.goods.show_goods_no(details, id);
                // var param = {};
                // param.goodsNo = $('.goods_No').val();
                // var aa = $('.goods_No').val();
                $.when(details).done(function (v1) {
                    //console.log(v1)
                    $('#aaa').val(v1.priceList[0].goodsNum);
                    $('#gLingqu_id').text(v1.goodsId);   //物品Id
                    $('#hostName').val(v1.goodsName);
                    $('#goodsFen').val(v1.typeId);
                    $('#good_price_Id').val(v1.priceList[0].goodsPrice);
                    //$('#moneyId').text(v1.priceList[0].priceId);

                    var ff = '';
                    for(var i=0;i<v1.priceList.length;i++){
                        ff += '<option value="'+v1.priceList[i].priceId+'">'+v1.priceList[i].goodsPrice+'</option>';
                    }
                    $('#wp').html(ff);
                })
            },
            show_goodsName: function () {
                var id = $('#hostNamehid').val();
                var pri = $('#wp').val();
                var details = $.Deferred();
                goods.goods.show_goods_name(details, id, pri);


                $.when(details).done(function (v1) {
                    // console.log(v1)
                    $('#aaa').val(v1.goodsNum);
                    $('#gLingqu_id').text(v1.goodsId);   //物品Id
                    $('#mm').val(v1.goodsNo);
                    $('#goodsFen').val(v1.typeId);
                    // $('#good_price_Id').val(v1.goodsPrice);
                    // $('#moneyId').text(v1.priceId);

                });

            },
            page_list: function (current_page) {
                //参数
                var param = {
                    page: current_page,
                    rows: pagination.goods_rows_count
                };
                param.typeId = $('#typeId').val();
                param.name = $('#goodsNum').val();
                webserver.query(param, apipath.goods.goods.list, methods.search, goods.goods.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '<tr>' +
                    '<th>编号</th>' +
                    '<th>分类</th>' +
                    '<th>名称</th>' +
                    '<th>单价</th>' +
                    '<th>数量</th>' +
                    '<th>合计</th>' +
                    '<th>操作</th>' +
                    '</tr>'
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html += '<tr>' +
                            '<td class="' + data.list[i].goodsId + '">' + data.list[i].goodsNo + '</td>' +
                            '<td>' + data.list[i].typeName + '</td>' +
                            '<td>' + data.list[i].goodsName + '</td>' +
                            '<td class="' + data.list[i].priceId + '">' + data.list[i].goodsPrice + '</td>' +
                            '<td>' + data.list[i].goodsNum + '</td>' +
                            '<td>' + (data.list[i].total).toFixed(2) + '元</td>' +
                            '<td>' +
                            '<button class="btn-delete">删除</button> ' +
                            '<button class="btn-details">修改</button>' +
                            '</td>' +
                            '</tr>'
                    }
                }
                //把拼接好的数据插入
                $('.table-data-list').html(html);
                layer.close(layerIndex);
                //调用分页
                pagination.Initialization(data.total, pagination.goods_rows_count, data.pageNum, goods.goods.page_list);
            },
            showTypes: function () {
                /** 获取分类 **/
                var param = {};
                webserver.query(param, apipath.goods.types.list, methods.search, function (error, data, layerIndex) {
                    var html = '<option value="">请选择</option>',
                        html1 = '<option value="">全部</option>',
                        goodsType = '';
                    for (var i = 0; i < data.length; i++) {
                        html = html + '<option value="' + data[i].typeId + '">' + data[i].typeName + '</option>';
                        html1 += '<option value="' + data[i].typeId + '">' + data[i].typeName + '</option>';
                        goodsType += '<input id="class+' + (i + 1) + '" value="' + data[i].typeName + '" type="checkbox" class="' + data[i].typeId + '"/>' + data[i].typeName
                    }
                    $('#goodsFen').html(html);
                    $('#typeId').html(html1);
                    $('#goodsType-pop-id').html(html);
                    $('#type_pop').html(html);
                    $('#goods_type_list').html(goodsType);
                    layer.close(layerIndex);
                });
            },
            popType: function () {
                var param = {};
                webserver.query(param, apipath.goods.types.list, methods.search, function (error, data, layerIndex) {
                    var html = '';
                    for (var i = 0; i < data.length; i++) {
                        html = html + '<option value="' + data[i].typeId + '">' + data[i].typeName + '</option>';
                    }
                    // $('#typeId').append(html);
                    $('#goodsType-pop-id').html(html);
                    // $('#type_pop').html(html);
                    // $('.typeId').html(html);
                    layer.close(layerIndex);
                });
            },
            showUser: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.goods_zichan_rows_count  //12
                };
                webserver.query(param, apipath.goods.goods_user.list, methods.search, function (error, data, layerIndex) {

                    var html = '';
                    for (var i = 0; i < data.list.length; i++) {
                        html += '<option value="' + data.list[i].userId + '">' + data.list[i].userName + '</option>';
                    }
                    $('#userList').html(html);
                    $('#goods_user').html(html);
                    layer.close(layerIndex);
                });
            },
            deptTypeList: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.goods_zichan_rows_count  //12
                };
                webserver.query(param, apipath.goods.dept.list, methods.search, function (error, data, layerIndex) {
                    var html = '';
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<option value="' + data.list[i].deptId + '">' + data.list[i].deptName + '</option>';
                    }
                    $('#deptId').html(html);
                    layer.close(layerIndex);
                });
            },
        },
        //    资产统计
        AssetStatistics: {
            Initialization: function () {
                /**初始化菜单**/
                common.menusInitialization();
                /**初始化列表**/
                goods.AssetStatistics.page_list(1);
                goods.AssetStatistics.assetTypeList();  //类型
                goods.AssetStatistics.deptTypeList(1);  //部门
                /**查询事件**/
                $('.search').click(function () {
                    goods.AssetStatistics.page_list(1);
                });
            },
            
            page_list: function (current_page) {
                //参数
                var param = {
                    page: current_page,
                    rows: pagination.goods_rows_count
                };
                //获取相关条件
                //按分类查找input里的value
                param.deptId = $('#deptId').val();       //物品id
                param.assetsTypeId = $('#typeId').val();  //类型id
                param.name = $('.inputContent').val();        //查询的value
                webserver.query(param, apipath.goods.AssetStatistics.list, methods.search, goods.AssetStatistics.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '<tr>' +
                    '<th width="10%">编号</th>' +
                    '<th width="10%">分类</th>' +
                    '<th width="15%">名称</th>' +
                    '<th width="10%">部门</th>' +
                    '<th width="10%">单价</th>' +
                    '<th width="10%">数量</th>' +
                    '<th width="20%">总计</th>' +
                    '</tr>';

                if (data.pageInfo.total && data.pageInfo.total > 0) {
                    for (var i = 0; i < data.pageInfo.list.length; i++) {
                        html += '<tr>' +
                            '<td>' + data.pageInfo.list[i].assetsNo + '</td>' +
                            '<td>' + data.pageInfo.list[i].assetsTypeName + '</td>' +
                            '<td>' + data.pageInfo.list[i].assetsName + '</td>' +
                            '<td>' + data.pageInfo.list[i].deptName + '</td>' +
                            '<td>' + data.pageInfo.list[i].assetsPrice + '元</td>' +
                            '<td>' + data.pageInfo.list[i].assetsNum + '</td>' +
                            '<td>' + (data.pageInfo.list[i].assetsPrice * data.pageInfo.list[i].assetsNum).toFixed(2) + '元</td>' +
                            '</tr>';
                    }
                }
                //把拼接好的数据插入
                $('.table-data-list').html(html);
                var priceAll = '总数：' + data.totalAssetsNum + ' 总价：' + data.totalMoney + '元';   //总数和总价的字符串
                $('.all-price').html(priceAll);
                //调用分页
                pagination.Initialization(data.pageInfo.total, pagination.goods_rows_count, data.pageInfo.pageNum, goods.AssetStatistics.page_list);

                layer.close(layerIndex);
            },
            assetTypeList: function () {   //获取分类下拉数据
                var param = {};
                webserver.query(param, apipath.goods.AssetStatistics.assetTypeList, methods.search, function (error, data, layerIndex) {

                    var html = '<option value="">全部</option>';
                    for (var i = 0; i < data.length; i++) {
                        html = html + '<option value="' + data[i].assetsTypeId + '">' + data[i].assetsTypeName + '</option>';
                    }
                    $('#typeId').html(html);
                    layer.close(layerIndex);
                });
            },
            // 获取部门列表
            deptTypeList: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.orderDetail_rows_count  
                };
                webserver.query(param, apipath.goods.dept.list, methods.search, function (error, data, layerIndex) {
                    var html = '<option value="">全部</option>';
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<option value="' + data.list[i].deptId + '">' + data.list[i].deptName + '</option>';
                    }
                    $('#deptId').html(html);
                    layer.close(layerIndex);
                });
            },
            deptList: function () {
                var param = {};

            }
        },
        //    资产管理
        assetGuanli: {
            Initialization: function () {
                /**初始化菜单**/
                common.menusInitialization();
                /**初始化列表**/
                goods.assetGuanli.condition_search_list(1);
                goods.assetGuanli.assetTypeList();
                goods.assetGuanli.showDept(1);

                /**查询事件**/
                $('.search').click(function () {
                    goods.assetGuanli.condition_search_list(1);
                });

                //添加类型事件
                $('#typeAdd').click(function () {
                    common.showPopbox('添加固定资产类型', $('#types_add'), function () {
                    }, function (layerindex) {
                        if ($('.types-form').validationEngine('validate')) {
                            var param = {};
                            param.assetsTypeName = $('#typename').val();
                            // param.assetsTypeStatus = 0;
                            webserver.query(param, apipath.goods.AssetStatistics.asset_type_add, methods.add);
                            layer.close(layerindex);
                        }
                    });
                });
                /**修改类型按钮**/
                $('#typeDetail').click(function () {
                    var chk_value = [];
                    $('#asset_type_list input[type="checkbox"]:checked').each(function () {
                        chk_value.push({
                            id: $(this).attr('class'),
                            name: $(this).attr('value')
                        });
                    });
                    if (chk_value.length !== 1) {
                        layer.msg('请您选择一项进行修改', {
                            icon: 0
                        });
                        return;
                    }
                    common.showPopbox('修改资产分类', $('#types_add'), function () {
                        $('#typename').val(chk_value[0]["name"]);
                    }, function (layerindex) {
                        if ($('.types-form').validationEngine('validate')) {
                            var param = {};
                            param.assetsTypeName = $('#typename').val();
                            webserver.query(param, apipath.goods.AssetStatistics.asset_type_detail + chk_value[0]["id"], methods.edit);
                            layer.close(layerindex);
                        }
                    });
                });

                //删除类型
                $('#typeDel').click(function () {
                    var chk_value = [];
                    $('#asset_type_list input[type="checkbox"]:checked').each(function () {
                        chk_value.push({
                            id: $(this).attr('class'),
                            name: $(this).attr('value')
                        });
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
                    common.showConfirm('请您确认以下信息：', '您将删除资产类型：' + namearr.join('、'), function () {
                    }, function () {
                        var param = {};
                        webserver.query(param, apipath.goods.AssetStatistics.asset_type_del + idarr.join(','), methods.delete);
                    });
                });

                /**点击新增资产按钮*/
                $('.add-zc-btn .btn').click(function () {
                    /**使用jquery的延时处理方法，每个ajax请求完成后，
                     *把对应的Deferred置为完成状态，然后用jquery判断全部完成后再进行后续处理
                     */
                    common.showPopbox('新增固定资产', $('#add-zc'), function () {
                        /**赋初始值*/
                        $('#goodsId').val('');
                        $('#type').val('');
                        $('#dept').val('');
                        $('#name').val('');
                        $('#weizhi').val('');
                        $('#number').val('');
                        $('#price').val('');
                    }, function (layerindex) {  //点击确定时执行的函数
                        if ($('#assetGuan_form').validationEngine('validate')) {
                            var param = {};
                            param.assetsNo = $('#goodsId').val();
                            param.assetsTypeId = $('#type_id').val();
                            param.deptId = $('#dept').val();
                            param.assetsName = $('#name').val();
                            param.assetsLoc = $('#weizhi').val();
                            param.assetsNum = $('#number').val();
                            param.assetsPrice = $('#price').val();
                            webserver.query(param, apipath.goods.assetGuanli.add, methods.add);
                            layer.close(layerindex);
                        }
                    });
                });
                $("body").delegate(".btn-delete", "click", function (e) {   //删除
                    e = e || window.event;
                    //阻止冒泡和默认行为
                    e.stopPropagation();
                    e.preventDefault();
                    common.showConfirm('您确定要删除吗？', '您将删除"' + $(e.currentTarget).parent().prev().prev().prev().prev().text() + '"的相关信息', function () {

                    }, function (layerindex) {  //点击确定执行函数
                        var delId = $(e.currentTarget).parent().prev().prev().prev().prev().prev().prev().attr('class');

                        webserver.query(null, apipath.goods.assetGuanli.delete + delId, methods.delete);
                        layer.close(layerindex);
                    })
                });
                $("body").delegate(".gai", "click", function (e) {  //修改
                    e = e || window.event;
                    //阻止冒泡和默认行为
                    e.stopPropagation();
                    e.preventDefault();
                    var id = $(e.currentTarget).parent().siblings('td').eq(0).attr('class');
                    // var id = $(e.currentTarget).parent().prev().prev().prev().prev().prev().prev().attr('class');
                    var details = $.Deferred();
                    goods.assetGuanli.showUserDetail(details, id);

                    $.when(details).done(function (v1) {
                        common.showPopbox('固定资产修改', $('#det-zc'), function () {
                            //往弹窗里赋值
                            $('#good_no').val(v1.assetsNo);
                            $('#type1').val(v1.assetsTypeId);
                            $('#dept1').val(v1.deptId);
                            $('#assName').val(v1.assetsName);
                            $('#assPrice').val(v1.assetsPrice);
                            $('#assWeizhi').val(v1.assetsLoc);
                            $('#assNumber').val(v1.assetsNum);

                        }, function (layerindex) {  //点击确定执行函数
                            if ($('.assetsDetail').validationEngine('validate')) {
                                var param = {};
                                param.assetsNo = $('#good_no').val();
                                param.assetsTypeId = $("#type1 option:selected").val();
                                param.deptId = $("#dept1 option:selected").val();
                                param.assetsName = $('#assName').val();
                                param.assetsLoc = $('#assWeizhi').val();
                                param.assetsNum = $('#assNumber').val();
                                param.assetsPrice = $('#assPrice').val();
                                //修改的时候因为是按资产的id查找的，所以提交还是这个id，不用重复获取id了
                                webserver.query(param, apipath.goods.assetGuanli.put + id, methods.edit);
                                layer.close(layerindex);
                            }
                        })
                    });
                });

                $("body").delegate(".fei", "click", function (e) {  //报废
                    //阻止冒泡和默认行为
                    e.stopPropagation();
                    e.preventDefault();
                    var id = $(e.currentTarget).parent().siblings('td').eq(0).attr('class');
                    var details = $.Deferred();
                    goods.assetGuanli.assets_baofei(details, id);
                    $.when(details).done(function (v1) {
                        common.showPopbox('固定资产报废', $('#goodsBF'), function (current_page) {

                            $('#goo_No').text(v1.assetsNo);
                            $('#asset_id').text(v1.assetsId);  //资产id
                            $('#goods_name').text(v1.userName);
                            $('#asset_usid').text(v1.userId); //用户id
                            $('#goods_type_id').text(v1.assetsTypeName);
                            $('#good_det_dept').text(v1.deptName);
                            $('#asset_deId').text(v1.deptId);   //部门id
                            $('#names').text(v1.assetsName);
                            $('#position').text(v1.assetsLoc);
                            $('#num').val(v1.assetsNum);

                                goods.assetGuanli.userList(1);
                        }, function (layerindex) {  //点击确定执行函数
                            // "assetsId": 12,
                            //     "deptId": 5,
                            //     "scrapDate": "2017-11-01T13:41:03.573Z",
                            //     "scrapNum": 5,
                            //     "scrapReason": "过期",
                            //     "userId": 0,
                            //     "checkUsers":[3,4,5]
                            var userCheck = new Array();
                            if($('#a').val() == '' && $('#b').val() == '' && $('#c').val() == ''){
                                userCheck.push(0);
                            }else {
                                var selectArr = document.getElementsByClassName('user_Id2')
                                for(var i=0;i<selectArr.length;i++){
                                    if (selectArr[i].value == ''){

                                    }else{
                                        userCheck.push(parseInt(selectArr[i].value))
                                    }
                                }
                            }

                            var param = {};
                            param.assetsId = $('#asset_id').text();
                            param.userId = $('#asset_usid').text();  //申报人
                            param.deptId = $('#asset_deId').text();       //申报部门
                            param.scrapDate = $('#startTime').val();   //时间
                            param.scrapNum = $('#num').val();   //数量
                            param.scrapReason = $('#reason').val();   //报废理由
                            param.checkUsers = userCheck; //[$('#user_Id1').val(), $('.user_Id2').val(), $('.user_Id3').val()];   //审核人
                            if ($('.assetBF').validationEngine('validate')) {
                                webserver.query(param, apipath.goods.Scrap.add, methods.add);
                                layer.close(layerindex);
                            }
                        });
                    });    
                });

            },
            assets_baofei: function (d, assetId) {   //报废的
                var param = {};
                webserver.query(param, apipath.goods.Scrap.list + assetId, methods.search, function (err, data, layerIndex) {

                    layer.close(layerIndex);
                    if (d) {
                        d.resolve(data);
                    }
                });
            },
            showUserDetail: function (d, userId) {   //修改
                webserver.query({}, apipath.goods.assetGuanli.put + userId, methods.search, function (err, data, layerIndex) {
                    layer.close(layerIndex);
                    if (d) {
                        d.resolve(data);
                    }
                });
            },
            userList: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.goods_rows_count
                };
                webserver.query(param, apipath.goods.goods_user.list, methods.search, function (err, data, layerIndex) {
                    var html = '<option value="">请选择</option>'
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<option value="' + data.list[i].userId + '">' + data.list[i].userName + '</option>';
                    }

                    $('.user_Id2').html(html);


                    layer.close(layerIndex);
                });
            },
            condition_search_list: function (current_page) {    // 查询执行函数
                var param = {
                    page: current_page,
                    rows: pagination.goods_rows_count
                };
                param.assetsTypeId = $('#typeId').val();
                param.deptId = $('#deptId').val();
                param.name = $('#search-value').val();
                webserver.query(param, apipath.goods.assetGuanli.list, methods.search, goods.assetGuanli.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '<tr>' +
                    '<th width="10%">编号</th>' +
                    '<th width="15%">名称</th>' +
                    '<th width="10%">部门</th>' +
                    '<th width="10%">分类</th>' +
                    '<th width="10%">价格（元）</th>' +
                    '<th width="10%">数量</th>' +
                    '<th width="15%">位置</th>' +
                    '<th width="20%">操作</th>' +
                    '</tr>';
                if (data.total && data.total > 0) {
                    for (var i = 0; i < data.list.length; i++) {
                        html += '<tr>' +
                            '<td class="' + data.list[i].assetsId + '" >' + data.list[i].assetsNo + '</td>' +
                            '<td class="assetsName">' + data.list[i].assetsName + '</td>' +
                            '<td class="deptName">' + data.list[i].deptName + '</td>' +
                            '<td class="assetsName">' + data.list[i].assetsTypeName + '</td>' +
                            '<td class="assetsTypeName">' + data.list[i].assetsPrice + '</td>' +
                            '<td class="assetsNum">' + data.list[i].assetsNum + '</td>' +
                            '<td class="assetsLoc">' + data.list[i].assetsLoc + '</td>' +
                            ' <td>' +
                            '<button class="btn-delete">删除</button> ' +
                            '<button class="btn-details gai">修改</button> ' +
                            '<button class="btn-details fei">报废</button> ' +
                            '</td>' +
                            '</tr>'
                    }
                }
                //把拼接好的数据插入
                $('.table-data-list').html(html);

                layer.close(layerIndex);
                //调用分页
                pagination.Initialization(data.total, pagination.goods_rows_count, data.pageNum, goods.assetGuanli.condition_search_list);
            },
            assetTypeList: function () {   //获取分类下拉数据
                var param = {};
                webserver.query(param, apipath.goods.AssetStatistics.assetTypeList, methods.search, function (error, data, layerIndex) {

                    var html = '<option value="">请选择</option>',
                        html1 = '',
                        html2 = '<option value="">全部</option>';
                    for (var i = 0; i < data.length; i++) {
                        html = html + '<option value="' + data[i].assetsTypeId + '">' + data[i].assetsTypeName + '</option>';
                        html1 += '<input id="class1" class="' + data[i].assetsTypeId + '" value="' + data[i].assetsTypeName + '" type="checkbox" />' + data[i].assetsTypeName
                        html2 += '<option value="' + data[i].assetsTypeId + '">' + data[i].assetsTypeName + '</option>';
                    }
                    $('#typeId').html(html2);      //插入到主页面的类型下拉列表
                    $('#type_id').html(html);         //插入到弹框页面里的类型下拉列表

                    $('#type1').html(html);
                    $('#asset_type_list').html(html1);

                    layer.close(layerIndex);
                });
            },
            showDept: function (current_page) {   //部门列表
                var param = {
                    page: current_page,
                    rows: pagination.orderDetail_rows_count  //12条信息  默认显示12条信息，
                };
                webserver.query(param, apipath.goods.dept.list, methods.search, function (err, data, layerIndex) {
                    var html = '<option value="">请选择</option>',
                        html1 = '<option value="">全部</option>';
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<option value="' + data.list[i].deptId + '">' + data.list[i].deptName + '</option>';
                        html1 = html1 + '<option value="' + data.list[i].deptId + '">' + data.list[i].deptName + '</option>';
                    }
                    $('#deptId').html(html1);   //插入到主页面的部门下拉列表

                    $('#dept').html(html);
                    $('#dept1').html(html);
                    layer.close(layerIndex);
                });
            },
        },
        //    物品领取
        goodsReceive: {
            Initialization: function () {
                /**初始化菜单**/
                common.menusInitialization();
                /**初始化列表**/
                goods.goodsReceive.search_list(1);
                //执行分类
                goods.goodsReceive.showTypes();
                //执行部门查找
                goods.goodsReceive.showDept(1);
                //部门物品使用情况展示图
                goods.goodsReceive.deptList(1);
                /**查询事件**/
                $('.search').click(function () {
                    goods.goodsReceive.search_list(1);
                });
            },
            search_list: function (current_page) {
                //参数
                var param = {
                    page: current_page,
                    rows: pagination.goods_lingqu_rows_count
                };
                param.date = $('#startTime').val();   //为考虑时间
                param.typeId = $('#typeId').val();
                param.deptId = $('#deptId').val();
                param.name = $('#name').val();
                webserver.query(param, apipath.goods.goodsReceive.list, methods.search, goods.goodsReceive.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '<tr>' +
                    '<th width="7%">编号</th>' +
                    '<th width="10%">分类</th>' +
                    '<th width="10%">名称</th>' +
                    '<th width="15%">单价</th>' +
                    '<th width="7%">数量</th>' +
                    '<th width="10%">领取部门</th>' +
                    '<th width="10%">领取人</th>' +
                    '<th width="15%">采购时间</th>' +
                    '<th>总计</th>' +
                    '</tr>';

                if (data.pageInfo.total && data.pageInfo.total > 0) {
                    for (var i = 0; i < data.pageInfo.list.length; i++) {
                        html += '<tr>' +
                            '<td>' + data.pageInfo.list[i].goodsNo + '</td>' +
                            '<td>' + data.pageInfo.list[i].typeName + '</td>' +
                            '<td>' + data.pageInfo.list[i].goodsName + '</td>' +
                            '<td>' + data.pageInfo.list[i].goodsPrice + '</td>' +
                            '<td>' + data.pageInfo.list[i].outNum + '</td>' +
                            '<td>' + data.pageInfo.list[i].deptName + '</td>' +
                            '<td>' + data.pageInfo.list[i].userName + '</td>' +
                            '<td>' + common.myDate.dateFormat(data.pageInfo.list[i].outDate, 'yyyy-MM-dd') + '</td>' +
                            '<td>' + data.pageInfo.list[i].total + '元</td>' +
                            '</tr>';
                    }
                }
                //把拼接好的数据插入
                $('.table-data-list').html(html);
                var priceAll = '总数：' + data.totalOutNum + ' 总价：' + data.totalOutMoney + '元';
                $('.all-price').html(priceAll);
                //调用分页
                pagination.Initialization(data.pageInfo.total, pagination.goods_lingqu_rows_count, data.pageInfo.pageNum, goods.goodsReceive.search_list);
                layer.close(layerIndex);
            },
            showDept: function (current_page) {   //部门列表下拉
                var param = {
                    page: current_page,
                    rows: pagination.orderDetail_rows_count  //12条信息  默认显示12条信息，
                };
                webserver.query(param, apipath.goods.dept.list, methods.search, function (err, data, layerIndex) {
                    var html = '<option value="">请选择</option>';
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<option value="' + data.list[i].deptId + '">' + data.list[i].deptName + '</option>';
                    }
                    $('#deptId').html(html);

                    layer.close(layerIndex);
                });
            },
            showTypes: function () {   //分类列表
                var param = {};
                webserver.query(param, apipath.goods.types.list, methods.search, function (err, data, layerIndex) {
                    var html = '<option value="">请选择</option>';
                    for (var i = 0; i < data.length; i++) {
                        html = html + '<option value="' + data[i].typeId + '">' + data[i].typeName + '</option>';
                    }
                    $('#typeId').html(html);

                    layer.close(layerIndex);
                });
            },
            deptList: function (current_page) {    //部门使用总价柱状图
                var param = {
                    page: current_page,
                    rows: pagination.deptDropList_rows_count  //  这里要设置成无限大，就能返回部门所有的总价
                };
                webserver.query(param, apipath.goods.goodsReceive.list, methods.search, function (err, data, layerIndex) {
                    var htmlStr = '';
                    if (data.list && data.list.length > 0) {
                        for (var i = 0; i < data.list.length; i++) {
                            var j = common.RandomNum(1, 7);
                            htmlStr += '<div class="z1">' +
                                '<div>' +                                         // ‘注意’这里用的部门总价
                                '<i class="color-' + j + '"  style="height:' + parseFloat((data.totalOutMoney) === 0 ? 0 : (parseFloat(data.list[i].totalMoney) / parseFloat(data.totalOutMoney) * 100).toFixed(2)) + '%"></i>' +
                                '</div>' +
                                '<p>' + data.list[i].deptName + '</p>' +
                                '</div>';
                        }
                    }
                    $('.deptList').html(htmlStr);
                    layer.close(layerIndex);
                });
            }
        },
        //    物品入库
        goodsStorage: {
            Initialization: function () {
                /**初始化菜单**/
                common.menusInitialization();
                /**初始化列表**/
                goods.goodsStorage.searchList(1);
                //执行分类
                goods.goodsStorage.showTypes();
                //部门列表
                goods.goodsStorage.showDept(1);
                /**查询事件**/
                $('.search').click(function () {
                    goods.goodsStorage.searchList(1);
                });
            },
            searchList: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.goods_rows_count
                };
                param.name = $('#name').val();
                param.typeId = $('#typeId').val();
                param.date = $('#startTime').val();   //获取时间
                webserver.query(param, apipath.goods.goodsStorage.list, methods.search, goods.goodsStorage.callback_search);
            },
            callback_search: function (err, data, layerIndex) {
                var html = '<tr>' +
                    '<th width="10%">编号</th>' +
                    '  <th width="10%">分类</th>' +
                    ' <th width="15%">名称</th>' +
                    '<th width="10%">采购人</th>' +
                    '<th width="10%">采购时间</th>' +
                    '<th width="10%">单价</th>' +
                    '<th width="10%">数量</th>' +
                    '<th width="20%">总计</th>' +
                    '</tr>'

                if (data.pageInfo.total && data.pageInfo.total > 0) {
                    for (var i = 0; i < data.pageInfo.list.length; i++) {
                        html = html +
                            '<tr>' +
                            '<td>' + data.pageInfo.list[i].goodsNo + '</td>' +
                            '<td>' + data.pageInfo.list[i].typeName + '</td>' +
                            '<td>' + data.pageInfo.list[i].goodsName + '</td>' +
                            '<td>' + data.pageInfo.list[i].userName + '</td>' +
                            '<td>' + common.myDate.dateFormat(data.pageInfo.list[i].inDate, 'yyyy-MM-dd') + '</td>' +
                            '<td>' + data.pageInfo.list[i].goodsPrice + '</td>' +
                            '<td>' + data.pageInfo.list[i].inNum + '</td>' +
                            '<td>' + data.pageInfo.list[i].total.toFixed(2) + '元</td>' +
                            '</tr>'

                    };
                }

                //把拼接好的数据插入
                $('.table-data-list').html(html);
                var htmlPri = '总数：' + data.totalInNum + ' 总价：' + data.totalInMoney.toFixed(2) + '元';
                $('.all-price').html(htmlPri);

                layer.close(layerIndex);
                //调用分页
                pagination.Initialization(data.pageInfo.total, pagination.goods_rows_count, data.pageInfo.pageNum, goods.goodsStorage.searchList);
            },
            showTypes: function () {   //分类列表
                var param = {};
                webserver.query(param, apipath.goods.types.list, methods.search, function (err, data, layerIndex) {
                    var html = '<option value="">请选择</option>';
                    for (var i = 0; i < data.length; i++) {
                        html = html + '<option value="' + data[i].typeId + '">' + data[i].typeName + '</option>';
                    }
                    $('#typeId').html(html);

                    layer.close(layerIndex);
                });
            },
            showDept: function (current_page) {   //部门列表
                var param = {
                    page: current_page,
                    rows: pagination.orderDetail_rows_count  //12条信息  默认显示12条信息，
                };
                webserver.query(param, apipath.goods.dept.list, methods.search, function (err, data, layerIndex) {
                    var html = '';
                    for (var i = 0; i < data.list.length; i++) {
                        html = html + '<option value="' + data.list[i].deptId + '">' + data.list[i].deptName + '</option>';
                    }
                    $('#deptId').html(html);
                    layer.close(layerIndex);
                });
            },
        }
    }

})(jQuery);
