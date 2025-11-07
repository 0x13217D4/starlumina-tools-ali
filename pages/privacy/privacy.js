Page({
  onShareTimeline: function() {
    return {
      title: '星芒集盒 - 隐私政策',
      imageUrl: '/images/logo.jpg'
    }
  },
  
  onShareAppMessage: function() {
    return {
      title: '星芒集盒隐私政策',
      path: '/pages/privacy/privacy',
      imageUrl: '/images/logo.jpg'
    }
  }
})