/**
 * 设备信息服务模块
 * 封装设备信息获取相关逻辑
 */

class DeviceService {
  /**
   * 获取完整设备信息
   * @returns {Promise<Object>} 设备信息对象
   */
  static async getDeviceInfo() {
    const systemInfo = await this._getSystemInfo();
    const authInfo = await this._getAuthInfo();
    const networkInfo = await this._getNetworkInfo();
    const screenBrightness = await this._getScreenBrightness();
    
    return {
      ...systemInfo,
      ...authInfo,
      ...networkInfo,
      screenBrightness: screenBrightness
    };
  }

  /**
   * 获取系统信息
   * @private
   */
  static async _getSystemInfo() {
    try {
      // 使用支付宝小程序标准API
      const systemInfo = await new Promise((resolve, reject) => {
        my.getSystemInfo({
          success: resolve,
          fail: reject
        });
      });
      
      // 处理Android端screenWidth和screenHeight的bug，使用screen.width和screen.height替代
      if (systemInfo.platform === 'Android' && systemInfo.screen) {
        systemInfo.screenWidth = systemInfo.screen.width;
        systemInfo.screenHeight = systemInfo.screen.height;
      }
      
      return systemInfo;
    } catch (error) {
      console.warn('获取系统信息失败，使用备用方案:', error);
      // 备用方案：返回基本系统信息
      return {
        platform: 'unknown',
        version: 'unknown',
        pixelRatio: 2,
        safeArea: {
          left: 0,
          right: 375,
          top: 0,
          bottom: 667,
          width: 375,
          height: 667
        },
        screen: {
          width: 375,
          height: 667
        },
        screenHeight: 667,
        screenWidth: 375,
        statusBarHeight: 20,
        titleBarHeight: 44,
        windowWidth: 375,
        windowHeight: 667,
        locationEnabled: false,
        wifiEnabled: false,
        performance: '未知',
        brand: '未知',
        model: '未知',
        system: '未知',
        platform: 'unknown',
        language: 'zh-Hans',
        version: '未知',
        albumAuthorized: false,
        cameraAuthorized: false,
        locationAuthorized: false,
        microphoneAuthorized: false,
        notificationAuthorized: false,
        app: '支付宝',
        fontSizeSetting: 16,
        isIphoneXSeries: false,
        transparentTitle: false,
        overlayAuthorized: false,
        storage: '未知',
        currentBattery: '未知',
        phoneCalendarAuthorized: false,
        locationReducedAccuracy: false
      };
    }
  }

  /**
   * 获取权限信息
   * @private
   */
  static _getAuthInfo() {
    return new Promise((resolve) => {
      // 主线程环境 - 支付宝小程序API替换
      my.getSetting({
        success: (res) => resolve({
          albumAuthorized: res.authSetting['scope.writePhotosAlbum'],
          cameraAuthorized: res.authSetting['scope.camera'],
          locationAuthorized: res.authSetting['scope.userLocation'],
          microphoneAuthorized: res.authSetting['scope.record'],
          notificationAuthorized: res.authSetting['scope.notification'],
          phoneCalendarAuthorized: res.authSetting['scope.calendar'],
          overlayAuthorized: res.authSetting['scope.overlay']
        }),
        fail: () => resolve({
          albumAuthorized: false,
          cameraAuthorized: false,
          locationAuthorized: false,
          microphoneAuthorized: false,
          notificationAuthorized: false,
          phoneCalendarAuthorized: false,
          overlayAuthorized: false
        })
      });
    });
  }

  /**
   * 获取网络信息
   * @private
   */
  static _getNetworkInfo() {
    return new Promise((resolve) => {
      // 主线程环境 - 支付宝小程序API替换
      my.getNetworkType({
        success: resolve,
        fail: () => resolve({ networkType: '未知' })
      });
    });
  }

  /**
   * 获取屏幕亮度
   * @private
   * @returns {Promise<number>} 屏幕亮度值 (0-1)
   */
  static _getScreenBrightness() {
    return new Promise((resolve) => {
      my.getScreenBrightness({
        success: (res) => {
          resolve(res.brightness);
        },
        fail: (error) => {
          console.warn('获取屏幕亮度失败:', error);
          resolve(-1); // 返回-1表示获取失败
        }
      });
    });
  }

  /**
   * 获取IP地址
   * @returns {Promise<string>} IP地址
   */
  static async getIPAddress() {
    try {
      const res = await new Promise((resolve) => {
        // 支付宝小程序API
        my.request({
          url: 'https://test.ustc.edu.cn/backend/getIP.php',
          success: resolve,
          fail: () => resolve({ data: { processedString: '获取失败' } })
        });
      });
      
      return (res.data && res.data.processedString) || '获取失败';
    } catch (error) {
      console.error('获取IP地址失败:', error);
      return '获取失败';
    }
  }
}

module.exports = DeviceService;