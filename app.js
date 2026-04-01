// app.js
App({
  globalData: {
    userInfo: null,
    theme: 'light',
    themeMode: 'system', // 'system', 'light', 'dark'
  },

  onLaunch() {
    try {
      // 初始化深色模式
      this.initThemeMode()

      // 监听内存不足告警
      this.setupMemoryWarningListener()

      // 展示本地存储能力
      let logs = my.getStorageSync('logs')
      if (!Array.isArray(logs)) {
        logs = []
      }
      logs.unshift(Date.now())
      my.setStorageSync('logs', logs)

      // 登录 - 支付宝使用 getAuthCode
      my.getAuthCode({
        scopes: ['auth_base'],
        success: res => {
          // 发送 res.authCode 到后台换取 userId
          console.log('登录成功，authCode:', res.authCode)
        },
        fail: err => {
          console.error('登录失败:', err)
        }
      })
    } catch (error) {
      console.error('应用启动错误:', error)
    }
  },

  // 设置内存不足告警监听器
  setupMemoryWarningListener() {
    if (my.onMemoryWarning && typeof my.onMemoryWarning === 'function') {
      my.onMemoryWarning((res) => {
        console.warn('内存不足告警!', res)
        
        // 内存告警等级说明（仅Android）：
        // 5: TRIM_MEMORY_RUNNING_MODERATE - 内存中度紧张
        // 10: TRIM_MEMORY_RUNNING_LOW - 内存低
        // 15: TRIM_MEMORY_RUNNING_CRITICAL - 内存严重不足
        
        const level = res.level
        let message = '内存不足，请关闭部分功能'
        
        if (level === 5) {
          message = '内存稍紧张，建议释放部分资源'
        } else if (level === 10) {
          message = '内存不足，建议关闭部分功能'
        } else if (level === 15) {
          message = '内存严重不足，请立即关闭部分功能'
        }
        
        // 显示告警提示
        my.showToast({
          type: 'none',
          content: message,
          duration: 3000
        })
        
        // 触发全局内存清理事件
        this.notifyMemoryWarning(res)
      })
      console.log('已注册内存不足告警监听器')
    }
  },

  // 通知所有页面内存不足
  notifyMemoryWarning(res) {
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.onMemoryWarning) {
        page.onMemoryWarning(res)
      }
    })
  },
  
  // 监听页面切换
  onPageNotFound(options) {
    console.log('页面未找到:', options)
  },

  // 重置到系统主题（只在切换到跟随系统模式时调用）
  resetToSystemTheme() {
    // 获取当前系统主题，设置对应的样式
    my.getSystemInfo({
      success: (res) => {
        const systemTheme = res.theme || 'light'
        this.applySystemThemeUI(systemTheme)
      },
      fail: () => {
        this.applySystemThemeUI('light')
      }
    })
  },

  // 应用系统主题的 UI 样式
  applySystemThemeUI(theme) {
    // 设置 TabBar
    if (my.setTabBarStyle && typeof my.setTabBarStyle === 'function') {
      my.setTabBarStyle({
        color: theme === 'dark' ? '#999999' : '#666666',
        selectedColor: theme === 'dark' ? '#09e765' : '#07C160',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        borderStyle: theme === 'dark' ? 'white' : 'black'
      })
    }
    
    // 设置导航栏
    if (my.setNavigationBar && typeof my.setNavigationBar === 'function') {
      my.setNavigationBar({
        frontColor: theme === 'dark' ? '#ffffff' : '#000000',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
      })
    }
  },

  // 初始化深色模式
  initThemeMode() {
    const themeMode = my.getStorageSync('themeMode') || 'system'
    this.globalData.themeMode = themeMode
    
    if (themeMode === 'system') {
      // 跟随系统 - 支付宝通过 getSystemInfo 获取主题信息
      this.getSystemThemeAndApply()
      // 设置系统主题监听器
      this.setupSystemThemeListener()
    } else {
      // 强制使用指定模式 - 手动设置所有样式
      this.applyManualTheme(themeMode)
    }
  },

  // 获取系统主题并应用
  getSystemThemeAndApply() {
    my.getSystemInfo({
      success: (res) => {
        // 支付宝 10.1.92+ 支持 theme 字段
        const systemTheme = res.theme || 'light'
        console.log('获取到系统主题:', systemTheme)
        this.applySystemTheme(systemTheme)
      },
      fail: () => {
        this.applySystemTheme('light')
      }
    })
  },

  // 设置系统主题监听器
  setupSystemThemeListener() {
    // 支付宝 10.1.92+ 支持 onThemeChange 监听系统主题变化
    if (my.onThemeChange && typeof my.onThemeChange === 'function') {
      // 移除旧的监听器（避免重复注册）
      if (this.themeChangeCallback) {
        try {
          my.offThemeChange(this.themeChangeCallback)
        } catch (e) {
          console.log('移除旧监听器失败:', e)
        }
      }
      
      // 创建新的监听回调
      this.themeChangeCallback = (res) => {
        console.log('系统主题变化:', res.theme)
        // 只有在跟随系统模式下才响应变化
        if (this.globalData.themeMode === 'system') {
          this.applySystemTheme(res.theme)
        }
      }
      
      // 注册监听器
      my.onThemeChange(this.themeChangeCallback)
      console.log('已注册系统主题监听器')
    } else {
      console.log('当前支付宝版本不支持系统主题监听')
    }
  },
  
  // 应用系统主题
  applySystemTheme(systemTheme) {
    const theme = systemTheme || 'light'
    this.globalData.theme = theme
    
    console.log('应用系统主题:', theme)
    
    // 更新导航栏和TabBar样式以匹配系统主题
    this.updateSystemUIStyles(theme)
    
    this.notifyAllPagesThemeChanged(theme)
  },

  // 应用手动主题
  applyManualTheme(themeMode) {
    const theme = themeMode === 'dark' ? 'dark' : 'light'
    this.globalData.theme = theme
    
    console.log('应用手动主题:', theme)
    
    if (my.setTabBarStyle && typeof my.setTabBarStyle === 'function') {
      my.setTabBarStyle({
        color: theme === 'dark' ? '#999999' : '#666666',
        selectedColor: theme === 'dark' ? '#09e765' : '#07C160',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        borderStyle: theme === 'dark' ? 'white' : 'black'
      })
    }
    
    if (my.setNavigationBar && typeof my.setNavigationBar === 'function') {
      my.setNavigationBar({
        frontColor: theme === 'dark' ? '#ffffff' : '#000000',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
      })
    }
    
    this.notifyAllPagesThemeChanged(theme)
  },

  // 通知所有页面主题已变化
  notifyAllPagesThemeChanged(theme) {
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (page.onThemeChanged) {
        page.onThemeChanged(theme)
      }
    })
  },

  // 切换主题（供页面调用）
  switchTheme(themeMode) {
    my.setStorageSync('themeMode', themeMode)
    this.globalData.themeMode = themeMode
    
    if (themeMode === 'system') {
      // 跟随系统：先清除手动设置
      this.resetToSystemTheme()
      
      // 获取当前系统主题并应用
      this.getSystemThemeAndApply()
      
      // 设置系统主题监听器
      this.setupSystemThemeListener()
    } else {
      // 手动模式：移除系统监听，强制设置所有样式
      if (this.themeChangeCallback) {
        try {
          my.offThemeChange(this.themeChangeCallback)
        } catch (e) {
          console.log('移除监听器失败:', e)
        }
      }
      this.applyManualTheme(themeMode)
    }
  },

  // 获取当前主题模式
  getThemeMode() {
    return this.globalData.themeMode
  },

  // 获取当前主题
  getTheme() {
    return this.globalData.theme
  },
  
  // 更新系统UI样式（导航栏和TabBar）
  updateSystemUIStyles(theme) {
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
  }
})