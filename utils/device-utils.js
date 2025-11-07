/**
 * 设备信息工具模块
 * 封装设备信息处理相关工具方法
 */

class DeviceUtils {
  /**
   * 分类设备信息
   * @param {Object} data 原始设备数据
   * @returns {Object} 分类后的设备信息
   */
  static categorizeDeviceInfo(data) {
    // 转换iPhone型号为用户友好的名称
    const processedData = { ...data };
    if (data.platform === 'iOS' || data.platform === 'iPhone OS') {
      processedData.model = this._getiPhoneModelName(data.model);
    }

    return {
      basicInfo: this._filterData(processedData, [
        'brand', 'model', 'system', 'version', 
        'platform', 'app', 'ipAddress'
      ]),
      screenInfo: this._filterData(processedData, [
        'pixelRatio', 'screenWidth', 'screenHeight',
        'windowWidth', 'windowHeight', 'statusBarHeight',
        'titleBarHeight', 'safeArea', 'screen'
      ]),
      systemInfo: this._filterData(processedData, [
        'language', 'fontSizeSetting', 'performance',
        'storage', 'currentBattery', 'screenBrightness'
      ]),
      authInfo: this._filterData(processedData, [
        'albumAuthorized', 'cameraAuthorized',
        'locationAuthorized', 'microphoneAuthorized',
        'notificationAuthorized', 'phoneCalendarAuthorized',
        'overlayAuthorized', 'locationEnabled', 'wifiEnabled'
      ]),
      networkInfo: this._filterData(processedData, [
        'networkType', 'networkAvailable', 'signalStrength', 'hasSystemProxy'
      ]),
      featureInfo: this._filterData(processedData, [
        'transparentTitle', 'locationReducedAccuracy'
      ])
    };
  }

  /**
   * 获取iPhone型号的用户友好名称
   * @private
   */
  static _getiPhoneModelName(internalCode) {
    const modelMap = {
      'iPhone1,1': 'iPhone',
      'iPhone1,2': 'iPhone 3G',
      'iPhone2,1': 'iPhone 3GS',
      'iPhone3,1': 'iPhone 4',
      'iPhone3,2': 'iPhone 4',
      'iPhone3,3': 'iPhone 4',
      'iPhone4,1': 'iPhone 4S',
      'iPhone5,1': 'iPhone 5',
      'iPhone5,2': 'iPhone 5',
      'iPhone5,3': 'iPhone 5C',
      'iPhone5,4': 'iPhone 5C',
      'iPhone6,1': 'iPhone 5S',
      'iPhone6,2': 'iPhone 5S',
      'iPhone7,2': 'iPhone 6',
      'iPhone7,1': 'iPhone 6 Plus',
      'iPhone8,1': 'iPhone 6S',
      'iPhone8,2': 'iPhone 6S Plus',
      'iPhone9,1': 'iPhone 7',
      'iPhone9,3': 'iPhone 7',
      'iPhone9,2': 'iPhone 7 Plus',
      'iPhone9,4': 'iPhone 7 Plus',
      'iPhone10,1': 'iPhone 8',
      'iPhone10,4': 'iPhone 8',
      'iPhone10,2': 'iPhone 8 Plus',
      'iPhone10,5': 'iPhone 8 Plus',
      'iPhone10,3': 'iPhone X',
      'iPhone10,6': 'iPhone X',
      'iPhone11,8': 'iPhone XR',
      'iPhone11,2': 'iPhone XS',
      'iPhone12,1': 'iPhone 11',
      'iPhone12,3': 'iPhone 11 Pro',
      'iPhone11,6': 'iPhone XS Max',
      'iPhone11,4': 'iPhone XS Max',
      'iPhone12,5': 'iPhone 11 Pro Max',
      'iPhone13,1': 'iPhone 12 mini',
      'iPhone13,2': 'iPhone 12',
      'iPhone13,3': 'iPhone 12 Pro',
      'iPhone13,4': 'iPhone 12 Pro Max',
      'iPhone14,6': 'iPhone SE',
      'iPhone14,4': 'iPhone 13 mini',
      'iPhone14,5': 'iPhone 13',
      'iPhone14,2': 'iPhone 13 Pro',
      'iPhone14,3': 'iPhone 13 Pro Max',
      'iPhone14,7': 'iPhone 14',
      'iPhone14,8': 'iPhone 14 Plus',
      'iPhone15,2': 'iPhone 14 Pro',
      'iPhone15,3': 'iPhone 14 Pro Max',
      'iPhone15,4': 'iPhone 15',
      'iPhone15,5': 'iPhone 15 Plus',
      'iPhone16,1': 'iPhone 15 Pro',
      'iPhone16,2': 'iPhone 15 Pro Max',
      'iPhone17,3': 'iPhone 16',
      'iPhone17,4': 'iPhone 16 Plus',
      'iPhone17,1': 'iPhone 16 Pro',
      'iPhone17,2': 'iPhone 16 Pro Max',
      'iPhone17,5': 'iPhone 16e',
      'iPhone18,3': 'iPhone 17',
      'iPhone18,1': 'iPhone 17 Pro',
      'iPhone18,2': 'iPhone 17 Pro Max'
    };
    
    return modelMap[internalCode] || internalCode;
  }

  /**
   * 从完整数据中筛选指定字段
   * @private
   */
  static _filterData(data, keys) {
    const result = {};
    keys.forEach(key => {
      if (data[key] !== undefined) {
        result[key] = data[key];
      }
    });
    return result;
  }

  /**
   * 获取显示配置（字段名映射）
   * @returns {Object} 显示配置
   */
  static getDisplayConfig() {
    return {
      // 设备基本信息
      'brand': '设备品牌',
      'model': '设备型号',
      'system': '操作系统',
      'version': '支付宝版本',
      'platform': '运行平台',
      'app': '当前客户端',
      'ipAddress': 'IP地址',
      
      // 屏幕信息
      'pixelRatio': '设备像素比',
      'screenWidth': '屏幕宽度(px)',
      'screenHeight': '屏幕高度(px)',
      'windowWidth': '窗口宽度(px)',
      'windowHeight': '窗口高度(px)',
      'statusBarHeight': '状态栏高度(px)',
      'titleBarHeight': '标题栏高度(px)',
      'safeArea': '安全区域',
      'screen': '屏幕尺寸',
      
      // 系统设置
      'language': '系统语言',
      'fontSizeSetting': '字体大小设置(px)',
      'performance': '设备性能等级',
      'storage': '设备磁盘容量',
      'currentBattery': '当前电量(%)',
      'screenBrightness': '屏幕亮度',
      
      // 权限状态
      'albumAuthorized': '相册权限',
      'cameraAuthorized': '相机权限',
      'locationAuthorized': '位置权限',
      'microphoneAuthorized': '麦克风权限',
      'notificationAuthorized': '通知权限',
      'phoneCalendarAuthorized': '日历权限',
      'overlayAuthorized': '悬浮窗权限',
      
      // 权限状态（包含设备功能）
      'locationEnabled': '定位服务状态',
      'wifiEnabled': 'Wi-Fi状态',
      
      // 网络状态
      'networkType': '网络类型',
      'networkAvailable': '网络可用性',
      'signalStrength': '信号强度(dbm)',
      'hasSystemProxy': '系统代理状态',
      
      // 设备功能
      'transparentTitle': '透明状态栏',
      'locationReducedAccuracy': '定位精度模式'
    };
  }

}

module.exports = DeviceUtils;