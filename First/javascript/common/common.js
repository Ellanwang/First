/**
 * (c) Copyright 2017 XianGuan.HU. All Rights Reserved.
 * 2017-10-11
 * 公用函数
 * 修改请加说明
 */
(function () {
    common = {
        /**菜单加载，初始化功能**/
        /*说明：此功能已经移到menulist.js,当前功能用来显示用户信息*/
        menusInitialization: function () {
            var user = common.cookies.get("!@#2017hd_user");
            var token = common.cookies.get("!@#2017hd_token");
            var userId = common.cookies.get("!@#2017hd_userId");
            if (user && token && userId) {
                var user = JSON.parse(common.cookies.get('!@#2017hd_user'));
                var redpoint = '';
                $('.top-box .name').html(user.userName);
                webserver.query({}, apipath.user.info, methods.search, function (err, data, layerIndex) {
                    layer.close(layerIndex);
                    if (data > 0) {
                        redpoint = '<i class="red-point"></i>';
                        $('.top-box a .name').after('<span class="topInfocount">' + data + '</span>').parent().css('position', 'relative');
                    }
                    var infoHtml =
                        '<img class="head-img" src="../../images/pic1.png" />' +
                        '<p class="name" title="'+user.userAccount+'"><span id="curr_user">' + (user.userAccount == '' ? '<span style="color:#cdcdcd">（空）</span>' : user.userAccount) + '</span><a class="icon-bj" href="#"></a></p>' +
                        '<p class="place" id="telNum">' + (user.userTel == '' ? '<span style="color:#cdcdcd">（空）</span>' : user.userTel) + '</p>' +
                        '<p class="place" title="'+user.userAddr+'" id="place">' + (user.userAddr == '' ? '<span style="color:#cdcdcd">（空）</span>' : user.userAddr.substring(0,10)+'...') + '</p>' +
                        '<div class="btn-tops">' +
                        '<button id="alertBtn">修改密码</button>' +
                        '<button id="notice">通知消息</button>' + redpoint;
                    '</div>';
                    $('.personal-box').html(infoHtml);
                });
                $('.top-box .btn-out').click(function () {
                    common.showConfirm('请您确认退出系统', '您打算退出当前账号吗？', function () {
                    }, function () {
                        common.logout();
                    })
                });
                var personalHtml = '<div class="pop-box" id="message" style="display: none;">  ' +
                    '<ul class="tz-box">  </ul> </div> <div class="pop-box" id="modifyInfo" style="display: none;">  ' +
                    '<div class="pop-txt"> ' +
                    '<form id="usrInfoForm"><table class="t-table"> <tr> <td width="14%"> 登录名： </td> <td> <input type="text" maxlength="10" class="validate[required]" id="currName"/> </td> </tr> <tr> <td> 电话： </td> <td> <input class="validate[custom[phone]]" maxlength="13" id="telephone"/> </td> </tr> <tr> <td> 地址： </td> <td> <input maxlength="20" id="address1"/> </td> </tr> </table> </form> </div> </div>'
                $('.top-box').before(personalHtml);

                /*绑定验证*/
                common.bindValidationEngine();

                $('.top-right>li>a').click(function () {
                    $('.personal-box').toggleClass('hide');
                });
                $('body').delegate("#alertBtn", "click", function (e) {
                    common.showIframe('修改密码', '../my/editPassword.html')
                });

                $('body').delegate(".icon-bj", "click", function (e) {
                    common.showPopbox('修改个人信息', $('#modifyInfo'), function () {
                        //初始化
                        user = JSON.parse(common.cookies.get("!@#2017hd_user"));
                        $('#currName').val(user.userAccount);
                        $('#telephone').val(user.userTel);
                        $('#address1').val(user.userAddr);
                    }, function (layerIndex) {
                        if ($('#usrInfoForm').validationEngine('validate')) {
                            layer.close(layerIndex);
                            var param = {};
                            param.userAccount = $('#currName').val();
                            param.userTel = $('#telephone').val();
                            param.userAddr = $('#address1').val();
                            param.userId = userId;
                            webserver.query(param, apipath.users.modifyUser.edit + userId, methods.edit, function (err, data, layerIndex1) {
                                $('.personal-box').toggleClass('hide');
                                common.cookies.set("!@#2017hd_user", data);
                                layer.close(layerIndex1);
                                layer.msg("修改成功，即将刷新本页面！", {
                                    icon: 6,
                                    time: 1500,
                                    end: function () {
                                        window.location.reload();
                                    }
                                });
                            });
                        }
                    });
                });

                $('body').delegate("#notice", "click", function (e) {
                    common.showMsgbox('我的消息记录', $('#message'), function () {
                        var param = {
                            page: 1,
                            rows: 100,
                        };
                        webserver.query(param, apipath.users.notice.list, methods.search, function (err, data, layerIndex) {
                            var html = ''
                            if (data.total && data.total > 0) {
                                for (var i = 0; i < data.list.length; i++) {

                                    if (data.list[i].readStatus === 0) {
                                        html = html + '<li class="myInfo noticeList">'
                                    } else {
                                        html = html + '<li class="noticeList">'
                                    }
                                    html = html + '<a href="#">' +
                                        '<span style="display:none" class="mid">' + data.list[i].umId + '</span>';
                                    if (data.list[i].readStatus === 0) {
                                        html = html + '<i class="r-p r-p-new"></i>';
                                    }
                                    html = html + '<span class="msg">' + data.list[i].msg + '</span></a></li>';
                                }
                            }
                            $('.tz-box').html(html);
                            layer.close(layerIndex);
                        });
                    });
                });

                $('body').delegate("li.noticeList.myInfo", "click", function (e) {
                    var msgId = $(e.currentTarget).find('span.mid').text();
                    var msg = $(e.currentTarget).find('span.msg').text();
                    layer.open({
                        type: 1, title: false,
                        closeBtn: false, area: '500px;',
                        shade: 0.8, id: 'myMsgBox',
                        resize: false, btn: ['了解'],
                        btnAlign: 'c', moveType: 1,
                        //拖拽模式，0或者1,
                        content: '<div style="padding: 50px; line-height: 22px; background-color: #393D49; color: #fff; font-weight: 300;">' + msg + '</div>',
                        success: function (layero) {
                            var param = {};
                            param.umId = msgId;
                            webserver.query(param, apipath.users.notice.edit + msgId, methods.edit);
                            $(e.currentTarget).find('i.r-p').hide();
                        },
                        end: function () {
                            var count = $('.top-right span.topInfocount').html();
                            if (count) {
                                if (parseInt(count) > 1) {
                                    $('.top-right li:eq(0) span.topInfocount').html(parseInt(count) - 1);
                                } else {
                                    $(".top-right li:eq(0) span.topInfocount").remove();
                                    $(".top-right li:eq(0) div.personal-box div.btn-tops i.red-point").remove();
                                }
                            }
                        }
                    });
                });

            } else {
                layer.alert('此账号登录时间已过期，或在其他设备（地点）登录！', function () {
                    window.location.href = '../../login.html';
                });
                return;
            }
        },
        bindValidationEngine: function () {
            /*为所有页面的校验绑定事件*/
            common.myValidationEngine('form', 'attach', 'bottomLeft', {
                'required': {'message': '这里必须填写！'},
                'custom[positiveInteger]': {'message': '这里必须填写正整数！'},
                'input[type="file"]': {'required': {'message': '上传文件不允许为空！'}},
                '#multipartFile': {'required': {'message': '上传文件不允许为空！'}},
                '#file': {'required': {'message': '上传文件不允许为空！'}},
                '.systemUsers': {'required': {'message': '请输入系统中存在的用户！'}},
            });
        },
        /*
         * 在本页面弹出新页面，主要用于文件上传
         *callback：点击确定回调
         */
        showIframe: function (title, src, callback_OK) {
            //iframe层-父子操作
            var index = layer.open({
                id: 'iframe',
                resize: false,
                title: title,
                type: 2,
                area: ['462px', '258px'],
                fixed: false, //不固定
                maxmin: false,
                content: [src, 'no']
            });
        },
        /*以下是退出方法，personnal文件只有登录页面引用，把其中的方法移植在此*/
        logout: function () {
            common.cookies.delete("!@#2017hd_user");
            common.cookies.delete("!@#2017hd_token");
            layer.msg("退出成功！", {icon: 6, shade: 0.3, time: 1000}, function () {
                window.location.href = '../../login.html';
            });
            //webserver.query(null, apipath.user.logout, methods.add, common.callback_logout);
        },
        // callback_logout: function (err, data ,layerIndex) {
        //     layer.msg(data.msg, {icon: 6,shade:0.3,time:1000},function(){
        //         window.location.href='html/cars/carsManage.html';
        //     });
        // },
        /**取出页面中某个select的text和value
         *@selector 页面元素，
         * spiltchar：分隔符，已废弃
         **/
        arrayPutList: function (selector, spiltchar) {
            var arrId = new Array();
            var arrName = new Array();
            $(selector).each(function () {
                arrId.push($(this).attr('value'));
                arrName.push($(this).parents().siblings('.userName').text());
            });
            var obj = {};
            obj.id = arrId.join(',');
            obj.name = arrName.join('、');
            return obj;
        },
        /**将字符串转化为数组
         *@string 字符串，
         * @spiltchar：分隔符
         **/
        string2Array: function (str, spiltchar) {
            str = str.split(spiltchar);
            var arr = new Array();
            for (var i = 0; i < str.length; i++) {
                if (str[i] !== "")
                    arr.push(str[i]);
            }
            return arr;
        },
        /**合并数组并去重
         *@string 字符串，
         * @spiltchar：分隔符
         **/
        mergeArray: function (target, newarr) {
            var indexArray = new Array();
            for (var i = 0; i < newarr.length; i++) {
                var items = newarr[i];
                if ($.inArray(items, target) == -1) {
                    target.push(items)
                }
            }
            return {"repeatIndex": indexArray, "mergeArray": target};
        },
        /**合并数组不去重
         *@string 字符串，
         * @spiltchar：分隔符
         **/
        mergeArrayNotRemove: function (target, newarr) {
            for (var i = 0; i < newarr.length; i++) {
                target.push(newarr[i])
            }
            return target;
        },
        /**取出数组array中的中的元素，并用spiltchar分割
         * data:数组元素
         * name:元素名称
         * spiltchar 分隔符
         **/
        arrayList: function (data, name, spiltchar) {
            var arr = new Array();
            for (var j = 0; j < data.length; j++) {
                if (data[j]) {
                    arr.push(data[j][name]);
                }
            }
            return arr.join(spiltchar);
        },
        /**自定义时间格式方法**/
        myDate: {
            setDate: {
                /***
                 * 获得当前时间
                 */
                getCurrentDate: function () {
                    var CurrentDate = new Date();
                    common.myDate.serverDate('', function (err, data, layerIndex) {
                        CurrentDate = new Date(data.time);
                        layer.close(layerIndex);
                    });
                    return CurrentDate;
                },
                /***
                 * 获得本周起止时间
                 */
                getCurrentWeek: function () {
                    //起止日期数组
                    var startStop = new Array();
                    //获取当前时间
                    var currentDate = this.getCurrentDate();
                    //返回date是一周中的某一天
                    var week = currentDate.getDay();
                    //返回date是一个月中的某一天
                    var month = currentDate.getDate();

                    //一天的毫秒数
                    var millisecond = 1000 * 60 * 60 * 24;
                    //减去的天数
                    var minusDay = week != 0 ? week - 1 : 6;
                    //alert(minusDay);
                    //本周 周一
                    var monday = new Date(currentDate.getTime() - (minusDay * millisecond));
                    //本周 周日
                    var sunday = new Date(monday.getTime() + (6 * millisecond));
                    //添加本周时间
                    startStop.push(monday);//本周起始时间
                    //添加本周最后一天时间
                    startStop.push(sunday);//本周终止时间
                    //返回
                    return startStop;
                },

                /***
                 * 获得本月的起止时间
                 */
                getCurrentMonth: function () {
                    //起止日期数组
                    var startStop = new Array();
                    //获取当前时间
                    var currentDate = this.getCurrentDate();
                    //获得当前月份0-11
                    var currentMonth = currentDate.getMonth();
                    //获得当前年份4位年
                    var currentYear = currentDate.getFullYear();
                    //求出本月第一天
                    var firstDay = new Date(currentYear, currentMonth, 1);


                    //当为12月的时候年份需要加1
                    //月份需要更新为0 也就是下一年的第一个月
                    if (currentMonth == 11) {
                        currentYear++;
                        currentMonth = 0;//就为
                    } else {
                        //否则只是月份增加,以便求的下一月的第一天
                        currentMonth++;
                    }


                    //一天的毫秒数
                    var millisecond = 1000 * 60 * 60 * 24;
                    //下月的第一天
                    var nextMonthDayOne = new Date(currentYear, currentMonth, 1);
                    //求出上月的最后一天
                    var lastDay = new Date(nextMonthDayOne.getTime() - millisecond);

                    //添加至数组中返回
                    startStop.push(firstDay);
                    startStop.push(lastDay);
                    //返回
                    return startStop;
                },

                /**
                 * 得到本季度开始的月份
                 * @param month 需要计算的月份
                 ***/
                getQuarterSeasonStartMonth: function (month) {
                    var quarterMonthStart = 0;
                    var spring = 0; //春
                    var summer = 3; //夏
                    var fall = 6;   //秋
                    var winter = 9;//冬
                    //月份从0-11
                    if (month < 3) {
                        return spring;
                    }

                    if (month < 6) {
                        return summer;
                    }

                    if (month < 9) {
                        return fall;
                    }

                    return winter;
                },

                /**
                 * 获得该月的天数
                 * @param year年份
                 * @param month月份
                 * */
                getMonthDays: function (year, month) {
                    //本月第一天 1-31
                    var relativeDate = new Date(year, month, 1);
                    //获得当前月份0-11
                    var relativeMonth = relativeDate.getMonth();
                    //获得当前年份4位年
                    var relativeYear = relativeDate.getFullYear();

                    //当为12月的时候年份需要加1
                    //月份需要更新为0 也就是下一年的第一个月
                    if (relativeMonth == 11) {
                        relativeYear++;
                        relativeMonth = 0;
                    } else {
                        //否则只是月份增加,以便求的下一月的第一天
                        relativeMonth++;
                    }
                    //一天的毫秒数
                    var millisecond = 1000 * 60 * 60 * 24;
                    //下月的第一天
                    var nextMonthDayOne = new Date(relativeYear, relativeMonth, 1);
                    //返回得到上月的最后一天,也就是本月总天数
                    return new Date(nextMonthDayOne.getTime() - millisecond).getDate();
                },

                /**
                 * 获得本季度的起止日期
                 */
                getCurrentSeason: function () {
                    //起止日期数组
                    var startStop = new Array();
                    //获取当前时间
                    var currentDate = this.getCurrentDate();
                    //获得当前月份0-11
                    var currentMonth = currentDate.getMonth();
                    //获得当前年份4位年
                    var currentYear = currentDate.getFullYear();
                    //获得本季度开始月份
                    var quarterSeasonStartMonth = this.getQuarterSeasonStartMonth(currentMonth);
                    //获得本季度结束月份
                    var quarterSeasonEndMonth = quarterSeasonStartMonth + 2;

                    //获得本季度开始的日期
                    var quarterSeasonStartDate = new Date(currentYear, quarterSeasonStartMonth, 1);
                    //获得本季度结束的日期
                    var quarterSeasonEndDate = new Date(currentYear, quarterSeasonEndMonth, this.getMonthDays(currentYear, quarterSeasonEndMonth));
                    //加入数组返回
                    startStop.push(quarterSeasonStartDate);
                    startStop.push(quarterSeasonEndDate);
                    //返回
                    return startStop;
                },

                /***
                 * 得到本年的起止日期
                 *
                 */
                getCurrentYear: function () {
                    //起止日期数组
                    var startStop = new Array();
                    //获取当前时间
                    var currentDate = this.getCurrentDate();
                    //获得当前年份4位年
                    var currentYear = currentDate.getFullYear();

                    //本年第一天
                    var currentYearFirstDate = new Date(currentYear, 0, 1);
                    //本年最后一天
                    var currentYearLastDate = new Date(currentYear, 11, 31);
                    //添加至数组
                    startStop.push(currentYearFirstDate);
                    startStop.push(currentYearLastDate);
                    //返回
                    return startStop;
                },

                /**
                 * 返回上一个月的第一天Date类型
                 * @param year 年
                 * @param month 月
                 **/
                getPriorMonthFirstDay: function (year, month) {
                    //年份为0代表,是本年的第一月,所以不能减
                    if (month == 0) {
                        month = 11;//月份为上年的最后月份
                        year--;//年份减1
                        return new Date(year, month, 1);
                    }
                    //否则,只减去月份
                    month--;
                    return new Date(year, month, 1);
                    ;
                },

                /**
                 * 获得上一月的起止日期
                 * ***/
                getPreviousMonth: function () {
                    //起止日期数组
                    var startStop = new Array();
                    //获取当前时间
                    var currentDate = this.getCurrentDate();
                    //获得当前月份0-11
                    var currentMonth = currentDate.getMonth();
                    //获得当前年份4位年
                    var currentYear = currentDate.getFullYear();
                    //获得上一个月的第一天
                    var priorMonthFirstDay = this.getPriorMonthFirstDay(currentYear, currentMonth);
                    //获得上一月的最后一天
                    var priorMonthLastDay = new Date(priorMonthFirstDay.getFullYear(), priorMonthFirstDay.getMonth(), this.getMonthDays(priorMonthFirstDay.getFullYear(), priorMonthFirstDay.getMonth()));
                    //添加至数组
                    startStop.push(priorMonthFirstDay);
                    startStop.push(priorMonthLastDay);
                    //返回
                    return startStop;
                },


                /**
                 * 获得上一周的起止日期
                 * **/
                getPreviousWeek: function () {
                    //起止日期数组
                    var startStop = new Array();
                    //获取当前时间
                    var currentDate = this.getCurrentDate();
                    //返回date是一周中的某一天
                    var week = currentDate.getDay();
                    //返回date是一个月中的某一天
                    var month = currentDate.getDate();
                    //一天的毫秒数
                    var millisecond = 1000 * 60 * 60 * 24;
                    //减去的天数
                    var minusDay = week != 0 ? week - 1 : 6;
                    //获得当前周的第一天
                    var currentWeekDayOne = new Date(currentDate.getTime() - (millisecond * minusDay));
                    //上周最后一天即本周开始的前一天
                    var priorWeekLastDay = new Date(currentWeekDayOne.getTime() - millisecond);
                    //上周的第一天
                    var priorWeekFirstDay = new Date(priorWeekLastDay.getTime() - (millisecond * 6));

                    //添加至数组
                    startStop.push(priorWeekFirstDay);
                    startStop.push(priorWeekLastDay);

                    return startStop;
                },

                /**
                 * 得到上季度的起始日期
                 * year 这个年应该是运算后得到的当前本季度的年份
                 * month 这个应该是运算后得到的当前季度的开始月份
                 * */
                getPriorSeasonFirstDay: function (year, month) {
                    var quarterMonthStart = 0;
                    var spring = 0; //春
                    var summer = 3; //夏
                    var fall = 6;   //秋
                    var winter = 9;//冬
                    //月份从0-11
                    switch (month) {//季度的其实月份
                        case spring:
                            //如果是第一季度则应该到去年的冬季
                            year--;
                            month = winter;
                            break;
                        case summer:
                            month = spring;
                            break;
                        case fall:
                            month = summer;
                            break;
                        case winter:
                            month = fall;
                            break;

                    }
                    ;

                    return new Date(year, month, 1);
                },

                /**
                 * 得到上季度的起止日期
                 * **/
                getPreviousSeason: function () {
                    //起止日期数组
                    var startStop = new Array();
                    //获取当前时间
                    var currentDate = this.getCurrentDate();
                    //获得当前月份0-11
                    var currentMonth = currentDate.getMonth();
                    //获得当前年份4位年
                    var currentYear = currentDate.getFullYear();
                    //上季度的第一天
                    var priorSeasonFirstDay = this.getPriorSeasonFirstDay(currentYear, currentMonth);
                    //上季度的最后一天
                    var priorSeasonLastDay = new Date(priorSeasonFirstDay.getFullYear(), priorSeasonFirstDay.getMonth() + 2, this.getMonthDays(priorSeasonFirstDay.getFullYear(), priorSeasonFirstDay.getMonth() + 2));
                    //添加至数组
                    startStop.push(priorSeasonFirstDay);
                    startStop.push(priorSeasonLastDay);
                    return startStop;
                },

                /**
                 * 得到去年的起止日期
                 * **/
                getPreviousYear: function () {
                    //起止日期数组
                    var startStop = new Array();
                    //获取当前时间
                    var currentDate = this.getCurrentDate();
                    //获得当前年份4位年
                    var currentYear = currentDate.getFullYear();
                    currentYear--;
                    var priorYearFirstDay = new Date(currentYear, 0, 1);
                    var priorYearLastDay = new Date(currentYear, 11, 1);
                    //添加至数组
                    startStop.push(priorYearFirstDay);
                    startStop.push(priorYearLastDay);
                    return startStop;
                }
            },
            DigitalUppercase: function (Digital) {
                var Uppercase = "星期";
                switch (Digital) {
                    case 1 :
                        Uppercase = Uppercase + '一';
                        break;
                    case 2 :
                        Uppercase = Uppercase + '二';
                        break;
                    case 3 :
                        Uppercase = Uppercase + '三';
                        break;
                    case 4 :
                        Uppercase = Uppercase + '四';
                        break;
                    case 5 :
                        Uppercase = Uppercase + '五';
                        break;
                    case 6 :
                        Uppercase = Uppercase + '六';
                        break;
                    case 0 :
                        Uppercase = Uppercase + '日';
                        break;
                }
                return Uppercase;
            },
            /**获取服务器时间**/
            serverDate: function (date, callback) {
                var params = {"date": date};
                var layerIndex = null;
                $.ajax({
                    type: "GET",
                    url: apipath.server.date,
                    data: params,
                    dataType: "json",
                    contentType: "application/json",
                    async: false,
                    timeout: 3000,
                    beforeSend: function () {
                        layerIndex = layer.msg('正在初始化当前时间...', {
                            icon: 16,
                            shade: 0.3,
                            time: 0
                        });
                    },
                    success: function (data) {
                        if (data.status === 0) {
                            if (data.data) {
                                /*
                                 *此处应该注意
                                 *layerIndex，加载状态的提示框的index,防止
                                 *loading长时间存在，处理完成后，程序可使用layer.close(layerIndex)
                                 * 将其关闭
                                 */
                                callback(null, data.data, layerIndex);

                            } else {
                                layer.msg('初始化时间失败！', {
                                    icon: 5
                                });
                            }
                        } else {
                            layer.msg(data.msg, {
                                icon: 5
                            });
                        }
                    },
                    error: function (responseStr) {
                        layer.msg('初始化时间失败！', {
                            icon: 5
                        });
                    }
                });
            },
            /**格式化时间字符串
             * obj：时间格式的类型
             * format:格式化类型 ，如：'yyyy-MM-dd'
             * **/
            dateFormat: function (obj, Format) {
                if (obj == 'Invalid Date') {
                    return '/';
                }
                var newDate = new Date();
                newDate.setTime(obj);
                if (Format) {
                    return common.myDate.dateFormatBase(newDate, Format);
                } else {
                    return newDate.toLocaleString();
                }
            },
            timeLength: function (s, e) {
                var str = "剩余";
                var tlength = e - s;
                if (tlength < 0) {
                    return "已完成";
                }
                var minuts = 0;
                var hours = 0;
                var days = tlength / 1000 / 60 / 60 / 24;
                if (days > 0) {
                    str = str + Math.floor(days) + '天';
                    hours = (days - Math.floor(days)) * 24;
                } else {
                    hours = days * 24;
                }
                if (hours > 0) {
                    str = str + Math.floor(hours) + '小时';
                    minuts = (hours - Math.floor(hours)) * 60;
                } else {
                    str = str + '0小时';
                    minuts = hours * 60;
                }
                if (minuts > 0) {
                    str = str + Math.ceil(minuts) + '分钟';
                } else {
                    str = str + '0分钟';
                }
                return str;
            },
            /**取出一周的第一天**/
            FirstDayOfWeek: function (date) {
                var day = date.getDay() || 7;
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
            },
            /**最基础的功能，最好不要直接调用，通过dateFormat调用**/
            dateFormatBase: function (newDate, format) {
                var date = {
                    "M+": newDate.getMonth() + 1,
                    "d+": newDate.getDate(),
                    "h+": newDate.getHours(),
                    "m+": newDate.getMinutes(),
                    "s+": newDate.getSeconds(),
                    "q+": Math.floor((newDate.getMonth() + 3) / 3),
                    "S+": newDate.getMilliseconds()
                };
                if (/(y+)/i.test(format)) {
                    format = format.replace(RegExp.$1, (newDate.getFullYear() + '').substr(4 - RegExp.$1.length));
                }
                for (var k in date) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, RegExp.$1.length == 1
                            ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                    }
                }
                return format;
            },

        },
        /**
         * 弹出层的封装
         * title：标题
         * selector：要包裹のhtml段落
         * callback_setvalue：弹出成功后的回掉方法
         * callback_OK：确定的回掉方法
         **/
        showPopbox: function (title, selector, callback_setvalue, callback_OK,callback_cancle) {
            layer.open({
                type: 1,
                title: common.singledisplayPart(title,40),
                closeBtn: 1,
                area: '[462px]',
                shadeClose: false,
                resize: false,
                content: $(selector),
                btn: ['确认', '取消'],
                btnAlign: 'c',
                yes: function (index, layero) {
                    callback_OK(index);
                },
                btn2: function(index, layero){
                    if(callback_cancle) {callback_cancle(index);}
                },
                cancel: function (index, layero) {
                    if(callback_cancle) {
                        callback_cancle(index);
                    }
                },
                success: function (layero, index) {
                    callback_setvalue();
                }
            });
        },
        /**
         * 弹出层的封装
         * title：标题
         * selector：要包裹のhtml段落
         * callback_setvalue：弹出成功后的回掉方法
         * callback_OK：确定的回掉方法
         **/
        showMsgbox: function (title, selector, callback_setvalue) {
            layer.open({
                type: 1,
                title: title,
                shadeClose: false,
                shade: false,
                maxmin: true, //开启最大化最小化按钮
                area: ['793px', '500px'],
                content: $(selector).html(),
                success: function (layero, index) {
                    callback_setvalue();
                }
            });
        },
        /**
         * 弹出层的封装
         * title：标题
         * text：确认信息
         * callback_Cancel：取消后的回调
         * callback_OK：确定的回掉方法
         **/
        showConfirm: function (title, text, callback_Cancel, callback_OK) {
            layer.confirm(text, {
                resize: false,
                btn: ['确定', '取消'],
                title: title
            }, function () {
                callback_OK();
            }, function () {
                callback_Cancel();
            });
        },
        showPrompt:function(tilte,setvalue,callback){
            layer.prompt({title: tilte, formType: 2 , value:setvalue ,maxlength: 100 }, function(text, index){
                callback(text,index);
            });
        },
        /**
         * 展现tips
         * html：内容，支持html
         * selector：元素
         * background：tips 背景
         * time：展现时间，0无限制
         **/
        showTips: function (html, selector, background, time) {
            layer.tips(html, selector, {
                tips: [1, background],
                time: time,
                area: 'auto',
                type: 4
            });
        },
        /**
         * 展现提示信息框
         * icon：图标
         * text：信息
         *callback：点击确定回调
         **/
        showAlert: function (icon, text, callback) {
            layer.alert(text, {
                icon: icon,
                closeBtn: 0
            }, function (index) {
                callback();
                layer.close(index);
            })
        },
        /**
         * 展现提示信息框，自动关闭
         * icon：图标
         * text：信息
         **/
        showTimeMsg: function (icon, text) {
            layer.msg(text, {
                icon: icon,
                shade: 0.3,
                time: 2000
            });
        },

        upload: function (selector, requestName, url, callback) {
            var layerIndex = null;
            var formData = new FormData();
            formData.append(requestName, $(selector)[0].files[0]);
            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                // 告诉jQuery不要去处理发送的数据
                processData: false,
                // 告诉jQuery不要去设置Content-Type请求头
                contentType: false,
                beforeSend: function () {
                    layerIndex = layer.msg('正在上传文件，请稍后...', {
                        icon: 16,
                        shade: 0.3,
                        time: 0
                    });
                },
                success: function (data) {
                    if (data.status === 0) {
                        if (data.data) {
                            /**
                             *此处应该注意
                             *layerIndex，加载状态的提示框的index,防止
                             *loading长时间存在，处理完成后，程序可使用layer.close(layerIndex)
                             * 将其关闭
                             */
                            callback(null, data.data, layerIndex);

                        } else if (data.msg) {
                            layer.msg(data.msg + "，即将刷新本页面！", {
                                icon: 6,
                                time: 1500,
                                end: function () {
                                    window.location.reload();
                                }
                            });
                        }
                    } else {
                        layer.msg(data.msg, {
                            icon: 5
                        });
                    }
                },
                error: function (responseStr) {
                    layer.msg('请求出错！', {
                        icon: 5
                    });
                }
            });
        },
        /*文件地址*/
        cutUrl: function (url) {
            if (url && url.lastIndexOf("HD")) {
                url = url.substr(url.lastIndexOf("HD"), url.length);
                return "http://121.42.224.143:8080/" + url;
            } else {
                return '#';
            }
        },
        /**
         * 随机数生成
         **/
        RandomNum: function (Min, Max) {
            var Range = Max - Min;
            var Rand = Math.random();
            return (Min + Math.round(Rand * Range));
        },
        /**
         * cookies，操作类，可扩展
         **/
        cookies: {
            set: function (name, value) {
                Cookies.set(name, value);
            },
            get: function (name) {
                return Cookies.get(name);
            },
            delete: function (name) {
                Cookies.remove(name);
            }
        },
        /** 校验 已经废弃**/
        myValidform: function (form, btnSubmit) {
            var formCheck = $(form).Validform({
                btnSubmit: btnSubmit,
                tiptype: function (msg, o, cssctl) {
                    if (!o.obj.is("form")) {//验证表单元素时o.obj为该表单元素，全部验证通过提交表单时o.obj为该表单对象;
                        if (o.type === 3) {
                            layer.msg(msg, {icon: 2, shade: 0.3, time: 1500}, function () {
                                //关闭后的操作
                                $(o.obj).val('').focus();
                            });
                        }
                    }
                    //msg：提示信息;
                    //o:{obj:*,type:*,curform:*},
                    //obj指向的是当前验证的表单元素（或表单对象，验证全部验证通过，提交表单时o.obj为该表单对象），
                    //type指示提示的状态，值为1、2、3、4， 1：正在检测/提交数据，2：通过验证，3：验证失败，4：提示ignore状态,
                    //curform为当前form对象;
                    //cssctl:内置的提示信息样式控制函数，该函数需传入两个参数：显示提示信息的对象 和 当前提示的状态（既形参o中的type）;
                },
                ajaxPost: true,
                datatype: {
                    "pn1-2": /^[1-9]+[0-9]*]*$/
                },
                beforeCheck: function (curform) {
                    //在表单提交执行验证之前执行的函数，curform参数是当前表单对象。
                    //这里明确return false的话将不会继续执行验证操作;
                },
                beforeSubmit: function (curform) {
                    //在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
                    //这里明确return false的话表单将不会提交;
                },
                callback: function (data) {
                    //返回数据data是json对象，{"info":"demo info","status":"y"}
                    //info: 输出提示信息;
                    //status: 返回提交数据的状态,是否提交成功。如可以用"y"表示提交成功，"n"表示提交失败，在ajax_post.php文件返回数据里自定字符，主要用在callback函数里根据该值执行相应的回调操作;
                    //你也可以在ajax_post.php文件返回更多信息在这里获取，进行相应操作；
                    //ajax遇到服务端错误时也会执行回调，这时的data是{ status:**, statusText:**, readyState:**, responseText:** }；

                    //这里执行回调操作;
                    //注意：如果不是ajax方式提交表单，传入callback，这时data参数是当前表单对象，回调函数会在表单验证全部通过后执行，然后判断是否提交表单，如果callback里明确return false，则表单不会提交，如果return true或没有return，则会提交表单。
                }
            });
            return formCheck;
        },
        /**新的校验插件**/
        myValidationEngine: function (form, action, promptPosition, custom_error_messages) {
            try {
                $(form).validationEngine(action, {
                    'binded': false,
                    'scroll': false,
                    'autoHideDelay': 2000,
                    "fadeDuration": 0.1,
                    "focusFirstField": false,
                    'promptPosition': promptPosition,
                    'autoPositionUpdate': true,
                    'autoHidePrompt': true,
                    'showOneMessage': true,
                    'maxErrorsPerField': 1,
                    'validateNonVisibleFields': true,
                    'custom_error_messages': custom_error_messages
                });
            }
            catch(e) {
            }
        },
        /*选择器批量字符省略*/
        displayPart:function (selector) {
            $(selector).each(function(){
                var displayLength = 10;
                displayLength = $(this).attr("display-length") || displayLength;
                var text = $(this).text();
                if (!text) return "";

                var result = "";
                var count = 0;
                for (var i = 0; i < displayLength; i++) {
                    var _char = text.charAt(i);
                    if (count >= displayLength) break;
                    if (/[^x00-xff]/.test(_char)) count++; //双字节字符，//[u4e00-u9fa5]中文
                    result += _char;
                    count++;
                }
                if (result.length < text.length) {
                    result += "...";
                }
                $(this).attr('title',$(this).text());
                $(this).text(result);
            })
        },
        /*单个字符省略*/
        singledisplayPart:function (text,displayLength) {
                if (!text) return "";
                var result = "";
                var count = 0;
                for (var i = 0; i < displayLength; i++) {
                    var _char = text.charAt(i);
                    if (count >= displayLength) break;
                    if (/[^x00-xff]/.test(_char)) count++; //双字节字符，//[u4e00-u9fa5]中文
                    result += _char;
                    count++;
                }
                if (result.length < text.length) {
                    result += "...";
                }
                return result;
        }
    }
})(jQuery);