Page({
  data: {
    isListening: false,
    direction: 0,
    displayDirection: 0, // 用于显示的方向角度，实现平滑过渡
    directionText: '北'
  },

  onLoad() {
    // 页面加载时自动启动指南针
    this.startCompass();
  },

  startCompass() {
    if (this.data.isListening) {
      return;
    }

    my.startCompass({
      interval: 'ui',
      success: () => {
        this.setData({ isListening: true });
        my.onCompassChange(this.handleCompassChange.bind(this));
        my.showToast({
          type: 'success',
          content: '指南针已启动',
          duration: 1000
        });
      },
      fail: (error) => {
        console.error('启动指南针失败:', error);
        my.showToast({
          type: 'none',
          content: '启动失败，请检查设备支持',
          duration: 2000
        });
      }
    });
  },

  stopCompass() {
    if (!this.data.isListening) {
      return;
    }

    my.stopCompass();
    my.offCompassChange(this.handleCompassChange.bind(this));
    this.setData({ 
      isListening: false
    });
    my.showToast({
      type: 'success',
      content: '指南针已停止',
      duration: 1000
    });
  },

  handleCompassChange(res) {
    const direction = res.direction || 0;
    const directionText = this.getDirectionText(direction);
    const displayDirection = this.getOptimizedDisplayDirection(direction);

    this.setData({
      direction: direction,
      displayDirection: displayDirection,
      directionText: directionText
    });
  },

  // 获取优化的显示方向，解决359°到0°的大圈旋转问题
  getOptimizedDisplayDirection(newDirection) {
    const currentDisplay = this.data.displayDirection || 0;
    
    // 计算角度差
    let diff = newDirection - currentDisplay;
    
    // 将角度差标准化到 [-180, 180] 范围
    while (diff > 180) {
      diff -= 360;
    }
    while (diff < -180) {
      diff += 360;
    }
    
    // 计算新的显示角度
    let newDisplay = currentDisplay + diff;
    
    // 标准化到 [0, 360) 范围
    while (newDisplay >= 360) {
      newDisplay -= 360;
    }
    while (newDisplay < 0) {
      newDisplay += 360;
    }
    
    return newDisplay;
  },

  getDirectionText(direction) {
    // 将方向角度转换为文字描述
    const normalizedDirection = ((direction % 360) + 360) % 360;
    
    if (normalizedDirection >= 337.5 || normalizedDirection < 22.5) {
      return '北';
    } else if (normalizedDirection >= 22.5 && normalizedDirection < 67.5) {
      return '东北';
    } else if (normalizedDirection >= 67.5 && normalizedDirection < 112.5) {
      return '东';
    } else if (normalizedDirection >= 112.5 && normalizedDirection < 157.5) {
      return '东南';
    } else if (normalizedDirection >= 157.5 && normalizedDirection < 202.5) {
      return '南';
    } else if (normalizedDirection >= 202.5 && normalizedDirection < 247.5) {
      return '西南';
    } else if (normalizedDirection >= 247.5 && normalizedDirection < 292.5) {
      return '西';
    } else if (normalizedDirection >= 292.5 && normalizedDirection < 337.5) {
      return '西北';
    }
    return '北';
  },


  calibrateCompass() {
    my.showToast({
      type: 'none',
      content: '请水平旋转设备进行校准',
      duration: 3000
    });
  },

  onUnload() {
    if (this.data.isListening) {
      this.stopCompass();
    }
  },

  onShareAppMessage() {
    return {
      title: '指南针 - 星芒集盒',
      path: '/pages/compass/compass',
      imageUrl: '/images/tools.png'
    };
  }
});