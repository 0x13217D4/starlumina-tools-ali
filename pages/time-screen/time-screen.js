Page({
  data: {
    currentTime: '',
    serverTimeOffset: 0,  // 服务器时间与本地时间的偏移量
    lastSyncTime: 0       // 上次同步服务器时间的时间戳
  },

  onLoad: function() {
    // 先同步服务器时间
    this.syncServerTime();
    // 每10秒同步一次服务器时间
    this.syncTimer = setInterval(() => {
      this.syncServerTime();
    }, 10000);
    // 每16毫秒更新一次显示（约60fps，适合毫秒级显示）
    this.updateTimer = setInterval(() => {
      this.updateTime();
    }, 16);
  },

  // 同步服务器时间
  syncServerTime: function() {
    if (!my.getServerTime) {
      // API 不可用时使用本地时间
      return;
    }
    
    const localBeforeSync = Date.now();
    my.getServerTime({
      success: (res) => {
        const localAfterSync = Date.now();
        // 计算网络延迟，取中间值
        const networkDelay = (localAfterSync - localBeforeSync) / 2;
        const localTimeAtServerResponse = localBeforeSync + networkDelay;
        // 计算偏移量：服务器时间 - 本地时间
        this.setData({
          serverTimeOffset: res.time - localTimeAtServerResponse,
          lastSyncTime: localAfterSync
        });
      },
      fail: (err) => {
        console.error('获取服务器时间失败:', err);
      }
    });
  },

  updateTime: function() {
    const now = new Date(Date.now() + this.data.serverTimeOffset);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    this.setData({
      currentTime: `${hours}:${minutes}:${seconds}.${milliseconds}`
    });
  },

  onUnload: function() {
    clearInterval(this.syncTimer);
    clearInterval(this.updateTimer);
  },

  onShareAppMessage: function() {
    return {
      title: '时间屏幕 - 星芒集盒',
      path: '/pages/time-screen/time-screen'
    }
  }
})