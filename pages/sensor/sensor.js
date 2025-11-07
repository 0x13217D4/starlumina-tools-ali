// 传感器管理器
class SensorManager {
  constructor() {
    this.isListening = false;
    this.accelerometerCallback = null;
    this.gyroscopeCallback = null;
  }

  // 检查传感器权限
  async checkSensorPermission() {
    return new Promise((resolve) => {
      my.getSetting({
        success: (res) => {
          // 支付宝小程序中传感器权限通常不需要单独授权
          // 但可以检查系统级权限
          resolve(true);
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  }

  // 启动加速度计
  startAccelerometer() {
    return new Promise((resolve, reject) => {
      my.startAccelerometer({
        interval: 'ui',
        success: () => {
          this.isListening = true;
          resolve();
        },
        fail: (error) => {
          console.error('启动加速度计失败:', error);
          reject(error);
        }
      });
    });
  }

  // 启动陀螺仪
  startGyroscope() {
    return new Promise((resolve, reject) => {
      my.startGyroscope({
        interval: 'ui',
        success: () => {
          resolve();
        },
        fail: (error) => {
          console.error('启动陀螺仪失败:', error);
          reject(error);
        }
      });
    });
  }

  // 停止加速度计
  stopAccelerometer() {
    my.stopAccelerometer();
    if (this.accelerometerCallback) {
      my.offAccelerometerChange(this.accelerometerCallback);
      this.accelerometerCallback = null;
    }
  }

  // 停止陀螺仪
  stopGyroscope() {
    my.stopGyroscope();
    if (this.gyroscopeCallback) {
      my.offGyroscopeChange(this.gyroscopeCallback);
      this.gyroscopeCallback = null;
    }
  }

  // 监听加速度计变化
  onAccelerometerChange(callback) {
    this.accelerometerCallback = callback;
    my.onAccelerometerChange(callback);
  }

  // 监听陀螺仪变化
  onGyroscopeChange(callback) {
    this.gyroscopeCallback = callback;
    my.onGyroscopeChange(callback);
  }

  // 停止所有传感器
  stopAll() {
    this.stopAccelerometer();
    this.stopGyroscope();
    this.isListening = false;
  }
}

// 数据格式化工具
const DataFormatter = {
  formatAxisValue(value) {
    return value.toFixed(2);
  },

  resetSensorData() {
    return {
      x: 0,
      y: 0,
      z: 0,
      xFormatted: '0.00',
      yFormatted: '0.00',
      zFormatted: '0.00',
      gx: 0,
      gy: 0,
      gz: 0,
      gxFormatted: '0.00',
      gyFormatted: '0.00',
      gzFormatted: '0.00'
    };
  }
};

// UI交互工具
const UIHelper = {
  showToast(title, icon = 'success', duration = 1000) {
    my.showToast({
      title,
      icon,
      duration
    });
  },

  showErrorMessage(message) {
    this.showToast(message, 'none', 2000);
  },

  // 显示权限引导
  showAuthGuide() {
    my.showModal({
      title: '权限提示',
      content: '传感器功能需要设备支持，请确保设备传感器功能正常',
      showCancel: false,
      confirmText: '知道了'
    });
  }
};

Page({
  data: {
    isListening: false,
    ...DataFormatter.resetSensorData(),
    lastTimestamp: 0,
    startTime: 0,
    deviceSupport: true
  },

  sensorManager: null,

  onLoad() {
    this.sensorManager = new SensorManager();
    this.setData({
      startTime: Date.now()
    });
    this.checkDeviceSupport();
  },

  // 检查设备支持
  async checkDeviceSupport() {
    try {
      // 检查基础库版本
      const systemInfo = my.getSystemInfoSync();
      const appBaseInfo = my.getAppBaseInfoSync();
      
      // 检查是否支持传感器API
      if (appBaseInfo.version < '1.24.9') {
        this.setData({ deviceSupport: false });
        UIHelper.showErrorMessage('当前支付宝版本不支持传感器功能');
        return;
      }

      // 检查传感器权限
      const hasPermission = await this.sensorManager.checkSensorPermission();
      if (!hasPermission) {
        this.setData({ deviceSupport: false });
        UIHelper.showAuthGuide();
        return;
      }

      this.setData({ deviceSupport: true });
    } catch (error) {
      console.error('设备支持检查失败:', error);
      this.setData({ deviceSupport: false });
      UIHelper.showErrorMessage('设备不支持传感器功能');
    }
  },

  // 启动传感器监听
  async startSensorListening() {
    if (this.data.isListening) {
      return;
    }

    if (!this.data.deviceSupport) {
      UIHelper.showErrorMessage('设备不支持传感器功能');
      return;
    }

    try {
      // 启动加速度计
      await this.sensorManager.startAccelerometer();
      
      // 启动陀螺仪
      await this.sensorManager.startGyroscope();
      
      // 设置监听回调
      this.sensorManager.onAccelerometerChange(this.handleAccelerometerChange.bind(this));
      this.sensorManager.onGyroscopeChange(this.handleGyroscopeChange.bind(this));
      
      this.setData({ isListening: true });
      UIHelper.showToast('传感器已启动');
      
    } catch (error) {
      console.error('启动传感器失败:', error);
      let errorMessage = '启动失败';
      
      // 根据错误码提供更具体的错误信息
      if (error.error === 11) {
        errorMessage = '设备不支持加速度计';
      } else if (error.error === 12) {
        errorMessage = '设备不支持陀螺仪';
      } else if (error.error === 13) {
        errorMessage = '传感器权限被拒绝';
      }
      
      UIHelper.showErrorMessage(errorMessage + '，请检查设备支持');
    }
  },

  // 停止传感器监听
  stopSensorListening() {
    if (!this.data.isListening) {
      return;
    }

    this.sensorManager.stopAll();
    this.setData({ 
      isListening: false,
      lastTimestamp: 0
    });
    UIHelper.showToast('传感器已停止');
  },

  // 处理加速度计数据变化
  handleAccelerometerChange(res) {
    const updateData = {
      x: res.x,
      y: res.y,
      z: res.z,
      xFormatted: DataFormatter.formatAxisValue(res.x),
      yFormatted: DataFormatter.formatAxisValue(res.y),
      zFormatted: DataFormatter.formatAxisValue(res.z),
      lastTimestamp: Date.now()
    };
    
    this.setData(updateData);
  },

  // 处理陀螺仪数据变化
  handleGyroscopeChange(res) {
    const updateData = {
      gx: res.x,
      gy: res.y,
      gz: res.z,
      gxFormatted: DataFormatter.formatAxisValue(res.x),
      gyFormatted: DataFormatter.formatAxisValue(res.y),
      gzFormatted: DataFormatter.formatAxisValue(res.z)
    };
    
    this.setData(updateData);
  },

  // 重置数据
  resetData() {
    const resetData = {
      ...DataFormatter.resetSensorData(),
      lastTimestamp: 0,
      startTime: Date.now()
    };
    
    this.setData(resetData);
    UIHelper.showToast('数据已重置');
  },

  // 页面卸载时清理资源
  onUnload() {
    if (this.sensorManager && this.data.isListening) {
      this.sensorManager.stopAll();
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '传感器测试 - 星芒集盒',
      path: '/pages/sensor/sensor',
      imageUrl: '/images/tools.png'
    };
  }
});