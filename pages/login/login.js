Page({
  data: {
    loading: false,
    themeClass: '',
    agreedToPrivacy: false  // 是否同意用户协议和隐私政策
  },

  onLoad() {
    // 检查是否已经登录
    this.checkLoginStatus()
    this.loadThemeMode()
  },

  onShow() {
    this.loadThemeMode()
  },

  onThemeChanged(theme) {
    this.updateThemeClass(theme)
  },

  loadThemeMode() {
    const themeMode = my.getStorageSync('themeMode') || 'system'
    let actualTheme
    if (themeMode === 'system') {
      // 支付宝小程序不支持获取系统主题，默认使用浅色
      actualTheme = 'light'
    } else {
      actualTheme = themeMode
    }
    
    // 更新页面主题类
    this.updateThemeClass(actualTheme)
    
    // 更新导航栏样式
    this.updateNavigationBar(actualTheme)
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
  
  updateNavigationBar(theme) {
    // 设置导航栏
    if (my.setNavigationBar && typeof my.setNavigationBar === 'function') {
      my.setNavigationBar({
        frontColor: theme === 'dark' ? '#ffffff' : '#000000',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
      })
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    let userInfo, token, loginTime
    
    try {
      // 支付宝小程序 getStorageSync 支持 key 参数
      userInfo = my.getStorageSync({ key: 'userInfo' })
      token = my.getStorageSync({ key: 'token' })
      loginTime = my.getStorageSync({ key: 'loginTime' })
      
      // 如果返回的是对象格式，提取 data 字段
      if (userInfo && typeof userInfo === 'object' && userInfo.data !== undefined) {
        userInfo = userInfo.data
      }
      if (token && typeof token === 'object' && token.data !== undefined) {
        token = token.data
      }
      if (loginTime && typeof loginTime === 'object' && loginTime.data !== undefined) {
        loginTime = loginTime.data
      }
    } catch (e) {
      console.error('读取登录状态失败:', e)
    }
    
    // 检查登录是否有效：需要 userInfo、token，且登录时间在7天内
    const TOKEN_EXPIRE_DAYS = 7
    const isValidLogin = userInfo && token && loginTime && 
      (Date.now() - loginTime < TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000)
    
    if (isValidLogin) {
      // 已登录且有效，返回上一页或跳转到个人中心
      my.navigateBack({
        delta: 1,
        fail: () => {
          my.switchTab({
            url: '/pages/mine/mine'
          })
        }
      })
    }
  },

  // 切换协议同意状态
  toggleAgreement() {
    this.setData({
      agreedToPrivacy: !this.data.agreedToPrivacy
    })
  },

  // 打开用户协议
  openUserAgreement() {
    my.navigateTo({
      url: '/pages/about/about?type=userAgreement'
    })
  },

  // 打开隐私政策
  openPrivacyPolicy() {
    my.navigateTo({
      url: '/pages/about/about?type=privacyPolicy'
    })
  },

  // 点击登录按钮
  onGetUserInfo(e) {
    // 先检查是否同意了协议
    if (!this.data.agreedToPrivacy) {
      my.showToast({
        content: '请先同意用户协议和隐私政策',
        type: 'none',
        duration: 2000
      })
      return
    }

    // 直接模拟登录成功
    this.mockLoginSuccess()
  },

  // 模拟登录成功
  mockLoginSuccess() {
    this.setData({ loading: true })

    // 直接使用默认用户信息登录
    // 用户可以在个人中心编辑信息
    const userData = {
      avatarUrl: '/images/user.png',
      nickName: '支付宝用户',
      gender: 0,
      birthday: ''
    }

    // 存储用户信息 - 支付宝小程序使用对象格式
    try {
      my.setStorageSync({ key: 'userInfo', data: userData })
      my.setStorageSync({ key: 'token', data: 'mock_token_' + Date.now() })
      my.setStorageSync({ key: 'loginTime', data: Date.now() })
      
      console.log('登录数据已保存:', userData)
      
      // 验证是否保存成功
      const saved = my.getStorageSync({ key: 'userInfo' })
      console.log('验证保存:', saved)
    } catch (e) {
      console.error('保存登录数据失败:', e)
    }

    this.setData({ loading: false })

    my.showToast({
      content: '登录成功',
      type: 'success',
      duration: 1500
    })

    // 延迟跳转
    setTimeout(() => {
      // 返回上一页或跳转到个人中心
      my.navigateBack({
        delta: 1,
        fail: () => {
          my.switchTab({
            url: '/pages/mine/mine'
          })
        }
      })
    }, 1500)
  }
})