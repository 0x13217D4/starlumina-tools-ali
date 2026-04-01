/**
 * 设备信息页面
 * 展示从支付宝API获取的完整设备信息
 * 支持网络状态实时更新
 */
const DeviceService = require('../../utils/device-service');
const DeviceUtils = require('../../utils/device-utils');

Page({
  data: {
    deviceInfo: {},    // 设备信息数据
    displayInfo: {},   // 显示配置
    basicInfo: {},     // 基础设备信息
    screenInfo: {},    // 屏幕信息
    performanceInfo: {}, // 性能信息
    batteryInfo: {},    // 电量信息
    themeClass: ''     // 主题类名
  },

  // 网络状态变化监听器
  _networkStatusListener: null,
  // 电量变化监听器
  _batteryListener: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadThemeMode();
    // 首先设置显示配置和默认数据，让页面框架先显示
    this.setData({
      displayInfo: DeviceUtils.getDisplayConfig(),
      // 设置占位数据，显示加载状态
      basicInfo: {
        brand: '获取中...',
        model: '获取中...',
        system: '获取中...',
        version: '获取中...',
        platform: '获取中...',
        SDKVersion: '获取中...',
        ipv4: '获取中...',
        ipv6: '获取中...',
        networkType: '获取中...'
      },
      screenInfo: {
        pixelRatio: '获取中...',
        screenWidth: '获取中...',
        screenHeight: '获取中...',
        windowWidth: '获取中...',
        windowHeight: '获取中...',
        statusBarHeight: '获取中...'
      },
      performanceInfo: {
        benchmarkLevel: '获取中...',
        modelLevel: '获取中...',
        level: '获取中...'
      },
      batteryInfo: {
        level: '获取中...',
        isCharging: '获取中...',
        isLowPowerModeEnabled: '获取中...'
      }
    });

    // 然后异步获取真实数据
    this._loadDeviceInfo();
  },

  onShow() {
    this.loadThemeMode();
    // 注册网络状态监听
    this._registerNetworkListener();
    // 注册电量变化监听
    this._registerBatteryListener();
  },

  onHide() {
    // 页面隐藏时移除监听
    this._unregisterNetworkListener();
    this._unregisterBatteryListener();
  },

  onUnload() {
    // 页面卸载时移除监听
    this._unregisterNetworkListener();
    this._unregisterBatteryListener();
  },

  /**
   * 注册网络状态变化监听
   * @private
   */
  _registerNetworkListener() {
    // 先移除已有的监听
    this._unregisterNetworkListener();
    
    // 注册网络状态变化监听
    if (my.onNetworkStatusChange) {
      this._networkStatusListener = (res) => {
        console.log('[设备信息] 网络状态变化:', res);
        this._handleNetworkChange(res);
      };
      my.onNetworkStatusChange(this._networkStatusListener);
      console.log('[设备信息] 已注册网络状态监听');
    }
  },

  /**
   * 移除网络状态变化监听
   * @private
   */
  _unregisterNetworkListener() {
    if (this._networkStatusListener && my.offNetworkStatusChange) {
      my.offNetworkStatusChange(this._networkStatusListener);
      this._networkStatusListener = null;
      console.log('[设备信息] 已移除网络状态监听');
    }
  },

  /**
   * 注册电量变化监听
   * @private
   */
  _registerBatteryListener() {
    // 先移除已有的监听
    this._unregisterBatteryListener();
    
    // 注册电量变化监听（支付宝小程序支持）
    if (my.onBatteryChargeChange) {
      this._batteryListener = (res) => {
        console.log('[设备信息] 电量状态变化:', res);
        this._handleBatteryChange(res);
      };
      my.onBatteryChargeChange(this._batteryListener);
      console.log('[设备信息] 已注册电量状态监听');
    }
  },

  /**
   * 移除电量变化监听
   * @private
   */
  _unregisterBatteryListener() {
    if (this._batteryListener && my.offBatteryChargeChange) {
      my.offBatteryChargeChange(this._batteryListener);
      this._batteryListener = null;
      console.log('[设备信息] 已移除电量状态监听');
    }
  },

  /**
   * 处理网络状态变化
   * @private
   */
  async _handleNetworkChange(res) {
    const newNetworkType = (res.networkType || '').toUpperCase();
    const oldNetworkType = (this.data.deviceInfo.networkType || '').toUpperCase();
    
    console.log(`[设备信息] 网络从 ${oldNetworkType} 切换到 ${newNetworkType}`);
    
    // 更新网络类型显示
    this.setData({
      'basicInfo.networkType': this._formatNetworkType(res.networkType)
    });

    // 如果网络类型发生了实质性变化，重新获取IP和WiFi信息
    if (newNetworkType !== oldNetworkType || 
        (newNetworkType === 'WIFI' && !this.data.deviceInfo.wifiSSID)) {
      await this._updateNetworkDetails(res.networkType);
    }
  },

  /**
   * 更新网络详细信息（IP、WiFi信号等）
   * 支付宝 10.5.16+ 版本 my.getNetworkType 直接返回 signalStrength（dBm单位）
   * @private
   */
  async _updateNetworkDetails(networkType) {
    try {
      // 显示更新状态
      this.setData({
        'basicInfo.ipv4': '更新中...',
        'basicInfo.ipv6': '更新中...'
      });

      // 并行获取IPv4、IPv6和网络详情
      const [ipv4, ipv6, networkInfo] = await Promise.all([
        DeviceService.getIPv4(),
        DeviceService.getIPv6(),
        new Promise((resolve) => {
          my.getNetworkType({
            success: resolve,
            fail: () => resolve({ networkType: '未知', signalStrength: null })
          });
        })
      ]);

      const updateData = {
        'basicInfo.ipv4': ipv4,
        'basicInfo.ipv6': ipv6,
        'deviceInfo.ipv4': ipv4,
        'deviceInfo.ipv6': ipv6
      };

      // 如果是WiFi网络，显示信号强度
      const networkTypeUpper = (networkType || '').toUpperCase();
      if (networkTypeUpper === 'WIFI') {
        // 支付宝直接返回 signalStrength，单位 dBm（仅Android WiFi时可用）
        const signalStrengthDbm = networkInfo.signalStrength;
        
        if (signalStrengthDbm !== null && signalStrengthDbm !== undefined) {
          // 直接使用支付宝返回的 dBm 值
          const signalDesc = this._getDbmSignalDesc(signalStrengthDbm);
          updateData['deviceInfo.wifiRSSI'] = `${signalStrengthDbm} dBm (${signalDesc})`;
          
          // 添加到基础信息中显示
          if (!this.data.basicInfo.wifiRSSI) {
            this.setData({
              'displayInfo.basicFields': [...(this.data.displayInfo.basicFields || []), 
                { key: 'wifiRSSI', label: 'WiFi信号' }]
            });
          }
          updateData['basicInfo.wifiRSSI'] = updateData['deviceInfo.wifiRSSI'];
        }
        
        // 获取WiFi SSID（需要额外API）
        console.log('[设备信息] 正在获取WiFi详细信息...');
        const wifiInfo = await DeviceService.getWifiInfo();
        if (wifiInfo.ssid) {
          updateData['deviceInfo.wifiSSID'] = wifiInfo.ssid;
          if (!this.data.basicInfo.wifiSSID) {
            this.setData({
              'displayInfo.basicFields': [...(this.data.displayInfo.basicFields || []), 
                { key: 'wifiSSID', label: 'WiFi名称' }]
            });
          }
          updateData['basicInfo.wifiSSID'] = wifiInfo.ssid;
        }
      } else {
        // 非WiFi网络，清除WiFi相关信息
        updateData['deviceInfo.wifiRSSI'] = null;
        updateData['deviceInfo.wifiSSID'] = null;
      }

      this.setData(updateData);
      console.log('[设备信息] 网络详细信息已更新');
    } catch (error) {
      console.error('[设备信息] 更新网络详细信息失败:', error);
    }
  },

  /**
   * 根据 dBm 值获取信号强度描述
   * dBm 范围: -30dBm(极好) 到 -90dBm(极差)
   * @private
   */
  _getDbmSignalDesc(dbm) {
    if (dbm >= -50) return '极好';
    if (dbm >= -60) return '很好';
    if (dbm >= -70) return '良好';
    if (dbm >= -80) return '一般';
    return '较弱';
  },

  /**
   * 处理电量状态变化
   * @private
   */
  _handleBatteryChange(res) {
    const level = res.level !== undefined ? res.level : -1;
    const isCharging = res.isCharging || false;

    this.setData({
      'batteryInfo.level': DeviceUtils.formatBatteryLevel(level),
      'batteryInfo.isCharging': DeviceUtils.formatChargingStatus(isCharging),
      'deviceInfo.level': level,
      'deviceInfo.isCharging': isCharging
    });

    console.log(`[设备信息] 电量已更新: ${level}%, 充电中: ${isCharging}`);
  },

  /**
   * 格式化网络类型显示
   * @private
   */
  _formatNetworkType(networkType) {
    if (!networkType) return '未知';
    
    const typeMap = {
      'WIFI': 'WiFi',
      '2G': '2G',
      '3G': '3G',
      '4G': '4G',
      '5G': '5G',
      'UNKNOWN': '未知',
      'NONE': '无网络'
    };
    
    return typeMap[networkType.toUpperCase()] || networkType;
  },

  /**
   * 异步加载设备信息
   * @private
   */
  async _loadDeviceInfo() {
    try {
      // 并行获取设备信息和网络IP地址
      const [deviceInfo, ipv4, ipv6] = await Promise.all([
        DeviceService.getDeviceInfo(),
        DeviceService.getIPv4(),
        DeviceService.getIPv6()
      ]);
      
      // 设置IPv4和IPv6信息
      deviceInfo.ipv4 = ipv4;
      deviceInfo.ipv6 = ipv6;
      
      // 如果是WiFi网络，获取WiFi信息（包括信号强度）
      // 支付宝 10.5.16+ 版本 my.getNetworkType 直接返回 signalStrength（dBm单位）
      const networkType = (deviceInfo.networkType || '').toUpperCase();
      console.log('[设备信息] 网络类型:', networkType);
      
      // 获取网络详情（包含信号强度）
      const networkInfo = await new Promise((resolve) => {
        my.getNetworkType({
          success: resolve,
          fail: () => resolve({ networkType: '未知', signalStrength: null })
        });
      });
      
      if (networkType === 'WIFI') {
        // 支付宝直接返回 signalStrength，单位 dBm（仅Android WiFi时可用）
        const signalStrengthDbm = networkInfo.signalStrength;
        
        if (signalStrengthDbm !== null && signalStrengthDbm !== undefined) {
          // 直接使用支付宝返回的 dBm 值
          const signalDesc = this._getDbmSignalDesc(signalStrengthDbm);
          deviceInfo.wifiRSSI = `${signalStrengthDbm} dBm (${signalDesc})`;
        }
        
        // 获取WiFi SSID
        console.log('[设备信息] 检测到WiFi网络，正在获取WiFi信息...');
        const wifiInfo = await DeviceService.getWifiInfo();
        if (wifiInfo.ssid) {
          deviceInfo.wifiSSID = wifiInfo.ssid;
        }
      }
      
      // 保存网络代理信息
      if (networkInfo.hasSystemProxy !== undefined) {
        deviceInfo.hasSystemProxy = networkInfo.hasSystemProxy;
      }
      
      this._updateDeviceInfo(deviceInfo);
    } catch (error) {
      console.error('获取设备信息失败:', error);
      // 设置错误数据，避免页面空白
      this._updateDeviceInfo({
        brand: '获取失败',
        model: '获取失败',
        system: '获取失败',
        version: '获取失败',
        platform: '获取失败',
        SDKVersion: '获取失败',
        ipv4: '获取失败',
        ipv6: '获取失败',
        pixelRatio: 1,
        screenWidth: 375,
        screenHeight: 667,
        windowWidth: 375,
        windowHeight: 667,
        statusBarHeight: 20,
        benchmarkLevel: -1,
        modelLevel: 0,
        level: -1,
        isCharging: false,
        isLowPowerModeEnabled: false,
        networkType: '获取失败'
      });
    }
  },

  /**
   * 更新设备信息显示
   * @private
   */
  _updateDeviceInfo(deviceInfo) {
    const categorizedInfo = DeviceUtils.categorizeDeviceInfo(deviceInfo);

    // 格式化性能信息显示
    if (categorizedInfo.performanceInfo) {
      const formattedPerformance = {};
      Object.keys(categorizedInfo.performanceInfo).forEach(key => {
        const value = categorizedInfo.performanceInfo[key];
        if (key === 'benchmarkLevel') {
          formattedPerformance[key] = DeviceUtils.formatBenchmarkLevel(value);
        } else if (key === 'modelLevel') {
          formattedPerformance[key] = DeviceUtils.formatModelLevel(value);
        } else {
          formattedPerformance[key] = value;
        }
      });
      categorizedInfo.performanceInfo = formattedPerformance;
    }

    // 格式化电量信息显示
    if (categorizedInfo.batteryInfo) {
      const formattedBattery = {};
      Object.keys(categorizedInfo.batteryInfo).forEach(key => {
        const value = categorizedInfo.batteryInfo[key];
        if (key === 'level') {
          formattedBattery[key] = DeviceUtils.formatBatteryLevel(value);
        } else if (key === 'isCharging') {
          formattedBattery[key] = DeviceUtils.formatChargingStatus(value);
        } else if (key === 'isLowPowerModeEnabled') {
          formattedBattery[key] = DeviceUtils.formatLowPowerMode(value);
        } else {
          formattedBattery[key] = value;
        }
      });
      categorizedInfo.batteryInfo = formattedBattery;
    }

    this.setData({
      deviceInfo,
      ...categorizedInfo
    });
  },

  onShareAppMessage() {
    return {
      title: '设备信息详情',
      path: '/pages/deviceinfo/deviceinfo',
      imageUrl: '/images/tools.png'
    };
  },

  onShareTimeline() {
    return {
      title: '星芒集盒 - 设备信息',
      imageUrl: '/images/tools.png'
    };
  },

  onThemeChanged(theme) {
    this.updateThemeClass(theme)
  },

  loadThemeMode() {
    const themeMode = my.getStorageSync({key: 'themeMode'}) || 'system'
    
    // 获取实际的主题 - 优先使用应用级别的当前主题
    const app = getApp()
    let actualTheme = app.globalData.theme || 'light'
    
    // 如果应用级别没有主题信息，则按传统方式计算
    if (!actualTheme || actualTheme === 'light') {
      if (themeMode === 'system') {
        const systemInfo = my.getSystemInfoSync()
        actualTheme = systemInfo.theme || 'light'
      } else {
        actualTheme = themeMode
      }
    }
    
    // 更新页面主题类
    this.updateThemeClass(actualTheme)
    
    // 更新导航栏样式
    this.updateNavigationBar(actualTheme)
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
  
  updateNavigationBar(theme) {
    // 设置导航栏
    if (my.setNavigationBar && typeof my.setNavigationBar === 'function') {
      my.setNavigationBar({
        frontColor: theme === 'dark' ? '#ffffff' : '#000000',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
      })
    }
  }
});