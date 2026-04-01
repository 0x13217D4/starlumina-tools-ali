const defaultAvatarUrl = '/images/user.png'

Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      gender: 0, // 0-保密 1-男 2-女
      birthday: ''
    },
    genderRange: ['保密', '男', '女'],
    defaultAvatarUrl: defaultAvatarUrl,
    currentDate: new Date().toISOString().split('T')[0],
    eventChannel: null,  // 存储事件通道引用
    themeClass: ''  // 主题类名
  },

  onLoad(options) {
    // 优先从本地存储加载用户信息（登录后的用户信息）
    let userInfo = my.getStorageSync({ key: 'userInfo' })
    if (userInfo && typeof userInfo === 'object' && userInfo.data !== undefined) {
      userInfo = userInfo.data
    }
    if (userInfo) {
      this.setData({ userInfo })
    }

    // 同时保留事件通道，用于其他场景传递数据
    const eventChannel = this.getOpenerEventChannel()
    this.setData({ eventChannel })
    eventChannel.on('sendUserInfo', (data) => {
      this.setData({ userInfo: data })
    })

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
    if (themeMode === 'system') {
      // 支付宝小程序不支持获取系统主题，默认使用浅色
      this.updateThemeClass('light')
    } else {
      this.updateThemeClass(themeMode)
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

  onUnload() {
    // 清理事件通道监听器
    if (this.data.eventChannel) {
      this.data.eventChannel.off('sendUserInfo');
    }
  },

  // 获取支付宝用户头像和昵称
  getAlipayUserInfo() {
    my.getOpenUserInfo({
      success: (res) => {
        try {
          const userData = JSON.parse(res.response).response || {}
          const avatarUrl = userData.avatar || this.data.userInfo.avatarUrl
          const nickName = userData.nickName || userData.userName || this.data.userInfo.nickName
          
          this.setData({
            'userInfo.avatarUrl': avatarUrl,
            'userInfo.nickName': nickName
          })
          
          my.showToast({
            content: '获取成功',
            type: 'success'
          })
        } catch (e) {
          console.error('解析用户信息失败:', e)
          my.showToast({
            content: '获取失败，请手动填写',
            type: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('获取支付宝用户信息失败:', err)
        my.showToast({
          content: '获取失败，请手动填写',
          type: 'none'
        })
      }
    })
  },

  // 选择头像（从相册选择）
  onChooseAvatar() {
    my.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: (res) => {
        const avatarUrl = res.apFilePaths[0]
        this.setData({
          'userInfo.avatarUrl': avatarUrl
        })
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
      }
    })
  },

  onNicknameChange(e) {
    this.setData({
      'userInfo.nickName': e.detail.value
    })
  },

  onGenderChange(e) {
    this.setData({
      'userInfo.gender': e.detail.value
    })
  },

  onBirthdayChange(e) {
    this.setData({
      'userInfo.birthday': e.detail.value
    })
  },

  saveProfile() {
    // 保存用户信息
    my.setStorageSync({ key: 'userInfo', data: this.data.userInfo })
    
    my.showToast({
      content: '保存成功',
      type: 'success'
    })
    
    // 延迟返回
    setTimeout(() => {
      my.navigateBack()
    }, 500)
  },
  
  onShareAppMessage: function() {
    return {
      title: '编辑个人信息',
      path: '/pages/mine/edit/edit',
      imageUrl: '/images/user.png'
    }
  }
})