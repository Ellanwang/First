 /**
 * (c) Copyright 2017 XianGuan.HU. All Rights Reserved.
 * 2017-10-10
 * 用户个人信息
 */
(function () {
    personal = {
        initialization: function () {
            var userId=common.cookies.get("!@#2017hd_userId");
            var userPass=common.cookies.get("!@#2017hd_userPass");
            if(userId){
                $('#userName').val(userId);
                if(userPass) {
                    $('#userPass').val(userPass);
                    $('#re').attr('checked','true')
                }
            }
            /*登录按钮*/
            $('.btn-login').click(function (){
                var params={
                    "account": $('#userName').val(),
                    "password": md5($('#userPass').val()).toLocaleLowerCase()
                };
                personal.login(params);
            });
            $("body").keydown(function() {
                if (event.keyCode == "13") {//keyCode=13是回车键
                    $('.btn-login').click();
                }
            });
        },
        callback_login: function (err, data ,layerIndex) {
            common.cookies.set("!@#2017hd_user",data.user);
            common.cookies.set("!@#2017hd_token",data.token);
            common.cookies.set("!@#2017hd_userId",data.userId);
            if($('#re').attr('checked'))
            {
                common.cookies.set("!@#2017hd_userPass",$('#userPass').val());
            }else{
                common.cookies.delete("!@#2017hd_userPass");
            }
            layer.close(layerIndex);
            layer.msg('登录成功，正在跳转...', {icon: 6,shade:0.3,time:1200},function(){
                window.location.href='html/my/myMeeting.html';
            });
        },
        login: function (params) {
            webserver.query(params, apipath.user.login, methods.add, personal.callback_login);
        }
    }
})(jQuery);