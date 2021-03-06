/**
 * 用户管理交互类
 * (c) Copyright 2017 Xiaoxiao Wang All Rights Reserved.
 * 2017-11-02
 */

var users = {
    user_management: {
        Initialization: function () {
            //菜单初始化
            common.menusInitialization();
            var d1 = $.Deferred();
            var d2 = $.Deferred();
            users.user_management.deptDropList(d1);
            users.user_management.roleDropList(d2);
            $.when(d1, d2).done(function () {
                users.user_management.page_list(1);
            });
            $('#searchUser').click(function () {
                users.user_management.page_list(1);
            });
            $('body').delegate(".delBtn", "click", function (e) {
                e.stopPropagation();
                e.preventDefault();
                var name = $(e.currentTarget).parent().siblings('.newName').text();
                common.showConfirm('请您确认以下信息:', '您将删除用户：' + name, function () {
                }, function () {
                    var id = $(e.currentTarget).parent().siblings('.newId').text();
                    webserver.query(null, apipath.users.userIndex.delete + id, methods.delete);
                });
            });
            $('body').delegate(".changBtn", "click", function (e) {
                var id = $(e.currentTarget).parent().siblings('.newId').text();
                common.showPopbox('修改用户信息', $('#creatUser'), function () {
                    webserver.query(null, apipath.users.userIndex.single + id, methods.search, function (err, data, layerIndex) {
                        //设置初始值
                        $('#newName').val(data.userName);
                        $('#roles').val(data.userRole);
                        $('#deptname').val(data.deptId);
                        if (data.isManager == 1) {
                            $('#manager').attr('checked', true);
                        }else{
                            $('#manager').attr('checked', false);
                        }
                        layer.close(layerIndex);
                    });
                }, function (layerIndex1) {
                    if ($('.modifyPost').validationEngine('validate')) {
                        //$('input:radio[name="radio"]:checked').removeProp('checked');
                        var param = {};
                        param.userName = $('#newName').val();
                        param.userRole = $('#roles option:selected').val();
                        param.deptId = $('#deptname option:selected').val();
                        if ($('#manager').attr('checked')) {
                            param.isManager = 1;
                        } else {
                            param.isManager = 0;
                        }
                        webserver.query(param, apipath.users.userIndex.edit + id, methods.edit, function (err, data, layerIndex2) {
                            /*若是本人修改需要更新cookie*/
                            var userId = common.cookies.get("!@#2017hd_userId");
                            if (id == userId) {
                                common.cookies.set("!@#2017hd_user", data);
                            }
                            layer.msg("修改成功，即将刷新本页面！", {
                                icon: 6,
                                time: 1500,
                                end: function () {
                                    window.location.reload();
                                }
                            });
                            layer.close(layerIndex2);
                        });

                        layer.close(layerIndex1);
                    }
                });
            });
            $('#addNewUser').click(function () {
                common.showPopbox('新建用户', $('#creatUser'), function () {
                    //初始化
                    $('#newName').val('');
                    $('#roles').val('');
                    $('#deptname').val('');
                    $('#manager').attr('checked',false);
                }, function (layerIndex) {
                    if ($('#newUser').validationEngine('validate')) {
                        var param = {};
                        //param.userId = $('#userId').val();
                        param.userName = $('#newName').val();
                        param.userRole = $('#roles option:selected').val();
                        param.deptId = $('#deptname option:selected').val();
                        if ($('#manager').attr('checked')) {
                            param.isManager = 1;
                        } else {
                            param.isManager = 0;
                        }
                        webserver.query(param, apipath.users.userIndex.add, methods.add);
                        layer.close(layerIndex);
                    }
                });
            });
        },

        page_list: function (current_page) {
            var param = {
                page: current_page,
                rows: pagination.users_rows_count
            };
            param.roleId = $('#userrole option:selected').val();
            param.deptId = $('#deptId option:selected').val();
            param.name = $('#search-user').val();
            webserver.query(param, apipath.users.userIndex.list, methods.search, users.user_management.callback_search);
        },

        callback_search: function (err, data, layerIndex) {
            var html = '';
            html = '<tr>' +
                '<th width="10%">用户ID</th>' +
                '<th width="10%">姓名</th>' +
                '<th width="10%">角色</th>' +
                '<th width="10%">部门</th>' +
                '<th width="10%">操作</th>' +
                '</tr>';
            if (data.total && data.total > 0) {
                for (var i = 0; i < data.list.length; i++) {
                    html = html +
                        '<tr>' +
                        '<td class="newId">' + data.list[i].userId + '</td>' +
                        '<td class="newName">' + data.list[i].userName + '</td>' +
                        '<td>' + data.list[i].rolesdesc + '</td>' +
                        '<td>' + data.list[i].deptName + '</td>' +
                        '<td>';
                    if (data.list[i].userId != 1) {
                        html = html + '<button class="btn-delete delBtn">删除</button> ' +
                            '<button class="btn-details changBtn">修改</button>';
                    } else {
                        html = html + '<button class="btn-details changBtn">修改</button>';
                    }
                    html = html + '</td>'
                }
                ;
            }
            pagination.Initialization(data.total, pagination.users_rows_count, data.pageNum, users.user_management.page_list);
            $('#userlist').html(html);
            layer.close(layerIndex);
        },
        deptDropList: function (d) {
            var param = {
                page: 1,
                rows: pagination.deptDropList_rows_count
            };
            webserver.query(param, apipath.contact.deptList.list, methods.search, function (err, data, layerIndex) {
                var html = '';
                for (var i = 0; i < data.list.length; i++) {
                    html = html + '<option value="' + data.list[i].deptId + '">' + data.list[i].deptName + '</option>';
                }
                $('#deptname').html(html);
                $('#deptId').html('<option value="">全部</option>' + html);

                if (d) {
                    d.resolve();
                }
                layer.close(layerIndex);
            });
        },
        roleDropList: function (d) {
            var param = {
                pageNum: 1,
                pageSize: pagination.roleDropList_rows_count
            };
            webserver.query(param, apipath.users.userIndex.roleList, methods.search, function (err, data, layerIndex) {
                var html = '';
                for (var i = 0; i < data.length; i++) {
                    html = html + '<option value="' + data[i].roleCode + '">' + data[i].rolesDesc + '</option>';
                }
                $('#userrole').html('<option value="">全部</option>' + html);
                $('#roles').html(html);
                if (d) {
                    d.resolve();
                }
                layer.close(layerIndex);
            });
        }
    }
}
