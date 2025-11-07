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
    currentDate: new Date().toISOString().split('T')[0]
  },

  onLoad(options) {
    // 从URL参数中获取用户信息
    if (options.userInfo) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(options.userInfo))
        this.setData({ userInfo })
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }
  },

  chooseAvatar() {
    my.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.filePaths || res.apFilePaths
        if (tempFilePaths && tempFilePaths.length > 0) {
          this.setData({
            'userInfo.avatarUrl': tempFilePaths[0]
          })
        }
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
        my.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  },

  onChooseAvatar(e) {
    // 保留这个方法以防兼容性问题
    const { avatarUrl } = e.detail
    if (avatarUrl) {
      this.setData({
        'userInfo.avatarUrl': avatarUrl
      })
    }
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
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    prevPage.setData({
      userInfo: this.data.userInfo
    })
    my.setStorageSync({key: 'userInfo', data: this.data.userInfo})
    my.navigateBack()
  },
  
  onShareAppMessage: function() {
    return {
      title: '编辑个人信息',
      path: '/pages/mine/edit/edit',
      imageUrl: '/images/user.png'
    }
  }
})