Page({
  onShareTimeline: function() {
    return {
      title: '星芒集盒 - 关于',
      imageUrl: '/images/logo.jpg'
    }
  },
  data: {
    year: new Date().getFullYear()
  },
  navigateToPrivacy() {
    my.navigateTo({
      url: '/pages/privacy/privacy'
    })
  },

  contactUs() {
    my.setClipboard({
      text: 'huhuangchenglin@petalmail.com',
      success: () => {
        my.showToast({
          type: 'success',
          content: '邮箱已复制',
          duration: 2000
        })
      }
    })
  },
  
  onShareAppMessage: function() {
    return {
      title: '关于星芒集盒',
      path: '/pages/about/about',
      imageUrl: '/images/logo.jpg'
    }
  }
})