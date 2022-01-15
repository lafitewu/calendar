new Vue({
			el: '#app',
			data: function() {
				return {
					// 日历
					currentDay: 1, // 当前天
					currentMonth: 1, // 当前月
					currentYear: 1970,
					currentWeek: 0, // 一号所在的星期
					days: [], // 当月所有天数
					content: {},
					sign_days: [], // 签到日期
					is_sign: false,
					currentPlan: {},
					coverTurn: false,
					selectDay: '',
					globalObj: {
						morning: '',
						afternoon: '',
						night: ''
					},
					successTurn: false,
					sayingArr: [
						"如果世间无神渡你，那就双手合十，做自己的神。",
						"喧闹任其喧闹，自有我自为之，我自风情万种与世无争。",
						"一个人可以走很快，但是两个人走好像更有趣。",
						"这世上有一千种等待，最好的一种叫来日可期。",
						"如果我四十岁，我肯定不问世事。可我二十多岁，我心高气傲不想输。",
						"对于可控的事情要保持谨慎，对于不可控的事件要保持乐观。",
						"每一个不起眼的日子，都是你反败为胜的资本。",
						"别贪心，你不可能什么都有。别灰心，你不可能什么都没有。",
						"谋生的路上，不抛弃良知。谋爱的路上，不放弃尊严。",
						"只有熬过无人问津的日子，才会有诗和远方。",
						"和其光，同其尘，挫其锐，解起纷。",
						"本是青灯不归客，却因浊酒恋红尘。",
						"即使岁月磨我少年志，时光凉我善良心，总有人间一缕风，填我十万八千梦。",
						"年轻人，这世间哪有那么容易得到的万人之上。",
						"既然目标是地平线，留给世界的只能是背影。"
					]
				}
			},
			created: function() {
				this.getSign();
			},
			methods: {
				/**
				 * 获取签到日期
				 */
				getSign: function() {
					// 模拟数据
					var sign_days = [ {
						day: '2020/6/13',
						is_sign: 1
					}];
					var objs = JSON.parse(localStorage.getItem('dayArr'))
					this.sign_days = objs || sign_days;
					this.initData(null);
				},
				initData: function(cur) {
					var date;
					if (cur) { // 切换上一月、下一月
						date = new Date(cur);
					} else {
						var now = new Date(); // 此处取本机时间，应改为服务器时间
						var d = new Date(this.formatDate(now.getFullYear(), now.getMonth() + 1, 1));
						d.setDate(35); // 设置天数为35天（32~59都可以，既设置到下一个月的某一天）
						date = new Date(this.formatDate(d.getFullYear(), d.getMonth(), 1));
					}
					this.currentDay = new Date().getDate(); // 今日日期 几号
					this.currentYear = date.getFullYear(); // 当前年份
					this.currentMonth = date.getMonth() + 1; // 当前月份
					this.currentWeek = date.getDay(); // 当前月1号是星期几？ 0表示星期天
					// 当前月最后一天是星期几？ 0表示星期天
					this.nextWeek = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay();
					var str = this.formatDate(this.currentYear, this.currentMonth, 1); // 2020/01/01
					var nextStr = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleDateString(); // 2020/01/01
					// console.log(nextStr)
					this.days = []; // 初始化日期
					// 设置上一个月 需显示 的最后几天  铺满一周
					for (var i = this.currentWeek; i > 0; i--) {
						var d = new Date(str);
						d.setDate(d.getDate() - i);
						var dayobject = {
							day: d,
							isSign: this.isVerDate(d),
							isSigned: this.isSigned(d)
						}; // 用一个对象包装Date对象  以便为以后预定功能添加属性
						this.days.push(dayobject); // 将日期放入data 中的days数组 供页面渲染使用
					}
					// 显示当前月的天数  第二个循环为 j<= 36- this.currentWeek，
					// 因为1号是星期六的时候当前月需显示6行，如2020年8月
					this.num = 0; //第几个月 每遇到1号加1
					for (var j = 0; j <= 36 - this.currentWeek; j++) {
						var d = new Date(str);
						d.setDate(d.getDate() + j);
						var dddd = d.getDate();
						var dayobject = {
							day: d,
							isSign: this.isVerDate(d),
							isSigned: this.isSigned(d)
						};
						if (dddd == 1) {
							this.num++
						}
						if (this.num == 2) {
							break
						}
						this.days.push(dayobject);
					}
					// console.log('当前月1号是星期' + this.currentWeek)
					// console.log('当前月最后一天是星期' + this.nextWeek)
					// 设置下一个月 需显示 的最前几天铺满一周
					for (var k = 1; k <= 6 - this.nextWeek; k++) {
						var d = new Date(nextStr);
						d.setDate(d.getDate() + k);
						var dayobject = {
							day: d,
							isSign: this.isVerDate(d),
							isSigned: this.isSigned(d)
						}; // 用一个对象包装Date对象  以便为以后预定功能添加属性
						this.days.push(dayobject); // 将日期放入data 中的days数组 供页面渲染使用
					}
				},
				/**
				 * 判断该日期是否有任务
				 * @param d
				 * @returns {boolean}
				 */
				isVerDate: function(d) {
					var signdays = [];
					for (var i in this.sign_days) {
						signdays.push(this.sign_days[i].day);
					}
					return signdays.includes(d.toLocaleDateString());
				},
				/**
				 * 判断该日期是否有任务并且已完成
				 * @param d
				 * @returns {boolean}
				 */
				isSigned: function(d) {
					var signdays = [];
					for (var i in this.sign_days) {
						if (this.sign_days[i].is_sign) {
							signdays.push(this.sign_days[i].day);
						}
					}
					return signdays.includes(d.toLocaleDateString());
				},
				/**
				 * 上一月
				 * @param year
				 * @param month
				 */
				pickPre: function(year, month) {
					var d = new Date(this.formatDate(year, month, 1));
					d.setDate(0);
					this.initData(this.formatDate(d.getFullYear(), d.getMonth() + 1, 1));
				},
				/**
				 * 下一月
				 * @param year
				 * @param month
				 */
				pickNext: function(year, month) {
					var d = new Date(this.formatDate(year, month, 1));
					d.setDate(35);
					this.initData(this.formatDate(d.getFullYear(), d.getMonth() + 1, 1));
				},
				// 返回 类似 2020/01/01 格式的字符串
				formatDate: function(year, month, day) {
					// month < 10 && (month = '0' + month);
					month < 10 && (month = month);
					day < 10 && (day = day);
					// day < 10 && (day = '0' + day);
					var data = year + '/' + month + '/' + day;

					return data;
				},
				/**
				 * 点击日期查询
				 * @param index
				 */
				dayCheck: function(day) {
					var currentPlan = {
						date: '',
					};
					this.successTurn = false
					this.globalObj = {
						morning: '',
						afternoon: '',
						night: ''
					}
					currentPlan.date = day.day.toLocaleDateString().split('/')[1] + '月' + day.day.toLocaleDateString().split('/')[2] +
						'日';
					for (var i in this.days) {
						this.$set(this.days[i], 'isChecked', 0)
					}
					this.selectDay = day
					this.$set(day, 'isChecked', 1);
					let days = this.gedays(day.day)
					this.sign_days.map(item=> {
						if(item.day == days) {
							this.globalObj = item.datas
						}
					})
					this.currentPlan = currentPlan
				},
				// 获取日期
				gedays(day) {
					let currentDay = new Date(day).getDate(); // 今日日期 几号
					let currentYear = new Date(day).getFullYear(); // 当前年份
					let currentMonth = new Date(day).getMonth() + 1; // 当前月份
					return this.formatDate(currentYear,currentMonth,currentDay)
				},
				alertFn(day) {
					this.coverTurn = true
				},
				cancelFn() {
					this.coverTurn = false
				},
				notesSubmit() {
					let day= this.gedays(this.selectDay.day)
					let is_sign = 1
					let datas = this.globalObj
					var flag = true
					this.sign_days.map((item,index)=> {
						if(day == item.day) {
							flag = false
							this.sign_days.splice(index,1,{day,is_sign,datas})
						}
					})
					flag && this.sign_days.push({day,is_sign,datas})
					localStorage.setItem('dayArr', JSON.stringify(this.sign_days))
					this.getSign()
					this.globalObj = {
						morning: '',
						afternoon: '',
						night: ''
					}
					this.successTurn = true
					this.currentPlan = {}
				}
			}
		});
