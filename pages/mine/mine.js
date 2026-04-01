const defaultAvatarUrl = '/images/user.png'
const auth = require('../../utils/auth.js')

Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      avatarUrl: '',
      nickName: '',
      gender: 0,
      birthday: ''
    },
    defaultAvatarUrl: defaultAvatarUrl,
    genderText: ['未知', '男', '女'],
    themeClass: ''
  },

  onLoad() {
    this.checkLoginStatus()
    this.loadThemeMode()
  },

  onShow() {
    this.checkLoginStatus()
    this.loadThemeMode()
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
    
    console.log('登录状态检查:', { userInfo, token, loginTime })
    
    // 检查登录是否有效：需要 userInfo、token，且登录时间在7天内
    const TOKEN_EXPIRE_DAYS = 7
    const isValidLogin = userInfo && token && loginTime && 
      (Date.now() - loginTime < TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000)
    
    console.log('是否有效登录:', isValidLogin)
    
    if (!isValidLogin) {
      // 清除过期的登录信息
      try {
        my.removeStorageSync({ key: 'userInfo' })
        my.removeStorageSync({ key: 'token' })
        my.removeStorageSync({ key: 'loginTime' })
      } catch (e) {
        console.error('清除登录信息失败:', e)
      }
    }
    
    this.setData({ 
      isLoggedIn: !!isValidLogin,
      userInfo: isValidLogin ? userInfo : { avatarUrl: '', nickName: '', gender: 0, birthday: '' }
    })
  },

  // 跳转到登录页面
  goToLogin() {
    my.navigateTo({
      url: '/pages/login/login'
    })
  },

  onThemeChanged(theme) {
    this.updateThemeClass(theme)
  },

  loadThemeMode() {
    const themeMode = my.getStorageSync('themeMode') || 'system'
    this.setData({ themeMode })
    
    // 获取实际的主题 - 优先使用应用级别的当前主题
    const app = getApp()
    let actualTheme = app.globalData.theme || 'light'
    
    // 如果应用级别没有主题信息，则按传统方式计算
    if (!actualTheme || actualTheme === 'light') {
      if (themeMode === 'system') {
        // 支付宝暂不支持系统主题检测，默认使用浅色
        actualTheme = 'light'
      } else {
        actualTheme = themeMode
      }
    }
    
    // 更新页面主题类
    this.updateThemeClass(actualTheme)
    
    // 更新导航栏和 TabBar
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

  updateThemeClass(theme) {
    let themeClass = ''
    if (theme === 'dark') {
      themeClass = 'dark'
    } else {
      themeClass = ''
    }
    this.setData({ themeClass })
  },

  loadUserInfo() {
    const userInfo = my.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  // 点击用户区域
  onUserAreaTap() {
    if (this.data.isLoggedIn) {
      // 已登录，跳转到编辑页面
      my.navigateTo({
        url: '/pages/mine/edit/edit'
      })
    } else {
      // 未登录，跳转到登录页面
      my.navigateTo({
        url: '/pages/login/login'
      })
    }
  },

  editUserInfo() {
    // 检查用户是否登录
    const userInfo = my.getStorageSync('userInfo')
    const token = my.getStorageSync('token')
    
    if (!userInfo || !token) {
      // 未登录，跳转到登录页面
      my.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      // 已登录，跳转到编辑个人信息页面
      my.navigateTo({
        url: '/pages/mine/edit/edit'
      })
    }
  },

  aboutApp() {
    my.navigateTo({
      url: '/pages/about/about'
    })
  },

  goToSettings() {
    my.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    })
    this.saveUserInfo()
  },

  saveUserInfo() {
    my.setStorageSync('userInfo', this.data.userInfo)
  }
})