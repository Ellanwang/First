/**
 * Created by Administrator on 2017/11/2 0002.
 */


(function () {
    admin = {
        department: {
            Initialization: function () {
                /**初始化菜单**/
                common.menusInitialization();
                /**初始化列表**/
                admin.department.page_list(1);
                //新增部门
                $('#addDept').click(function () {

                    common.showPopbox('新增部门', $('#add_dept_pop'), function () {
                        $('#dept_name').val('');
                    }, function (layerindex) {  //点击确定时执行的函数
                        var deptName = $('#dept_name').val();
                        if($('.types-form').validationEngine('validate')) {
                            var param = {};
                            param.deptName = $('#dept_name').val();
                            webserver.query(param, apipath.admin.department.add, methods.add,function(err,data,layerIndex2){
                                layer.close(layerIndex2);
                                common.showTimeMsg(0,data);
                                return;
                            });
                            //layer.close(layerindex);
                        }
                    });
                });
                
                //删除
                $("body").delegate(".btn-delete", "click", function (e) {   //删除
                    e = e || window.event;
                    //阻止冒泡和默认行为
                    e.stopPropagation();
                    e.preventDefault();
                    common.showConfirm('请您确认以下信息', '您将删除"' + $(e.currentTarget).parent().prev().text() + '"的相关信息', function () {
                    }, function () {
                        var id = $(e.currentTarget).parent().prev().attr('class');
                        webserver.query(null, apipath.admin.department.del + id, methods.delete);
                    });
                });

                $("body").delegate(".btn-details", "click", function (e) {   //修改
                    e = e || window.event;
                    //阻止冒泡和默认行为
                    e.stopPropagation();
                    e.preventDefault();
                    common.showPopbox('修改部门信息', $('#change_dept_pop'), function () {
                        var param = {};
                        var id = $(e.currentTarget).parent().prev().attr('class');

                        webserver.query(param, apipath.admin.department.put + id, methods.search, function (error, data, layerIndex) {

                            var html = '<tr>' +
                                '<td width="18%">部门名称：</td>' +
                                '<td><input id="change_dept_name" value="' + data.deptName + '" class="validate[required, maxSize[10]]"/></td>' +
                                '</tr>';

                            $('#dept_detail').html(html);
                            layer.close(layerIndex);
                        });
                    }, function (layerindex) {  //点击确定时执行的函数
                        var deptName = $('#change_dept_name').val();
                        if($('.depts-form').validationEngine('validate')) {
                            var param = {};
                            var id = $(e.currentTarget).parent().prev().attr('class');
                            param.deptName = $('#change_dept_name').val();
                            //param.deptId = $(e.currentTarget).parent().prev().attr('class');
                            //param.deptStatus = 0;
                            webserver.query(param, apipath.admin.department.put + id, methods.edit);
                            layer.close(layerindex);
                        }
                    });
                });

            },
            check: function (deptName) {
                //判断是否由汉字组成 3~10个汉字
                var reg = /^[\u2E80-\u9FFF]{3,10}$/;
                if (reg.test(deptName)) {
                    return true;
                }
                return false;
            },
            page_list: function (current_page) {
                var param = {
                    page: current_page,
                    rows: pagination.goods_zichan_rows_count  //12
                };
                webserver.query(param, apipath.goods.dept.list, methods.search, function (error, data, layerIndex) {
                    var html = '<tr><th width="10%">部门ID</th><th width="10%">部门名称</th><th width="10%">操作</th></tr>';
                    if (data.total && data.total > 0) {
                        for (var i = 0; i < data.list.length; i++) {
                            html += '<tr>' +
                                '<td >' + data.list[i].deptId + '</td>' +    
                                '<td class="' + data.list[i].deptId + '">' + data.list[i].deptName + '</td>' +
                                '<td>'+
                                '<button class="btn-delete" >删除</button>  '+
                                '<button class="btn-details">修改</button>'+
                                '</td>'+
                                '</tr>';
                        }
                    }
                    $('#bumen').html(html);
                    layer.close(layerIndex);
                    //调用分页
                    pagination.Initialization(data.total, pagination.goods_zichan_rows_count, data.pageNum, admin.department.page_list);
                });
            },
        },
        //角色管理
        role: {
            Initialization: function () {
                /**初始化菜单**/
                common.menusInitialization();
                /**初始化列表**/
                admin.role.page_list(1);
                // admin.role.shouMenusList();
                //新增角色点击按钮
                $('.role').click(function () {
                    common.showPopbox('新增角色信息', $('#SystemRole'), function () {
                        webserver.query({}, apipath.admin.role.menus, methods.search, function (err, data, layerIndex) {
                            layer.close(layerIndex);
                            var parentM=new Array();
                            var childM=new Array();
                            for (var j = 0; j < data.length; j++) {
                                if(data[j].pmenucode==0){
                                    parentM.push(data[j])
                                }else{
                                    childM.push(data[j]);
                                }
                            }
                            var menuhtml='<tr><td style="width: 20%;">角色名称：</td><td>' +
                                '<input type="text" placeholder="请输入角色名称" maxlength="10" class="validate[required]" id="roleDesc" /></td></tr>' +
                                '<tr><td class="checkbox" colspan="2">';
                            for (var j = 0; j < parentM.length; j++) {
                                if(j!=0) {
                                    menuhtml = menuhtml.substring(0, menuhtml.length - 37);
                                }
                                menuhtml = menuhtml +
                                    '<p class="pmenu"><input id="m'+parentM[j].menucode+'" class="parentMenu" value="'+parentM[j].menucode+'" type="checkbox">' +
                                    '<label for="m'+parentM[j].menucode+'"><b>'+parentM[j].menudesc+'</b></label></p>';
                                var childhtml='';
                                for(var x=0;x<childM.length;x++){
                                    if(childM[x].pmenucode==parentM[j].menucode) {
                                        childhtml = childhtml +
                                            '<span class="childMenu"><input id="m'+childM[x].menucode+'" class="m'+parentM[j].menucode+'" value="'+childM[x].menucode+'" type="checkbox">' +
                                            '<label for="m'+childM[x].menucode+'">'+childM[x].menudesc+'</label></span>' +
                                            '<span class="lightGrey pd10">|</span>';
                                    }
                                }
                                menuhtml = menuhtml +childhtml;
                            }
                            menuhtml=menuhtml.substring(0,menuhtml.length-37)+'</td></tr>';
                            $('#SystemRole table.singleRole').html(menuhtml);
                        });
                    }, function (layerindex) {  //点击确定时执行的函数
                        var allmenus=new Array();
                        var checkbox=$('.checkbox').find('input[type="checkbox"]:checked');
                        for(var i=0;i<checkbox.length;i++)
                        {
                            var menu={};
                            menu.menucode=checkbox[i].value;
                            allmenus.push(menu);
                        }
                        if($('.role_form').validationEngine('validate')) {
                            if (allmenus.length > 0) {
                                var param = {
                                    "menucodes": JSON.stringify(allmenus).replace(/"/g, '\''),
                                    "rolesdesc": $('#roleDesc').val(),
                                    "state": 0
                                };
                                webserver.query(param, apipath.admin.role.add, methods.add);
                                layer.close(layerindex);
                            } else {
                                common.showTimeMsg(0, '请至少选择一个权限！');
                                return;
                            }
                        }
                    });
                });

                /*全选按钮*/
                $("body").delegate("#SystemRole table.singleRole .parentMenu", "click", function (e) {
                    $('.'+$(e.currentTarget).attr('id')).each(function() {
                        $(this).attr('checked', !!$(e.currentTarget).attr('checked'));
                    });
                });
                /*子按钮*/
                $("body").delegate('#SystemRole table.singleRole .childMenu input[type="checkbox"]', "click", function (e) {
                    var allcheck=false;
                    $('input.'+$(e.currentTarget).attr('class')).each(function (index, domEle) {
                        if(!!$(domEle).attr('checked'))
                            allcheck=true;
                    });
                    if(!allcheck){
                        $('#'+$(e.currentTarget).attr('class')).attr('checked',false);
                    }else{
                        $('#'+$(e.currentTarget).attr('class')).attr('checked',true);
                    }
                });

                //删除
                $("body").delegate("button.btn-delete.del", "click", function (e) {   //删除
                    common.showConfirm('请您确认以下信息', '您将删除"' + $(e.currentTarget).parent().prev().prev().text() + '"的相关信息', function () {
                    }, function () {
                        var e_rolecode= $(e.currentTarget).parent().find('.roleCode').val();
                        webserver.query(null, apipath.admin.role.del + e_rolecode, methods.delete);
                    });
                });
                /*修改角色信息*/
                $("body").delegate("button.btn-details.det", "click", function (e) {   //修改角色
                    var e_rolecode= $(e.currentTarget).parent().find('.roleCode').val();
                    common.showPopbox('修改角色信息', $('#SystemRole'), function () {
                        webserver.query({}, apipath.admin.role.menus, methods.search, function (err, data, layerIndex) {
                            layer.close(layerIndex);
                            var parentM=new Array();
                            var childM=new Array();
                            for (var j = 0; j < data.length; j++) {
                                if(data[j].pmenucode==0){
                                    parentM.push(data[j])
                                }else{
                                    childM.push(data[j]);
                                }
                            }
                            var menuhtml='<tr><td style="width: 20%;">角色名程：</td><td>' +
                                '<input type="text" placeholder="角色名称" class="validate[required]" value="'+$(e.currentTarget).parent().parent().find('td').eq(0).html()+'" maxlength="10" id="roleDesc" class="validate[required]"/></td></tr>' +
                                '<tr><td class="checkbox" colspan="2">';
                            for (var j = 0; j < parentM.length; j++) {
                                if(j!=0) {
                                    menuhtml = menuhtml.substring(0, menuhtml.length - 37);
                                }
                                menuhtml = menuhtml +
                                    '<p class="pmenu"><input id="m'+parentM[j].menucode+'" class="parentMenu" value="'+parentM[j].menucode+'" type="checkbox">' +
                                    '<label for="m'+parentM[j].menucode+'"><b>'+parentM[j].menudesc+'</b></label></p>';
                                var childhtml='';
                                for(var x=0;x<childM.length;x++){
                                    if(childM[x].pmenucode==parentM[j].menucode) {
                                        childhtml = childhtml +
                                            '<span class="childMenu"><input id="m'+childM[x].menucode+'" class="m'+parentM[j].menucode+'" value="'+childM[x].menucode+'" type="checkbox">' +
                                            '<label for="m'+childM[x].menucode+'">'+childM[x].menudesc+'</label></span>' +
                                            '<span class="lightGrey pd10">|</span>';
                                    }
                                }
                                menuhtml = menuhtml +childhtml;
                            }
                            menuhtml=menuhtml.substring(0,menuhtml.length-37)+'</td></tr>';
                            $('#SystemRole table.singleRole').html(menuhtml);
                            var param = {
                                pageNum: 1,
                                pageSize: 1000,
                                rolecode : e_rolecode
                            };
                            webserver.query(param, apipath.admin.role.list, methods.search, function (err, data, layerIndex1) {
                                data=data.list[0].menusList;
                                for(var i=0;i<data.length;i++)
                                {
                                    $('#m'+data[i].menucode).attr("checked",'checked');
                                }
                                layer.close(layerIndex1);
                            });
                        });
                    }, function (layerindex) {  //点击确定时执行的函数
                        var allmenus=new Array();
                        var checkbox=$('.checkbox').find('input[type="checkbox"]:checked');
                        for(var i=0;i<checkbox.length;i++)
                        {
                            var menu={};
                            menu.menucode=checkbox[i].value;
                            allmenus.push(menu);
                        }
                        if($('.role_form').validationEngine('validate')) {
                            if(allmenus.length>0) {
                                var param = {
                                    "menucodes": JSON.stringify(allmenus).replace(/"/g, '\''),
                                    "rolecode": e_rolecode,
                                    "rolesdesc": $('#roleDesc').val(),
                                    "rolesid": e_rolecode
                                };
                                webserver.query(param, apipath.admin.role.put + e_rolecode, methods.edit);
                                layer.close(layerindex);
                            }else {
                                common.showTimeMsg(0,'请至少选择一个权限！');
                                return;
                            }
                        }
                    });
                });
            },
            page_list: function (current_page) {
                var param = {
                    pageNum: current_page,
                    pageSize: pagination.goods_zichan_rows_count
                };
                webserver.query(param, apipath.admin.role.list, methods.search, admin.role.search_callback)
            },
            search_callback: function (err, data, layerIndex) {
                var html = '<tr><th width="20%">角色名称</th><th width="65%">权限</th><th width="15%">操作</th></tr>';
                for (var i = 0; i < data.list.length; i++) {
                    html += '<tr>' +
                        '<td style="vertical-align: top;">'
                        + data.list[i].rolesDesc + '</td>' +
                        '<td class="alignleft">';
                    var parentM=new Array();
                    var childM=new Array();
                    for (var j = 0; j < data.list[i].menusList.length; j++) {
                        if(data.list[i].menusList[j].pmenucode==0){
                            parentM.push(data.list[i].menusList[j])
                        }else{
                            childM.push(data.list[i].menusList[j]);
                        }
                    }
                    var menuhtml='';
                    for (var j = 0; j < parentM.length; j++) {
                        menuhtml=menuhtml.substring(0,menuhtml.length-37);
                        menuhtml = menuhtml +'<p class="pmenu"><b>'+parentM[j].menudesc+'</b></p>';
                        for(var x=0;x<childM.length;x++){
                            if(childM[x].pmenucode==parentM[j].menucode) {
                                menuhtml = menuhtml + childM[x].menudesc +'<span class="lightGrey pd10">|</span>';
                            }
                        }
                    }
                    menuhtml=menuhtml.substring(0,menuhtml.length-37);
                    html =html+ menuhtml+ '</td>' +
                        '<td>' ;
                    if(data.list[i].roleCode!=1) {
                        html =html+ '<input type="hidden" class="roleCode" value="' + data.list[i].roleCode + '"/>' +
                        '<button class="btn-delete del">删除</button>  ' +
                        '<button class="btn-details det">修改</button>';
                    }
                    html =html+ '</td>' +
                        '</tr>'
                }
                //拼接后添加
                $('#role').html(html);
                layer.close(layerIndex);
                //调用分页
                pagination.Initialization(data.total, pagination.goods_zichan_rows_count, data.pageNum, admin.role.page_list);
            },
            
        }
    };
})(jQuery);