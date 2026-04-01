Page({
  data: {
    touchPoints: [],
    currentPoints: 0,
    maxPoints: 0,
    themeClass: ''
  },
  onLoad: function(options) {
    this.loadThemeMode();
    this.setData({
      touchPoints: []
    });
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
      // 支付宝暂不支持系统主题检测
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
  
  handleTouchStart: function(e) {
    const touches = e.touches;
    this.setData({
      currentPoints: touches.length,
      maxPoints: Math.max(this.data.maxPoints, touches.length)
    });
    
    // 支付宝使用 my.createSelectorQuery
    const query = my.createSelectorQuery();
    query.select('.container').boundingClientRect();
    query.exec((res) => {
      if (res && res[0]) {
        const rect = res[0];
        const newTouchPoints = touches.map(touch => ({
          id: touch.identifier,
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        }));
        this.setData({
          touchPoints: newTouchPoints
        });
      }
    });
  },
  
  handleTouchMove: function(e) {
    // 支付宝使用 my.createSelectorQuery
    const query = my.createSelectorQuery();
    query.select('.container').boundingClientRect();
    query.exec((res) => {
      if (res && res[0]) {
        const rect = res[0];
        const touches = e.touches;
        const newTouchPoints = touches.map(touch => ({
          id: touch.identifier,
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        }));
        this.setData({
          touchPoints: newTouchPoints,
          currentPoints: touches.length
        });
      }
    });
  },
  
  handleTouchEnd: function() {
    this.setData({
      touchPoints: [],
      currentPoints: 0
    });
  }
});