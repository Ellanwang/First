/**
 * (c) Copyright 2017 XianGuan.HU. All Rights Reserved.
 * 2017-10-10
 * 服务器
 */
(function() {
    servername = "http://121.42.224.143:8080/HD";//"http://192.168.200.154:8080/"; //
	webserver = {
		timeoutflag: null,
		query: function(parameters, action, method, callback) {
			/*
			 * 延迟加在技术，1秒中最多请求两次     //此处取消，网页内自主连续请求，导致失败
			 */
			layer.ready(function() {
				var layerIndex = layer.msg('正在响应您的请求...', {
					icon: 16,
					shade: 0.3,
					time: 0
				});
				//			if(this.timeoutflag  !=  null) {          
				//				clearTimeout(this.timeoutflag);        
				//			}           
				//			this.timeoutflag = setTimeout(function() {
				//				webserver.doaction(parameters, action, method, callback, layerIndex);
				//			}, 500);
				webserver.doaction(parameters, action, method, callback, layerIndex);
			});
		},
		doaction: function(parameters, action, method, callback, layerIndex) {
			/**
			 * 此处运用 layer.ready(function(){})，为了增加用户体验，此处将主要功能包含在了提示框里面
			 * 但是有点主次颠倒之嫌，如日后此处引起问题，可将外层包裹的函数去掉
			 */
			/** action 拼接 userid token **/
			if(action.indexOf(apipath.user.login)) {
				var user = common.cookies.get("!@#2017hd_user");
				var token = common.cookies.get("!@#2017hd_token");
				var userId = common.cookies.get("!@#2017hd_userId");
				if(user && token && userId) {
					action = action + '?userId=' + userId + '&token=' + token;
				} else {
					layer.alert('此账号登录时间已过期，或在其他设备（地点）登录！', function() {
						window.location.href = '../../login.html';
					});
					return;
				}
			}

			if(method !== methods.search && method !== methods.patch) {
				if(parameters) {
					parameters = JSON.stringify(parameters);
				}
			}
			$.ajax({
				type: method,
				url: action,
				dataType: "json",
				data: parameters,
				contentType: "application/json",
                timeout:5000,
                success: function(data, textStatus, jqXHR) {
					if(data.status === 0) {
						if(data.data) {
							/**
							 *此处应该注意
							 *layerIndex，加载状态的提示框的index,防止
							 *loading长时间存在，处理完成后，程序可使用layer.close(layerIndex)
							 * 将其关闭
							 */
							callback(null, data.data, layerIndex);

						} else if(data.msg) {
							layer.msg(data.msg + "，即将刷新本页面！", {
								icon: 6,
								time: 1500,
								end: function() {
									window.location.reload();
								}
							});
						}else{
                            layer.close(layerIndex);
                            if(data.data==0){
                                callback(null, data.data, layerIndex);
                            }
						}
					} else {
						layer.msg(data.msg, {
							icon: 5
						});
					}
				},
				error: function(err) {
					layer.msg('请求出错！', {
						icon: 5
					});
				},
				//				complete: function() {
				//					setTimeout("if(index){layer.close(index);}", 450);
				//					layer.close(layerindex);//这里可以控制loading
				//				},
				//			beforeSend: function() {
				//
				//			}
			});
		}
	}

	methods = {
		edit: "PUT",
		delete: "DELETE",
		add: "POST",
		search: "GET",
		patch: "PATCH"
	}

	apipath = {
        weeklyplan:{
            plans:{
                list: servername +'/tasks/plans',
                add: servername +'/tasks/plans',
                addChild:servername +'/tasks/splitplans',
                delete: servername +'/tasks/plans/',
                edit:servername +'/tasks/plans/'
            },
            plansdetail:{
                list:servername+ '/tasks/plans/',
                delete:servername+ '/tasks/splitplans/',
                edit: servername +'/tasks/splitplans/',
                addmark:servername +'/tasks/spnotes/'
            }
        },
        supervise:{
            statistics: {
               // list: servername +'/tasks/inforate',
				list: servername +'/tasks/number',
            },
            tasks:{
                list: servername +'/tasks/infoes',
				add: servername +'/tasks/infoes',
				addChild:servername +'/tasks/splitinfoes',
				delete: servername +'/tasks/infoes/',
				edit:servername +'/tasks/infoes/'
			},
			tasksdetail:{
                list:servername+ '/tasks/infoes/',
				delete:servername+ '/tasks/splitinfoes/',
				edit: servername +'/tasks/splitinfoes/',
				addmark:servername +'/tasks/splitnotes/'
			}
		},
		server:{
			date:servername+'/other/time'
		},
		user: {
			login: servername + '/user/login',
			logout: servername + '/user/logout',
			menulist: servername + '/authorities/menulist',
			info: servername+'/user/unreadCounts'
		},
		meeting: {
			room: {
				single: servername + "/meeting/meetingRooms/",
				list: servername + "/meeting/meetingRooms",
				edit: servername + "/meeting/meetingRooms/",
				add: servername + "/meeting/meetingRooms",
				delete: servername + "/meeting/meetingRooms/",
			},
			equips: {
				list: servername + "/meeting/meetingEquips",
				edit: servername + "/meeting/meetingEquips/",
				delete: servername + "/meeting/meetingEquips/",
				add: servername + "/meeting/meetingEquips",
			},
			types: {
				list: servername + "/meeting/meetingTypes",
				edit: servername + "/meeting/meetingTypes/",
				delete: servername + "/meeting/meetingTypes/",
				add: servername + "/meeting/meetingTypes",
			},
			orderTimes: {
				list: servername + "/meeting/orderTimes"
			},
			orderDetail: {
				list: servername + "/meeting/orderTimes/"
			},
			preOrder: {
				list: servername + "/meeting/meetingOrders/",
				add: servername + "/meeting/meetingOrders"
			},
			order: {
				delete: servername + "/meeting/meetingOrders/",
				edit: servername + "/meeting/meetingOrders/",
				single: servername + "/meeting/meetingOrders/",
			},
			users: {
				list: servername + '/user/users'
			},
			dept: {
				list: servername + '/dept/depts'
			}
		},
		catering: {
			caterRoom: {
				single: servername + "/food/foodRooms/",
				list: servername + "/food/foodRooms",
				edit: servername + "/food/foodRooms/",
				delete: servername + "/food/foodRooms/",
				add: servername + "/food/foodRooms"
			},
			historyMenu: {
				list: servername + "/food/foodMenuVOs"
			},
			menuIndex: {
				add: servername + "/food/foodGuestOrders",
				edit: servername + "/food/foodGuestOrders/",
				delete: servername + "/food/foodGuestOrders/",
				list: servername + "/food/weekMenus",
				singleAdd: servername + "/food/foodOrders",
				singleDelete: servername + "/food/foodOrders/",
				singleList: servername + "/food/foodOrders",
				guestList: servername + "/food/foodGuestOrders/",
				editList: servername + "/food/foodGuestOrders/",

			},
			menuManagement: {
				list: servername + "/food/foodMenus",
				add: servername + "/food/foodMenus",
				single: servername + "/food/foodOrders"
			},
			roomBook: {
				single: servername + "/food/foodRooms/",
				list: servername + "/food/foodRooms",
				edit: servername + "/food/foodRooms/",
				delete: servername + "/food/foodRooms/",
				one: servername + "/food/foodRooms/",
				add: servername + "/food/foodRoomOrders",
				deleteOrder: servername+'/food/foodRoomOrders/' 
			},
		},
		cars: {
			carsVehicleItem: {
				add: servername + "/vehicles/maintainspros/"
			},
			carsVehicle: {
				list: servername + "/vehicles/maintains"
			},
			singleCarVehicle: {
				list: servername + "/vehicles/vemaintains/",
				edit: servername + "/vehicles/maintains/",
				delete: servername + "/vehicles/maintains/",
				add: servername + "/vehicles/maintains",
				single: servername + "/vehicles/maintains/"
			},
			carsOrderTimes: {
				list: servername + "/vehicles/orderscount"
			},
			singleCarAnnualInspection: {
				list: servername + "/vehicles/vechecks/",
				edit: servername + "/vehicles/checks/",
				delete: servername + "/vehicles/checks/",
				add: servername + "/vehicles/checks",
				single: servername + "/vehicles/checks/"
			},
			carsAnnualInspection: {
				list: servername + "/vehicles/checks",
			},
			carsBooking: {
				single: servername + "/vehicles/infoes/",
				singleOrder: servername + "/vehicles/veorders/",
				add: servername + "/vehicles/orders",
				edit: servername + "/vehicles/orders/",
				delete: servername + "/vehicles/orders/"
			},
			carsOrder: {
				list: servername + "/vehicles/orders",
				single: servername + "/vehicles/orders/",
				// delete: servername +"/vehicles/infoes/",
				// add:servername+ "/vehicles/infoes",
				// edit:servername+'/vehicles/infoes/'
			},
			carsManage: {
				list: servername + "/vehicles/infoes",
				delete: servername + "/vehicles/infoes/",
				add: servername + "/vehicles/infoes",
				edit: servername + '/vehicles/infoes/',
				single: servername + '/vehicles/infoes/'
			},
			carsInsurance: {
				list: servername + "/vehicles/insurances",
			},
			singleCarInsurance: {
				list: servername + "/vehicles/veinsurances/",
				delete: servername + "/vehicles/insurances/",
				add: servername + "/vehicles/insurances",
				edit: servername + "/vehicles/insurances/",
				single: servername + "/vehicles/insurances/"
			},
			carInsurance: {
				add: servername + "/vehicles/insurancespro/"
			},
			InsuranceItem: {
				list: servername + "/vehicles/insurances",
				add: servername + '/vehicles/insurancespro',
			},
			drivers: {
				list: servername + "/vehicles/drivers",
                orderlist: servername + "/my/driverOrders",
                start: servername + "/my/driverOrders/",
				end: servername + "/my/driverOverOrders/",
			},
			carsLog: {
				list: servername + "/vehicles/orderscount/"
			}
		},
		goods: {
			goods: {
				list: servername + "/goods/goods",
				del: servername + "/goods/goods/",
				goodsUp: servername + "/goods/goods/",
				goodsPut: servername + "/goods/goods/",
				add: servername + "/goods/goodsIn",
				goodsName:servername + "/goods/goodsNames",
				goodsSearch: servername + "/goods/goods/",
			},
			types: { //物品类型列表
				list: servername + "/goods/goodsTypes",
				add: servername + "/goods/goodsTypes",
				del: servername + "/goods/goodsTypes/",
				det: servername + "/goods/goodsTypes/",
			},
			// 固定资产统计
			AssetStatistics: {
				list: servername + "/goods/goodsAssetsStatistics",
				assetTypeList: servername + "/goods/goodsAssetsTypes",  //固定资产的类型
				asset_type_add: servername + "/goods/goodsAssetsTypes",  //增加类型
				asset_type_del: servername + "/goods/goodsAssetsTypes/",  //删除资产类型
				asset_type_detail: servername + "/goods/goodsAssetsTypes/",  //修改资产类型
			},
			//固定资产管理
			assetGuanli: {
				list: servername + "/goods/goodsAssets",
				add: servername + "/goods/goodsAssets",
				delete: servername + "/goods/goodsAssets/",
				put: servername + "/goods/goodsAssets/",
			},
			goodsStorage: { //物品入库
				list: servername + "/goods/goodsIn",
			},
			goodsReceive: { //物品领取
				list: servername + "/goods/goodsOut",
			},
			dept: { //部门
				list: servername + "/dept/depts",
			},
			Scrap: { //报废
				list: servername + "/goods/goodsScraps/",
				add: servername + "/goods/goodsScraps",
			},
			goods_user:{
				list: servername + "/user/users",
			}
		},
		rules: {
			ruleIndex: {
				list: servername + "/regime/regimes",
				add: servername + "/regime/regimes",
				delete: servername + "/regime/regimes/",
				single: servername + "/regime/regimes/",
				edit: servername + "/regime/regimes/"
			},
			ruleUpload: {
				upload: servername + "/regime/upload"
			},
			ruleType: {
				list: servername + "/compType/compTypes",
				single: servername + "/regime/comps/",
				add: servername + "/compType/compTypes",
				edit: servername + "/compType/compTypes/",
				delete: servername + "/compType/compTypes/"
			}

		},
		contact: {
			contactList: {
				list: servername + "/contacts/contacts",
				add: servername + "/contacts/contacts",
				delete: servername +"/contacts/contacts/",
				edit: servername +"/contacts/contacts/",
				single: servername +"/contacts/contacts/"
			},
			deptList: {
				list: servername + "/dept/depts"
			},
			exportBtn: {
				output: servername + "/contacts/export"
			},
			importBtn: {
				input: servername + "/contacts/import"
			}

		},
		informations: {
			informations: {
				list: servername + "/informatization/infoChecks",
			},
			declaring: {
				list: servername + "/informatization/infoApps",
				add: servername + "/informatization/infoApps",
				edit: servername + "/informatization/infoApps/",
				delete: servername + "/informatization/infoApps/",
				single: servername + "/informatization/infoApps/"
			},
			handling: {
				list: servername + "/informatization/infoChecks",
				add: servername + "/informatization/infoChecks",
				edit: servername + "/informatization/infoChecks/",
				single: servername + "/informatization/infoChecks/",
				toDo: servername + "/informatization/infoAppsGo/"
			}
		},
		my: {
			scrapped: {
				list: servername + '/my/goodsScraps',
				delete: servername + '/my/goodsScraps/',
				edit: servername + '/my/goodsScraps/',
			},
			scrappedCheck: {
				list: servername + '/my/goodsScrapChecks',
				edit: servername + '/my/goodsScrapChecks/',
			},
			cars: {
				list: servername + '/my/carOrders',
			},
			meeting: {
				list: servername + "/my/meetingOrders",
			},
			food:{
				list:servername+'/my/foodOrders'
			}
		},
		tasks: {
			taskIndex: {
				list: servername + "/tasks/infoes",
				add: servername + "/tasks/infoes",
				listId: servername + "/tasks/infoes/",
				subAdd: servername + "/tasks/splitinfoes"
			},
		},
		users: {
			userIndex:{
				list: servername + "/user/users",
				add: servername + "/user/users",
				single : servername + "/user/users/",
				delete : servername + "/user/users/",
				edit : servername + "/user/users/",
				roleList: servername + "/authorities/rolenames",
			},
			modifyUser:{
				edit: servername + "/user/users/",
				single: servername + "/user/users/"
			},
			notice:{
				list: servername + "/user/messages",
				edit: servername + "/user/messages/"
			}
		},
		admin:{
			department:{
				list: servername + "/dept/depts",
				add: servername + "/dept/depts",
				del: servername + "/dept/depts/",
				put: servername + "/dept/depts/",
			},
			 role:{
				del: servername + "/authorities/roles/",
				put: servername + "/authorities/roles/",
				menus:servername + "/authorities/allmenus",
				add:servername + "/authorities/roles",
                list: servername + "/authorities/allmenulist"
			}
		},
		budget:{
            add: servername + "/budget/budgets/",
            list: servername + "/budget/budgets/",
			check: servername + "/budget/checkBudgets/"
		}
	}
})(jQuery);