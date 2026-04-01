const auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    themeMode: 'system', // 'system', 'light', 'dark'
    themeModeText: '跟随系统',
    themeClass: '',
    isCollected: false  // 是否已收藏
  },

  onLoad() {
    this.loadUserInfo()
    this.loadThemeMode()
    this.checkCollectedStatus()
  },

  onShow() {
    this.loadUserInfo()
    this.loadThemeMode()
    this.checkCollectedStatus()
  },
  
  // 检查收藏状态
  checkCollectedStatus() {
    if (!my.isCollected) {
      return
    }
    
    my.isCollected({
      success: (res) => {
        this.setData({ isCollected: res.isCollected })
      },
      fail: (err) => {
        console.error('检查收藏状态失败:', err)
      }
    })
  },
  
  // 引导收藏
  showCollectGuide() {
    if (this.data.isCollected) {
      my.showToast({
        content: '感谢您的收藏 ❤️',
        type: 'none'
      })
      return
    }
    
    my.confirm({
      title: '收藏小程序',
      content: '收藏后可在"我的小程序"中快速访问，是否收藏？',
      confirmText: '去收藏',
      cancelText: '暂不',
      success: (res) => {
        if (res.confirm) {
          // 提示用户手动收藏
          my.showToast({
            content: '请点击右上角"..."收藏',
            type: 'none',
            duration: 3000
          })
        }
      }
    })
  },

  onThemeChanged(theme) {
    // 当主题变化时，更新页面的主题类名
    this.updateThemeClass(theme)
  },

  loadUserInfo() {
    const userInfo = auth.getUserInfo()
    this.setData({ userInfo })
    this.loadThemeMode()
  },

  loadThemeMode() {
    const themeMode = my.getStorageSync('themeMode') || 'system'
    this.setData({ themeMode })
    this.updateThemeModeText(themeMode)
    
    // 获取实际的主题 - 优先使用应用级别的当前主题
    const app = getApp()
    let actualTheme = app.globalData.theme || 'light'
    
    // 如果应用级别没有主题信息，则按传统方式计算
    if (!actualTheme || actualTheme === 'light') {
      if (themeMode === 'system') {
        // 支付宝小程序不支持获取系统主题，默认使用浅色
        actualTheme = 'light'
      } else {
        actualTheme = themeMode
      }
    }
    
    // 更新页面主题类
    this.updateThemeClass(actualTheme)
    
    // 更新导航栏和 TabBar（无论什么模式都要更新）
    this.updateNavigationBarAndTabBar(actualTheme)
  },

  updateNavigationBarAndTabBar(theme) {
    // 设置导航栏
    if (my.setNavigationBar && typeof my.setNavigationBar === 'function') {
      my.setNavigationBar({
        frontColor: theme === 'dark' ? '#ffffff' : '#000000',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
      })
    }
    
    // 设置 TabBar
    if (my.setTabBarStyle && typeof my.setTabBarStyle === 'function') {
      my.setTabBarStyle({
        color: theme === 'dark' ? '#999999' : '#666666',
        selectedColor: theme === 'dark' ? '#09e765' : '#07C160',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        borderStyle: theme === 'dark' ? 'white' : 'black'
      })
    }
  },

  updateThemeModeText(themeMode) {
    let themeModeText = ''
    switch(themeMode) {
      case 'system':
        themeModeText = '跟随系统'
        break
      case 'light':
        themeModeText = '浅色模式'
        break
      case 'dark':
        themeModeText = '深色模式'
        break
    }
    this.setData({ themeModeText })
  },

  updateThemeClass(theme) {
    let themeClass = ''
    if (theme === 'dark') {
      themeClass = 'dark'
    } else {
      themeClass = ''
    }
    this.setData({ themeClass })
  },

  toggleTheme() {
    const items = ['跟随系统', '浅色模式', '深色模式']
    my.showActionSheet({
      items: items,
      success: (res) => {
        const modeIndex = res.index
        const modes = ['system', 'light', 'dark']
        const newMode = modes[modeIndex]
        
        // 更新存储和显示文本
        my.setStorageSync('themeMode', newMode)
        this.setData({ themeMode: newMode })
        this.updateThemeModeText(newMode)
        
        // 调用 App 的 switchTheme 方法
        const app = getApp()
        app.switchTheme(newMode)
        
        // 立即更新当前页面的主题类
        if (newMode === 'system') {
          // 支付宝小程序不支持获取系统主题，默认使用浅色
          this.updateThemeClass('light')
        } else {
          this.updateThemeClass(newMode)
          // 立即更新导航栏和 TabBar
          this.updateNavigationBarAndTabBar(newMode)
        }
      }
    })
  },

  // 清除缓存
  clearCache() {
    my.confirm({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          try {
            my.clearStorageSync()
            my.showToast({
              content: '清除成功',
              type: 'success'
            })
            setTimeout(() => {
              my.reLaunch({
                url: '/pages/mine/mine'
              })
            }, 1500)
          } catch (e) {
            my.showToast({
              content: '清除失败',
              type: 'none'
            })
          }
        }
      }
    })
  },

  // 关于小程序
  about() {
    my.navigateTo({
      url: '/pages/about/about'
    })
  },

  // 意见反馈
  feedback() {
    my.alert({
      title: '意见反馈',
      content: '如有问题或建议，请联系开发者'
    })
  },
  // 检查更新
  checkUpdate() {
    // 检查 API 是否可用
    if (!my.getUpdateManager) {
      my.showToast({
        content: '当前版本不支持检查更新',
        type: 'none'
      });
      return;
    }
    
    my.showLoading({
      content: '检查中...',
      delay: 0
    });
    
    const updateManager = my.getUpdateManager();
    
    updateManager.onCheckForUpdate((res) => {
      my.hideLoading();
      if (res.hasUpdate) {
        my.showToast({
          content: '发现新版本，正在下载...',
          type: 'none',
          duration: 2000
        });
      } else {
        my.showToast({
          content: '已是最新版本',
          type: 'success'
        });
      }
    });
    
    updateManager.onUpdateReady(() => {
      my.hideLoading();
      my.confirm({
        title: '更新提示',
        content: '新版本已准备好，是否立即重启应用？',
        confirmText: '立即重启',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
    
    updateManager.onUpdateFailed(() => {
      my.hideLoading();
      my.showToast({
        content: '更新下载失败，请稍后重试',
        type: 'none'
      });
    });
  },

  // 退出登录
  logout() {
    if (!auth.checkIsLoggedIn()) {
      my.showToast({
        content: '未登录',
        type: 'none'
      })
      return
    }

    my.confirm({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          auth.logout()
          my.showToast({
            content: '已退出登录',
            type: 'success'
          })
          setTimeout(() => {
            my.reLaunch({
              url: '/pages/mine/mine'
            })
          }, 1500)
        }
      }
    })
  },
  onShareAppMessage: function() {
    return {
      title: '设置',
      path: '/pages/settings/settings'
    }
  }
})
