const defaultAvatarUrl = '/images/user.png'

Page({
  onShareTimeline: function() {
    return {
      title: '星芒集盒 - 我的',
      imageUrl: '/images/mine.png'
    }
  },
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      gender: 0,
      birthday: ''
    },
    defaultAvatarUrl: defaultAvatarUrl,
    genderText: ['未知', '男', '女']
  },

  onLoad() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = my.getStorageSync({ key: 'userInfo' }).data
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  editProfile() {
    // 将用户信息通过URL参数传递
    const userInfoStr = encodeURIComponent(JSON.stringify(this.data.userInfo))
    my.navigateTo({
      url: `/pages/mine/edit/edit?userInfo=${userInfoStr}`
    })
  },

  aboutApp() {
    my.navigateTo({
      url: '/pages/about/about'
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
    my.setStorageSync({
      key: 'userInfo',
      data: this.data.userInfo
    })
  },
  
  onShareAppMessage: function() {
    return {
      title: '个人中心',
      path: '/pages/mine/mine',
      imageUrl: this.data.userInfo.avatarUrl || '/images/user.png'
    }
  }
})