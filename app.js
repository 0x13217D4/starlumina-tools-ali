// app.js
App({
  onLaunch() {
    // 检查小程序更新
    this.checkForUpdate();

    // 展示本地存储能力
    const logs = my.getStorageSync({ key: 'logs' }).data || []
    logs.unshift(Date.now())
    my.setStorageSync({
      key: 'logs',
      data: logs
    })

    // 登录
    my.getAuthCode({
      success: res => {
        // 发送 res.authCode 到后台换取 openId, sessionKey, unionId
      }
    })
  },

  // 检查更新方法
  checkForUpdate() {
    try {
      const updateManager = my.getUpdateManager();
      
      // 监听向支付宝后台请求检查更新结果事件
      updateManager.onCheckForUpdate(function (res) {
        console.log('是否有新版本：', res.hasUpdate);
      });

      // 监听小程序有版本更新事件
      updateManager.onUpdateReady(function () {
        my.confirm({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              // 新版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate();
            }
          },
          fail: function() {
            console.log('更新确认弹窗显示失败');
          }
        });
      });

      // 监听小程序更新失败事件
      updateManager.onUpdateFailed(function () {
        console.log('新版本下载失败');
        my.showToast({
          type: 'fail',
          content: '更新失败，请稍后重试',
          duration: 2000
        });
      });
    } catch (error) {
      console.log('更新管理器初始化失败：', error);
      // 兼容处理：如果当前环境不支持更新管理器，静默失败
    }
  },

  globalData: {
    userInfo: null,
    theme: 'light'
  }
})