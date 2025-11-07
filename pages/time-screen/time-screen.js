Page({
  data: {
    currentTime: '',
    isServerTime: true,
    loading: false,
    timeSource: '服务器时间',
    isLandscape: false,
    hasInitialized: false
  },

  onLoad: function() {
    // 默认获取服务器时间
    this.getServerTime();
    this.timer = setInterval(() => {
      if (this.data.isServerTime) {
        this.getServerTime();
      } else {
        this.updateTime();
      }
    }, 1000);
    
    // 初始检测屏幕方向
    this.checkScreenOrientation();
    
    // 启动设备方向监听
    this.startDeviceMotionListening();
    
    // 检测横竖屏变化
    my.onWindowResize((res) => {
      const newIsLandscape = res.size.windowWidth > res.size.windowHeight;
      if (this.data.isLandscape !== newIsLandscape) {
        this.setData({
          isLandscape: newIsLandscape
        });
        console.log('屏幕方向变化:', newIsLandscape ? '横屏' : '竖屏');
      }
    });
  },

  // 检查屏幕方向
  checkScreenOrientation: function() {
    try {
      const windowInfo = my.getWindowInfo();
      const isLandscape = windowInfo.windowWidth > windowInfo.windowHeight;
      this.setData({
        isLandscape: isLandscape
      });
      console.log('初始屏幕方向:', isLandscape ? '横屏' : '竖屏');
    } catch (error) {
      console.warn('获取窗口信息失败:', error);
      // 使用默认值
      this.setData({
        isLandscape: false
      });
    }
  },

  startDeviceMotionListening: function() {
    // 检查设备方向权限
    my.getSetting({
      success: (res) => {
        if (res.authSetting['scope.deviceOrientation']) {
          this.doStartDeviceMotionListening();
        } else {
          // 请求设备方向权限
          my.authorize({
            scope: 'scope.deviceOrientation',
            success: () => {
              this.doStartDeviceMotionListening();
            },
            fail: (error) => {
              console.warn('设备方向权限被拒绝:', error);
              my.showToast({
                type: 'none',
                content: '需要设备方向权限才能自动检测横屏',
                duration: 2000
              });
            }
          });
        }
      },
      fail: (error) => {
        console.warn('获取设置失败:', error);
        // 尝试直接启动监听
        this.doStartDeviceMotionListening();
      }
    });
  },

  doStartDeviceMotionListening: function() {
    my.startDeviceMotionListening({
      interval: 'normal',
      success: (res) => {
        console.log('设备方向监听启动成功:', res);
        // 监听设备方向变化
        my.onDeviceMotionChange((res) => {
          this.handleDeviceMotionChange(res);
        });
      },
      fail: (error) => {
        console.error('设备方向监听启动失败:', error);
        if (error.error === 1001) {
          my.showToast({
            type: 'none',
            content: '当前设备不支持方向检测',
            duration: 2000
          });
        } else {
          my.showToast({
            type: 'none',
            content: '设备方向监听启动失败',
            duration: 2000
          });
        }
      }
    });
  },

  handleDeviceMotionChange: function(res) {
    // 根据设备方向判断横竖屏
    // 这里使用简单的角度判断，可以根据实际需要调整
    const { alpha, beta, gamma } = res;
    
    // beta: 设备绕X轴旋转的角度 (-180 到 180)
    // gamma: 设备绕Z轴旋转的角度 (-90 到 90)
    
    let isLandscape = false;
    
    if (Math.abs(gamma) > 45) {
      // 设备侧倾，可能是横屏
      isLandscape = true;
    } else if (Math.abs(beta) < 30 || Math.abs(beta) > 150) {
      // 设备平放或倒置，保持当前状态
      return;
    }
    
    // 更新横竖屏状态
    if (this.data.isLandscape !== isLandscape) {
      this.setData({
        isLandscape: isLandscape
      });
      
      console.log('设备方向检测:', isLandscape ? '横屏' : '竖屏');
      
      // 显示提示
      my.showToast({
        type: 'none',
        content: isLandscape ? '已切换到横屏模式' : '已切换到竖屏模式',
        duration: 1000
      });
    }
  },

  updateTime: function() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    this.setData({
      currentTime: `${hours}:${minutes}:${seconds}`
    });
  },

  getServerTime: function() {
    // 只在首次获取或手动切换时显示loading，定时更新时不显示
    const showLoading = !this.data.hasInitialized;
    
    if (showLoading) {
      this.setData({ loading: true });
    }
    
    my.getServerTime({
      success: (res) => {
        const serverDate = new Date(res.time);
        const hours = serverDate.getHours().toString().padStart(2, '0');
        const minutes = serverDate.getMinutes().toString().padStart(2, '0');
        const seconds = serverDate.getSeconds().toString().padStart(2, '0');
        
        this.setData({
          currentTime: `${hours}:${minutes}:${seconds}`,
          loading: false,
          hasInitialized: true
        });
      },
      fail: (error) => {
        console.error('获取服务器时间失败:', error);
        
        // 只在首次获取失败时显示错误提示
        if (!this.data.hasInitialized) {
          my.showToast({
            type: 'none',
            content: '获取服务器时间失败，切换为本地时间',
            duration: 2000
          });
        }
        
        // 失败时切换回本地时间
        this.setData({
          isServerTime: false,
          timeSource: '本地时间',
          loading: false,
          hasInitialized: true
        });
        this.updateTime();
      }
    });
  },

  toggleTimeSource: function() {
    const newIsServerTime = !this.data.isServerTime;
    this.setData({
      isServerTime: newIsServerTime,
      timeSource: newIsServerTime ? '服务器时间' : '本地时间',
      hasInitialized: false // 重置初始化状态，让切换时显示loading
    });
    
    if (newIsServerTime) {
      this.getServerTime();
    } else {
      this.updateTime();
    }
  },

  timeFormat: function(time, fmt = 'YYYY-MM-DD hh:mm:ss') {
    const dte = new Date(time);
    function getYearWeek(date) {
      var date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      var date2 = new Date(date.getFullYear(), 0, 1);

      //获取1月1号星期（以周一为第一天，0周一~6周日）
      var dateWeekNum = date2.getDay() - 1;
      if (dateWeekNum < 0) {
        dateWeekNum = 6;
      }
      if (dateWeekNum < 4) {
        // 前移日期
        date2.setDate(date2.getDate() - dateWeekNum);
      } else {
        // 后移日期
        date2.setDate(date2.getDate() + 7 - dateWeekNum);
      }
      var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
      if (d < 0) {
        var date3 = new Date(date1.getFullYear() - 1, 11, 31);
        return getYearWeek(date3);
      } else {
        // 得到年数周数
        var year = date1.getFullYear();
        var week = Math.ceil((d + 1) / 7);
        return week;
      }
    }

    var o = {
      'M+': dte.getMonth() + 1, // 月份
      'D+': dte.getDate(), // 日
      'h+': dte.getHours(), // 小时
      'm+': dte.getMinutes(), // 分
      's+': dte.getSeconds(), // 秒
      'q+': Math.floor((dte.getMonth() + 3) / 3), // 季度
      S: dte.getMilliseconds(), // 毫秒
      'W+': getYearWeek(dte), // 周数
    };
    if (/(Y+)/.test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        (dte.getFullYear() + '').substr(4 - RegExp.$1.length)
      );
    for (var k in o)
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
        );
      }
    return fmt;
  },

  onUnload: function() {
    clearInterval(this.timer);
    // 停止设备方向监听
    this.stopDeviceMotionListening();
  },

  stopDeviceMotionListening: function() {
    try {
      my.stopDeviceMotionListening({
        success: () => {
          console.log('设备方向监听已停止');
        },
        fail: (error) => {
          console.warn('停止设备方向监听失败:', error);
        }
      });
    } catch (error) {
      console.warn('停止设备方向监听异常:', error);
    }
  },

  // 检查设备方向权限
  checkDeviceOrientationPermission: function() {
    my.getSetting({
      success: (res) => {
        if (res.authSetting['scope.deviceOrientation']) {
          this.doStartDeviceMotionListening();
        } else {
          // 请求设备方向权限
          my.authorize({
            scope: 'scope.deviceOrientation',
            success: () => {
              this.doStartDeviceMotionListening();
            },
            fail: (error) => {
              console.warn('设备方向权限被拒绝:', error);
              my.showToast({
                type: 'none',
                content: '需要设备方向权限才能自动检测横屏',
                duration: 2000
              });
            }
          });
        }
      },
      fail: (error) => {
        console.warn('获取设置失败:', error);
        // 尝试直接启动监听
        this.doStartDeviceMotionListening();
      }
    });
  },

  // 执行启动设备方向监听
  doStartDeviceMotionListening: function() {
    my.startDeviceMotionListening({
      interval: 'normal', // 使用normal间隔以获得更好的平衡
      success: (res) => {
        console.log('设备方向监听启动成功:', res);
        // 监听设备方向变化
        my.onDeviceMotionChange((res) => {
          this.handleDeviceMotionChange(res);
        });
      },
      fail: (error) => {
        console.error('启动设备方向监听失败:', error);
        if (error.error === 1001) {
          my.showToast({
            type: 'none',
            content: '当前设备不支持方向检测',
            duration: 2000
          });
        } else {
          my.showToast({
            type: 'none',
            content: '设备方向监听启动失败',
            duration: 2000
          });
        }
      }
    });
  },

  // 处理设备方向变化
  handleDeviceMotionChange: function(res) {
    const { alpha, beta, gamma } = res;
    
    // 根据设备方向判断横竖屏
    // 这里使用更精确的判断逻辑
    let isLandscape = false;
    
    // 方法1: 使用gamma值（设备绕Z轴旋转）
    // gamma > 45 或 < -45 通常表示横屏
    if (Math.abs(gamma) > 45) {
      isLandscape = true;
    }
    
    // 方法2: 使用beta值（设备绕X轴旋转）作为辅助判断
    // beta接近0或180表示平放，接近90或270表示竖立
    // 如果beta在30-60度或120-150度之间，可能是横屏
    if (beta > 30 && beta < 60) {
      isLandscape = true;
    } else if (beta > 120 && beta < 150) {
      isLandscape = true;
    }
    
    // 更新横竖屏状态
    if (this.data.isLandscape !== isLandscape) {
      this.setData({
        isLandscape: isLandscape
      });
      
      console.log('设备方向检测:', isLandscape ? '横屏' : '竖屏');
      
      // 显示提示
      my.showToast({
        type: 'none',
        content: isLandscape ? '已切换到横屏模式' : '已切换到竖屏模式',
        duration: 1000
      });
    }
  },

  onShareAppMessage: function() {
    return {
      title: '时间屏幕 - 星芒集盒',
      path: '/pages/time-screen/time-screen'
    }
  }
})