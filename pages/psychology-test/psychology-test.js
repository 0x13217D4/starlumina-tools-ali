Page({
  data: {
    scales: [
      {
        id: 'sas',
        name: '焦虑自评量表(SAS)',
        themeClass: '',
        description: '用于评估焦虑症状的严重程度',
        questionsCount: 20
      },
      {
        id: 'sds',
        name: '抑郁自评量表(SDS)',
        description: '用于评估抑郁症状的严重程度',
        questionsCount: 20
      },
      {
        id: 'scl90',
        name: '心理健康自评量表(SCL90)',
        description: '综合评估多种心理症状',
        questionsCount: 90
      },
      {
        id: 'bdi',
        name: 'Beck抑郁自评问卷(BDI)',
        description: '评估抑郁症状的严重程度',
        questionsCount: 21
      }
    ]
  },

  navigateToScale: function(e) {
    const scaleId = e.currentTarget.dataset.id;
    if (['sas', 'sds', 'scl90', 'bdi'].includes(scaleId)) {
      my.navigateTo({
        url: `/pages/psychology-test/${scaleId}/${scaleId}`
      });
    } else {
      my.showToast({
        content: '量表暂未开放',
        type: 'none'
      });
    }
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
  }
});