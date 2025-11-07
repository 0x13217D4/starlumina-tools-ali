/**
 * 设备信息页面
 * 展示从支付宝API获取的完整设备信息
 */
const DeviceService = require('../../utils/device-service');
const PermissionService = require('../../utils/permission-service');
const DeviceUtils = require('../../utils/device-utils');

Page({
  data: {
    deviceInfo: {},    // 设备信息数据
    displayInfo: {},   // 显示配置
    basicInfo: {},     // 基础设备信息
    screenInfo: {},    // 屏幕信息
    systemInfo: {},    // 系统信息
    authInfo: {},      // 权限信息
    featureInfo: {}   // 功能信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad() {
    this.setData({
      displayInfo: DeviceUtils.getDisplayConfig()
    });

    try {
      const [deviceInfo, ipAddress] = await Promise.all([
        DeviceService.getDeviceInfo(),
        DeviceService.getIPAddress()
      ]);
      
      deviceInfo.ipAddress = ipAddress;
      this._updateDeviceInfo(deviceInfo);
    } catch (error) {
      console.error('获取设备信息失败:', error);
      // 设置默认数据，避免页面空白 - 符合支付宝小程序API格式
      this._updateDeviceInfo({
        brand: '未知',
        model: '未知',
        system: '未知',
        version: '未知',
        platform: '未知',
        app: '支付宝',
        ipAddress: '获取失败',
        pixelRatio: 2,
        screenWidth: 375,
        screenHeight: 667,
        windowWidth: 375,
        windowHeight: 667,
        statusBarHeight: 20,
        titleBarHeight: 44,
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
        language: 'zh-Hans',
        fontSizeSetting: 16,
        performance: '未知',
        storage: '未知',
        currentBattery: '未知',
        albumAuthorized: false,
        cameraAuthorized: false,
        locationAuthorized: false,
        microphoneAuthorized: false,
        notificationAuthorized: false,
        phoneCalendarAuthorized: false,
        overlayAuthorized: false,
        locationEnabled: false,
        wifiEnabled: false,
        networkType: '未知',
        transparentTitle: false,
        locationReducedAccuracy: false
      });
    }
  },

  /**
   * 更新设备信息显示
   * @private
   */
  _updateDeviceInfo(deviceInfo) {
    const categorizedInfo = DeviceUtils.categorizeDeviceInfo(deviceInfo);

    this.setData({
      deviceInfo,
      ...categorizedInfo
    });
  },

  /**
   * 点击权限项事件处理
   */
  async onAuthItemTap(e) {
    const key = e.currentTarget.dataset.key;
    const value = this.data.authInfo[key];
    
    if (value === '未请求') {
      const newStatus = await PermissionService.requestPermission(key);
      this._updateAuthStatus(key, newStatus);
    }
  },

  /**
   * 更新权限状态
   * @private
   */
  _updateAuthStatus(key, status) {
    this.setData({
      [`authInfo.${key}`]: status
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
  }
});