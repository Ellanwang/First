/**
 *
 (c) Copyright 2017 XianGuan.HU. All Rights Reserved.
 2017-10-10
 分页类，修改请说明
 */
(function () {
    pagination = {
        /**
         * 初始化，暂不支持完全自定义，有需求可以扩展
         * total：数据总数
         * rows_count：每页展示的条数
         * currentPage：当前页
         * class_callback：分页回调
         **/
        Initialization: function (total, rows_count, currentPage, class_callback) {
            //设置分页
            $("#pagination").pagination({
                currentPage: currentPage,
                totalPage: Math.ceil(total / rows_count),
                isShow: true,
                count: 5,
                homePageText: "首页",
                endPageText: "尾页",
                prevPageText: "上一页",
                nextPageText: "下一页",
                callback: function (current) {
                    class_callback(current);
                }
            });
            // if(total===0){
            //     layer.msg('当前无数据', {
            //         icon: 5
            //     });
            // }
        },
        /**
         * 每个功能每页显示的记录条数，在这里配置
         **/
        view_book_rows_count: 8,
        manage_rows_count: 8,
        orderDetail_rows_count: 12,
        attendList_rows_count: 1000,//无限制
        deptDropList_rows_count: 1000,//无限制
        carsLog_rows_count:15,
        carsInsurance_rows_count: 7,
        singleCarInsurance_rows_count: 8,
        carsManage_rows_count:15,
        carsOrder_rows_count:10,
        carsAnnualInspection_rows_count:7,
        singleCarAnnualInspection_rows_count:8,
        carsVehicle_rows_count:7,
        singleCarVehicle_rows_count:8,
         /**catering界面分页**/
   		parlor_management_rows_count:12,//包间管理界面分页
   		menu_history_rows_count:10,//历史菜单界面分页
   		room_book_rows_count:7, //包间预订列表

        //goods
        goodsType_rows_count:8,
        goods_rows_count:16,   //物品管理显示的条数，暂定2为了演示，应该是14
        goods_zichan_rows_count: 12,
        goods_user_rows_count:12,
        goods_lingqu_rows_count:8,//物品领取页面每页显示的条数

        //rules
        rules_rows_count:8,
        //contact
        contact_rows_count:17,
        //
        informations_rows_count:15,
        declaring_rows_count:6,
        handling_rows_count:6,

        Scrapped_rows_count:6,
        scrappedCheck_rows_count:6,
        myCars_rows_count:6,
        myMeeting_rows_count:6,
        myTrips_rows_count:6,
        task_rows_count: 6,
        plan_rows_count:6,
        users_rows_count: 15,
        roleDropList_rows_count: 1000,//无限制

        budget_personal_rows_count:12
    }
})(jQuery);
