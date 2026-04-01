const auth = require('../../utils/auth')

const allTools = [
  {
    category: '查询测评',
    tools: [
      {
        name: '身份证核验',
        path: '/pages/id-verify/id-verify',
        icon: '??',
        description: '验证身份证号码的有效性和真实性'
      },
      {
        name: 'MBTI性格测试',
        path: '/pages/mbti/mbti',
        icon: '🧠',
        description: '了解你的性格类型和职业倾向'
      },
      {
        name: '心理测评量表',
        path: '/pages/psychology-test/psychology-test',
        icon: '📊',
        description: '专业的心理健康评估工具'
      },
      {
        name: '反应力测试',
        path: '/pages/reaction-test/reaction-test',
        icon: '⚡',
        description: '测试你的反应速度和手眼协调'
      },
      {
        name: '时间屏幕',
        path: '/pages/time-screen/time-screen',
        icon: '⏰',
        description: '显示当前时间和日期信息'
      }
    ]
  },
  {
    category: '信息处理',
    tools: [
      {
        name: '条码生成器',
        path: '/pages/barcode/barcode',
        icon: '📱',
        description: '生成各种格式的条形码'
      },
      {
        name: '二维码生成器',
        path: '/pages/qrcode/qrcode',
        icon: '📲',
        description: '快速生成二维码，支持文本和链接'
      },
      {
        name: '扫一扫',
        path: '/pages/scan/scan',
        icon: '📷',
        description: '扫描二维码和条形码'
      },
      {
        name: '图片压缩',
        path: '/pages/image-compress/image-compress',
        icon: '🖼️',
        description: '压缩图片大小，节省存储空间'
      },
      {
        name: '白板',
        path: '/pages/whiteboard/whiteboard',
        icon: '🎨',
        description: '自由绘画、记笔记的 draft笔记的画板工具'
      },
    ]
  },
  {
    category: '设备测试',
    tools: [
      {
        name: '设备信息',
        path: '/pages/deviceinfo/deviceinfo',
        icon: '📱',
        description: '查看设备详细信息和参数'
      },
      {
        name: '屏幕显示测试',
        path: '/pages/screentest/screentest',
        icon: '🖥️',
        description: '测试屏幕显示效果和坏点'
      },
      {
        name: '多指触控测试',
        path: '/pages/multitouch/multitouch',
        icon: '👆',
        description: '测试多点触控功能'
      },
      {
        name: '传感器',
        path: '/pages/sensor/sensor',
        icon: '📡',
        description: '检测设备传感器状态'
      },
      {
        name: '指南针',
        path: '/pages/compass/compass',
        icon: '🧭',
        description: '精确的方向定位工具'
      },
    ]
  },
  {
    category: '转换工具',
    tools: [
      {
        name: '随机数生成',
        path: '/pages/random/random',
        icon: '🎲',
        description: '生成指定范围的随机数字'
      },
      {
        name: '进制转换器',
        path: '/pages/converter/converter',
        icon: '🔢',
        description: '二进制、八进制、十进制、十六进制转换'
      },
      {
        name: '单位转换器',
        path: '/pages/unit-converter/unit-converter',
        icon: '📏',
        description: '长度、重量、温度等单位转换'
      }
    ]
  },
  {
    category: '益智娱乐',
    tools: [
      {
        name: '24点游戏',
        path: '/pages/24point/24point',
        icon: '??',
        description: '经典的数学益智游戏'
      },
      {
        name: '五子棋',
        path: '/pages/gomoku/gomoku',
        icon: '⚫',
        description: '经典的双人对弈游戏，支持人机对战'
      },
      {
        name: '炸金花',
        path: '/pages/zjh/zjh',
        icon: '🃏',
        description: '经典扑克牌游戏，体验刺激的验牌乐趣',
        requireLogin: true
      }
    ]
  },
]

// 根据登录状态过滤工具
function filterToolsByLoginStatus(isLoggedIn) {
  return allTools.map(category => ({
    ...category,
    tools: category.tools.filter(tool => !tool.requireLogin || isLoggedIn)
  }))
}

Page({
  onShareTimeline: function() {
    return {
      title: '星芒集盒 - 实用工具集',
      imageUrl: '/images/tools.png'
    }
  },
  data: {
    toolCategories: [],
    isLargeScreen: false,
    themeClass: '',
    isLoggedIn: false
  },

  navigateToTool(e) {
    const categoryIndex = e.currentTarget.dataset.categoryIndex
    const toolIndex = e.currentTarget.dataset.toolIndex
    const tool = this.data.toolCategories[categoryIndex].tools[toolIndex]
    
    if (tool.getDeviceInfo) {
      tool.getDeviceInfo()
    } else {
      // 确保路径以/开头
      // 确保路径格式正确
      const path = tool.path.startsWith('/pages/') ? tool.path : 
                  tool.path.startsWith('pages/') ? `/${tool.path}` : 
                  `/pages/${tool.path}`;
      my.navigateTo({
        url: path,
        success: () => console.log('导航成功:', path),
        fail: (err) => {
          console.error('导航失败:', err)
          my.showToast({
            content: '无法打开页面',
            type: 'none'
          })
        }
      })
    }
  },
  
  onShareAppMessage: function() {
    return {
      title: '星芒集盒 - 实用工具集合',
      path: '/pages/tools/tools',
      imageUrl: '/images/logo.jpg'
    }
  },

  onLoad() {
    // 获取系统信息判断屏幕大小
    // 支付宝小程序使用 my.getSystemInfo
    my.getSystemInfo({
      success: (res) => {
        // 检查是否为鸿蒙系统，进行相应适配
        if (res.platform === 'ohos') {
          console.log('当前运行在鸿蒙系统上');
        }
        
        this.setData({
          isLargeScreen: res.windowWidth > 768
        });
      }
    });
    
    // 检查登录状态并过滤工具列表
    this.updateToolList();
    
    this.loadThemeMode();
  },

  onShow() {
    // 每次显示页面时更新工具列表（登录状态可能已改变）
    this.updateToolList()
    this.loadThemeMode()
  },

  // 更新工具列表（根据登录状态过滤）
  updateToolList() {
    const isLoggedIn = auth.checkIsLoggedIn()
    const filteredTools = filterToolsByLoginStatus(isLoggedIn)
    this.setData({
      isLoggedIn,
      toolCategories: filteredTools
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

  updateThemeClass(theme) {
    let themeClass = ''
    if (theme === 'dark') {
      themeClass = 'dark'
    } else {
      themeClass = ''
    }
    this.setData({ themeClass })
  }
})
