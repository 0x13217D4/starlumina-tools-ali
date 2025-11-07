const tools = [
  {
    category: '查询测评',
    tools: [
      {
        name: '身份证核验',
        path: '/pages/id-verify/id-verify'
      },
      {
        name: 'MBTI性格测试',
        path: '/pages/mbti/mbti'
      },
      {
        name: '心理测评量表',
        path: '/pages/psychology-test/psychology-test'
      },
      {
        name: '反应力测试',
        path: '/pages/reaction-test/reaction-test'
      },
      {
        name: '时间屏幕',
        path: '/pages/time-screen/time-screen'
      }
    ]
  },
  {
    category: '信息处理',
    tools: [
      {
        name: '条码生成器',
        path: '/pages/barcode/barcode'
      },
      {
        name: '二维码生成器',
        path: '/pages/qrcode/qrcode'
      },
      {
        name: '扫一扫',
        path: '/pages/scan/scan'
      },
      {
        name: '图片压缩',
        path: '/pages/image-compress/image-compress'
      },
    ]
  },
  {
    category: '设备测试',
    tools: [
      {
        name: '设备信息',
        path: '/pages/deviceinfo/deviceinfo'
      },
      {
        name: '屏幕显示测试',
        path: '/pages/screentest/screentest'
      },
      {
        name: '多指触控测试',
        path: '/pages/multitouch/multitouch'
      },
      {
        name: '传感器',
        path: '/pages/sensor/sensor'
      },
      {
        name: '指南针',
        path: '/pages/compass/compass'
      },
    ]
  },
  {
    category: '转换工具',
    tools: [
      {
        name: '随机数生成',
        path: '/pages/random/random'
      },
      {
        name: '进制转换器',
        path: '/pages/converter/converter'
      },
      {
        name: '单位转换器',
        path: '/pages/unit-converter/unit-converter'
      },
      {
        name: '计算器',
        path: '/pages/calculator/calculator'
      }
    ]
  },
  {
    category: '益智娱乐',
    tools: [
      {
        name: '24点游戏',
        path: '/pages/24point/24point'
      }
    ]
  },
]

Page({
  onShareAppMessage() {
    return {
      title: '星芒集盒 - 实用工具集',
      desc: '实用工具集合小程序',
      path: '/pages/tools/tools'
    }
  },
  
  data: {
    toolCategories: tools
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
            type: 'none',
            content: '无法打开页面',
            duration: 2000
          })
        }
      })
    }
  }
})