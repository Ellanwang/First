    $(document).ready(function () {
        var user = common.cookies.get("!@#2017hd_user");
        var token = common.cookies.get("!@#2017hd_token");
        var userId = common.cookies.get("!@#2017hd_userId");
        if (user && token && userId) {
            user = JSON.parse(user);
        } else {
            layer.ready(function() {
                layer.alert('此账号登录时间已过期，或在其他设备（地点）登录！', function () {
                    window.location.href = '../../login.html';
                });
            }
        );
            return;
        }
        var ParentMenu = new Array();
        var ChildMenu = new Array();
        webserver.query({}, apipath.user.menulist, methods.search, function (err, data, layerIndex) {
            layer.close(layerIndex);
            for (var i = 0; i < data.length; i++) {
                if (data[i].menulevel == 1) {
                    var dataMenu = {};
                    dataMenu["name"] = data[i].menudesc;
                    dataMenu["icon"] = data[i].iconhref;
                    dataMenu["href"] = data[i].menuhref;
                    dataMenu["menucode"] = data[i].menucode;
                    dataMenu["child"] = new Array();
                    ParentMenu.push(dataMenu);
                } else if (data[i].menulevel == 2) {
                    var dataMenu = {};
                    dataMenu["name"] = data[i].menudesc;
                    dataMenu["icon"] = data[i].iconhref;
                    dataMenu["href"] = data[i].menuhref;
                    dataMenu["menucode"] = data[i].menucode;
                    dataMenu["pmenucode"] = data[i].pmenucode;
                    //dataMenu["child"] = new Array();
                    ChildMenu.push(dataMenu);
                }
            }
            for (var j = 0; j < ParentMenu.length; j++) {
                for (var i = 0; i < ChildMenu.length; i++) {
                    if (ChildMenu[i].pmenucode === ParentMenu[j].menucode) {
                        ParentMenu[j]["child"].push(ChildMenu[i]);
                    }
                }
            }
            Initialization(ParentMenu);

            /**加载状态**/
            var menuIndex = common.cookies.get('cur_menuIndex_' + user.userId);
            if (menuIndex) {
                $('.left-nav>li>ul.ej-nav>li>a').each(function () {
                    $(this).removeClass('cur-a');
                });
                $('.left-nav>li>a').each(function () {
                    $(this).removeClass('cur-nav');
                });
                $('.left-nav').find('a').eq(menuIndex).addClass('cur-a').parents().parents().addClass('show').siblings('a').addClass('cur-nav');
            }
            /**菜单折叠事件**/
            $('.left-nav>li>a').click(function () {
                $('.left-nav>li>ul.ej-nav').each(function () {
                    $(this).removeClass('show').parent().removeClass('show');
                });
                $(this).parent().addClass('show').find('ul.ej-nav').addClass('show');
            });
            $('.left-nav>li>ul.ej-nav>li>a').click(function () {
                $('.left-nav>li>ul.ej-nav>li>a').each(function () {
                    $(this).removeClass('cur-a');
                });
                $('.left-nav>li>a').each(function () {
                    $(this).removeClass('cur-nav');
                });
                $(this).addClass('cur-a').parents().parents().siblings('a').addClass('cur-nav');
                common.cookies.set('cur_menuIndex_' + user.userId, $('.left-nav').find('a').index(this));
            });

        });
    });

function Initialization(JsonStr) {
    var menulist = _menulist(JsonStr);
    $('.left-nav').html(menulist);
}

function _menulist(JsonStr) {
    var menuhtml = '';
    for (var i = 0; i < JsonStr.length; i++) {
        menuhtml = menuhtml +
            '<li><a href="'+JsonStr[i].href+'">' +
            '<i class="icons '+JsonStr[i].icon+'"></i>' +
            '<span>' + JsonStr[i].name + '</span>' +
            '</a>';
        if (JsonStr[i].child.length > 0) {
            menuhtml = menuhtml + _childlist(JsonStr[i].child);
        }
        menuhtml = menuhtml + '</li>';
    }
    return menuhtml;
}

function _childlist(JsonStr) {
    var menuhtml = '<ul class="ej-nav">';
    for (var i = 0; i < JsonStr.length; i++) {
        menuhtml =
            menuhtml +
            '<li>' +
            '<a href="../../html/' + JsonStr[i].href + '">' + JsonStr[i].name + '</a>' +
            '</li>';
    }
    menuhtml = menuhtml + '</ul>';
    return menuhtml;
}