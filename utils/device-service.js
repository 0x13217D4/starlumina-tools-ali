/**
 * 设备信息服务模块（支付宝小程序版本）
 * 封装设备信息获取相关逻辑
 */

const DeviceModels = require('./device-models');

class DeviceService {
  static _cache = {
    benchmarkInfo: null,
    gpuInfo: null,
    deviceInfo: null,
    lastUpdate: 0
  };

  /**
   * 获取设备基准信息（带缓存）
   * 支付宝暂无对应API，使用系统信息模拟
   * @returns {Promise<Object>} 设备基准信息对象
   */
  static async getDeviceBenchmarkInfo() {
    // 检查缓存（5分钟有效）
    if (this._cache.benchmarkInfo && (Date.now() - this._cache.lastUpdate) < 300000) {
      return this._cache.benchmarkInfo;
    }

    try {
      const systemInfo = await this._getSystemInfo();
      
      // 支付宝暂无 getDeviceBenchmarkInfo API，根据设备信息估算
      const benchmarkInfo = {
        benchmarkLevel: this._estimateBenchmarkLevel(systemInfo),
        modelLevel: this._estimateModelLevel(systemInfo),
        cpuLevel: this._estimateCPULevel(systemInfo),
        gpuLevel: this._estimateGPULevel(systemInfo),
        memoryLevel: this._estimateMemoryLevel(systemInfo),
        storageLevel: this._estimateStorageLevel(systemInfo),
        performanceScore: 50,
        deviceCategory: this._getDeviceCategory(this._estimateBenchmarkLevel(systemInfo))
      };
      
      // 更新缓存
      this._cache.benchmarkInfo = benchmarkInfo;
      this._cache.lastUpdate = Date.now();
      
      return benchmarkInfo;
    } catch (error) {
      console.warn('获取设备基准信息失败:', error);
      const fallbackInfo = {
        benchmarkLevel: -1,
        modelLevel: 0,
        cpuLevel: 0,
        gpuLevel: 0,
        memoryLevel: 0,
        storageLevel: 0,
        performanceScore: 0,
        deviceCategory: 'unknown'
      };
      
      this._cache.benchmarkInfo = fallbackInfo;
      this._cache.lastUpdate = Date.now();
      
      return fallbackInfo;
    }
  }

  /**
   * 估算设备基准等级
   * @private
   */
  static _estimateBenchmarkLevel(systemInfo) {
    const pixelRatio = systemInfo.pixelRatio || 2;
    const platform = systemInfo.platform || '';
    const performance = systemInfo.performance || '';
    
    // 根据支付宝返回的 performance 字段判断
    if (performance === 'high') return 30;
    if (performance === 'middle') return 20;
    if (performance === 'low') return 10;
    
    // 简单估算
    if (platform === 'iOS') return 25;
    if (platform === 'Android') {
      if (pixelRatio >= 3) return 20;
      if (pixelRatio >= 2) return 15;
      return 10;
    }
    return 15;
  }

  /**
   * 估算型号等级
   * @private
   */
  static _estimateModelLevel(systemInfo) {
    return Math.min(10, Math.floor((systemInfo.pixelRatio || 2) * 3));
  }

  /**
   * 估算CPU等级
   * @private
   */
  static _estimateCPULevel(systemInfo) {
    return Math.min(10, Math.floor((systemInfo.pixelRatio || 2) * 2.5));
  }

  /**
   * 估算GPU等级
   * @private
   */
  static _estimateGPULevel(systemInfo) {
    return Math.min(10, Math.floor((systemInfo.pixelRatio || 2) * 2.5));
  }

  /**
   * 估算内存等级
   * @private
   */
  static _estimateMemoryLevel(systemInfo) {
    return Math.min(10, Math.floor((systemInfo.pixelRatio || 2) * 2));
  }

  /**
   * 估算存储等级
   * @private
   */
  static _estimateStorageLevel(systemInfo) {
    return Math.min(10, Math.floor((systemInfo.pixelRatio || 2) * 2));
  }

  /**
   * 获取详细GPU信息
   * @returns {Promise<Object>} GPU信息对象
   */
  static async getDetailedGPUInfo() {
    // 检查缓存
    if (this._cache.gpuInfo && (Date.now() - this._cache.lastUpdate) < 300000) {
      return this._cache.gpuInfo;
    }

    try {
      const benchmarkInfo = await this.getDeviceBenchmarkInfo();
      const systemInfo = await this._getSystemInfo();
      
      const gpuInfo = {
        gpuLevel: benchmarkInfo.gpuLevel || 0,
        benchmarkLevel: benchmarkInfo.benchmarkLevel || -1,
        renderer: this._detectGPURenderer(systemInfo),
        maxTextureSize: this._estimateMaxTextureSize(benchmarkInfo.gpuLevel),
        shaderLevel: this._estimateShaderLevel(benchmarkInfo.gpuLevel),
        memoryBandwidth: this._estimateMemoryBandwidth(benchmarkInfo.gpuLevel),
        fillRate: this._estimateFillRate(benchmarkInfo.gpuLevel),
        supportedFeatures: this._getSupportedFeatures(benchmarkInfo.gpuLevel),
        performanceTier: this._getGPUTier(benchmarkInfo.gpuLevel)
      };
      
      this._cache.gpuInfo = gpuInfo;
      return gpuInfo;
      
    } catch (error) {
      console.warn('获取GPU信息失败:', error);
      const fallbackGPUInfo = {
        gpuLevel: 0,
        benchmarkLevel: -1,
        renderer: 'unknown',
        maxTextureSize: 1024,
        shaderLevel: 1,
        memoryBandwidth: 1000,
        fillRate: 100,
        supportedFeatures: ['basic'],
        performanceTier: 'basic'
      };
      
      this._cache.gpuInfo = fallbackGPUInfo;
      return fallbackGPUInfo;
    }
  }

  /**
   * 获取设备性能等级预判
   * @returns {Promise<Object>} 性能等级信息
   */
  static async getPerformanceClassification() {
    try {
      const benchmarkInfo = await this.getDeviceBenchmarkInfo();
      const systemInfo = await this._getSystemInfo();
      
      const classification = {
        overall: this._classifyOverall(benchmarkInfo),
        cpu: this._classifyCPU(benchmarkInfo),
        gpu: this._classifyGPU(benchmarkInfo),
        memory: this._classifyMemory(benchmarkInfo, systemInfo),
        storage: this._classifyStorage(benchmarkInfo),
        gamingCapability: this._assessGamingCapability(benchmarkInfo),
        multitaskingCapability: this._assessMultitaskingCapability(benchmarkInfo),
        recommendations: this._generateRecommendations(benchmarkInfo, systemInfo)
      };
      
      return classification;
    } catch (error) {
      console.warn('获取性能等级预判失败:', error);
      return {
        overall: 'unknown',
        cpu: 'unknown',
        gpu: 'unknown',
        memory: 'unknown',
        storage: 'unknown',
        gamingCapability: 'unknown',
        multitaskingCapability: 'unknown',
        recommendations: []
      };
    }
  }

  /**
   * 清除缓存
   */
  static clearCache() {
    this._cache = {
      benchmarkInfo: null,
      gpuInfo: null,
      deviceInfo: null,
      lastUpdate: 0
    };
  }

  /**
   * 计算性能分数
   * @private
   */
  static _calculatePerformanceScore(benchmarkData) {
    const weights = {
      benchmarkLevel: 0.3,
      cpuLevel: 0.2,
      gpuLevel: 0.25,
      memoryLevel: 0.15,
      storageLevel: 0.1
    };
    
    let score = 0;
    if (benchmarkData.benchmarkLevel !== undefined && benchmarkData.benchmarkLevel > 0) {
      score += (benchmarkData.benchmarkLevel / 40) * weights.benchmarkLevel * 100;
    }
    if (benchmarkData.cpuLevel !== undefined) {
      score += (benchmarkData.cpuLevel / 10) * weights.cpuLevel * 100;
    }
    if (benchmarkData.gpuLevel !== undefined) {
      score += (benchmarkData.gpuLevel / 10) * weights.gpuLevel * 100;
    }
    if (benchmarkData.memoryLevel !== undefined) {
      score += (benchmarkData.memoryLevel / 10) * weights.memoryLevel * 100;
    }
    if (benchmarkData.storageLevel !== undefined) {
      score += (benchmarkData.storageLevel / 10) * weights.storageLevel * 100;
    }
    
    return Math.round(Math.min(100, score));
  }

  /**
   * 获取设备分类
   * @private
   */
  static _getDeviceCategory(benchmarkLevel) {
    if (benchmarkLevel >= 30) return 'flagship';
    if (benchmarkLevel >= 20) return 'high_end';
    if (benchmarkLevel >= 10) return 'mid_range';
    if (benchmarkLevel >= 0) return 'entry_level';
    return 'low_end';
  }

  /**
   * 检测GPU渲染器
   * @private
   */
  static _detectGPURenderer(systemInfo) {
    const platform = systemInfo.platform || 'unknown';
    const brand = systemInfo.brand || '';
    const model = systemInfo.model || '';
    
    // 基于品牌和型号推测GPU类型
    if (brand.toLowerCase().includes('apple') || platform === 'ios') {
      if (model.includes('Pro') || model.includes('Max')) return 'apple_gpu_pro';
      if (model.includes('Plus')) return 'apple_gpu_plus';
      return 'apple_gpu_standard';
    }
    
    if (brand.toLowerCase().includes('huawei')) return 'kirin_gpu';
    if (brand.toLowerCase().includes('xiaomi') || brand.toLowerCase().includes('redmi')) return 'adreno_gpu';
    if (brand.toLowerCase().includes('samsung')) return 'mali_gpu';
    
    return 'unknown_gpu';
  }

  /**
   * 估算最大纹理尺寸
   * @private
   */
  static _estimateMaxTextureSize(gpuLevel) {
    if (gpuLevel >= 8) return 4096;
    if (gpuLevel >= 6) return 2048;
    if (gpuLevel >= 4) return 1024;
    return 512;
  }

  /**
   * 估算着色器级别
   * @private
   */
  static _estimateShaderLevel(gpuLevel) {
    if (gpuLevel >= 8) return 3;
    if (gpuLevel >= 6) return 2;
    if (gpuLevel >= 4) return 1.5;
    return 1;
  }

  /**
   * 估算内存带宽
   * @private
   */
  static _estimateMemoryBandwidth(gpuLevel) {
    return Math.max(1000, gpuLevel * 2000);
  }

  /**
   * 估算填充率
   * @private
   */
  static _estimateFillRate(gpuLevel) {
    return Math.max(100, gpuLevel * 500);
  }

  /**
   * 获取支持的特性
   * @private
   */
  static _getSupportedFeatures(gpuLevel) {
    const features = ['basic'];
    
    if (gpuLevel >= 4) features.push('multitexture');
    if (gpuLevel >= 6) features.push('shader_2_0', 'vertex_shader');
    if (gpuLevel >= 8) features.push('shader_3_0', 'instanced_rendering');
    
    return features;
  }

  /**
   * 获取GPU层级
   * @private
   */
  static _getGPUTier(gpuLevel) {
    if (gpuLevel >= 8) return 'high';
    if (gpuLevel >= 6) return 'medium_high';
    if (gpuLevel >= 4) return 'medium';
    if (gpuLevel >= 2) return 'low_medium';
    return 'low';
  }

  /**
   * 分类整体性能
   * @private
   */
  static _classifyOverall(benchmarkInfo) {
    if (benchmarkInfo.performanceScore >= 80) return 'excellent';
    if (benchmarkInfo.performanceScore >= 60) return 'good';
    if (benchmarkInfo.performanceScore >= 40) return 'average';
    if (benchmarkInfo.performanceScore >= 20) return 'poor';
    return 'very_poor';
  }

  /**
   * 分类CPU性能
   * @private
   */
  static _classifyCPU(benchmarkInfo) {
    const cpuLevel = benchmarkInfo.cpuLevel || 0;
    if (cpuLevel >= 8) return 'high_end';
    if (cpuLevel >= 6) return 'upper_mid';
    if (cpuLevel >= 4) return 'mid_range';
    if (cpuLevel >= 2) return 'low_mid';
    return 'low_end';
  }

  /**
   * 分类GPU性能
   * @private
   */
  static _classifyGPU(benchmarkInfo) {
    const gpuLevel = benchmarkInfo.gpuLevel || 0;
    if (gpuLevel >= 8) return 'gaming_grade';
    if (gpuLevel >= 6) return 'high_performance';
    if (gpuLevel >= 4) return 'mainstream';
    if (gpuLevel >= 2) return 'basic';
    return 'minimum';
  }

  /**
   * 分类内存性能
   * @private
   */
  static _classifyMemory(benchmarkInfo, systemInfo) {
    const memoryLevel = benchmarkInfo.memoryLevel || 0;
    const ramSize = systemInfo.pixelRatio || 2;
    
    if (memoryLevel >= 8 && ramSize >= 3) return 'excellent';
    if (memoryLevel >= 6 && ramSize >= 2) return 'good';
    if (memoryLevel >= 4 && ramSize >= 1) return 'average';
    return 'limited';
  }

  /**
   * 分类存储性能
   * @private
   */
  static _classifyStorage(benchmarkInfo) {
    const storageLevel = benchmarkInfo.storageLevel || 0;
    if (storageLevel >= 8) return 'ufs_3_0_plus';
    if (storageLevel >= 6) return 'ufs_3_0';
    if (storageLevel >= 4) return 'ufs_2_1';
    if (storageLevel >= 2) return 'emmc_5_1';
    return 'emmc_5_0';
  }

  /**
   * 评估游戏能力
   * @private
   */
  static _assessGamingCapability(benchmarkInfo) {
    const gpuLevel = benchmarkInfo.gpuLevel || 0;
    const cpuLevel = benchmarkInfo.cpuLevel || 0;
    const memoryLevel = benchmarkInfo.memoryLevel || 0;
    
    if (gpuLevel >= 8 && cpuLevel >= 8 && memoryLevel >= 8) return 'flagship_gaming';
    if (gpuLevel >= 6 && cpuLevel >= 6 && memoryLevel >= 6) return 'high_gaming';
    if (gpuLevel >= 4 && cpuLevel >= 4 && memoryLevel >= 4) return 'mainstream_gaming';
    if (gpuLevel >= 2 && cpuLevel >= 2) return 'casual_gaming';
    return 'not_recommended';
  }

  /**
   * 评估多任务能力
   * @private
   */
  static _assessMultitaskingCapability(benchmarkInfo) {
    const memoryLevel = benchmarkInfo.memoryLevel || 0;
    const cpuLevel = benchmarkInfo.cpuLevel || 0;
    
    if (memoryLevel >= 8 && cpuLevel >= 8) return 'excellent';
    if (memoryLevel >= 6 && cpuLevel >= 6) return 'good';
    if (memoryLevel >= 4 && cpuLevel >= 4) return 'average';
    if (memoryLevel >= 2 && cpuLevel >= 2) return 'limited';
    return 'poor';
  }

  /**
   * 生成推荐建议
   * @private
   */
  static _generateRecommendations(benchmarkInfo, systemInfo) {
    const recommendations = [];
    const deviceCategory = this._getDeviceCategory(benchmarkInfo.benchmarkLevel || -1);
    
    if (deviceCategory === 'low_end' || deviceCategory === 'unknown') {
      recommendations.push('建议关闭后台应用以提升性能');
      recommendations.push('使用轻量级应用以获得更好体验');
    }
    
    if (deviceCategory === 'entry_level') {
      recommendations.push('适合日常使用和轻度应用');
      recommendations.push('可考虑适度使用多任务功能');
    }
    
    if (deviceCategory === 'mid_range') {
      recommendations.push('可流畅运行大多数应用');
      recommendations.push('支持中等强度的多任务处理');
    }
    
    if (deviceCategory === 'high_end') {
      recommendations.push('可流畅运行大型应用和游戏');
      recommendations.push('支持重度多任务使用');
    }
    
    if (deviceCategory === 'flagship') {
      recommendations.push('可运行所有类型的应用和游戏');
      recommendations.push('支持极限多任务和高强度使用');
    }
    
    return recommendations;
  }

  /**
   * 获取电量信息
   * 支付宝使用 my.getBatteryInfo
   * @returns {Promise<Object>} 电量信息对象
   */
  static async getBatteryInfo() {
    return new Promise((resolve) => {
      if (my.getBatteryInfo) {
        my.getBatteryInfo({
          success: (res) => {
            resolve({
              level: res.level !== undefined ? res.level : -1,
              isCharging: res.isCharging || false
            });
          },
          fail: (error) => {
            console.warn('获取电量信息失败:', error);
            resolve({
              level: -1,
              isCharging: false
            });
          }
        });
      } else {
        resolve({
          level: -1,
          isCharging: false
        });
      }
    });
  }

  /**
   * 获取完整设备信息
   * @returns {Promise<Object>} 设备信息对象
   */
  static async getDeviceInfo() {
    const systemInfo = await this._getSystemInfo();
    const networkInfo = await this._getNetworkInfo();
    const benchmarkInfo = await this.getDeviceBenchmarkInfo();
    const batteryInfo = await this.getBatteryInfo();
    
    // 转换设备型号为友好的名称
    const friendlyModel = DeviceModels.getDeviceName(systemInfo.model);
    
    return {
      ...systemInfo,
      model: friendlyModel,
      modelCode: systemInfo.model,
      networkType: networkInfo.networkType,
      ...benchmarkInfo,
      ...batteryInfo
    };
  }

  /**
   * 获取系统信息（完整版，包含所有支付宝返回的字段）
   * 支付宝使用 my.getSystemInfoSync
   * @private
   */
  static _getSystemInfo() {
    try {
      const res = my.getSystemInfoSync();
      
      // 使用 my.getAppBaseInfo 获取基础库版本和支付宝版本号
      let appBaseInfo = { SDKVersion: '未知', version: '未知', language: '未知' };
      if (my.getAppBaseInfo) {
        try {
          appBaseInfo = my.getAppBaseInfo();
        } catch (e) {
          console.warn('获取AppBaseInfo失败:', e);
        }
      }
      
      // 构建安全区域信息
      const safeArea = res.safeArea || {};
      
      // 构建屏幕信息
      const screen = res.screen || {};
      
      return {
        // 基本信息
        brand: res.brand || '未知',
        model: res.model || '未知',
        system: res.system || '未知',
        platform: res.platform || '未知',
        language: appBaseInfo.language || res.language || '未知',
        version: appBaseInfo.version || '未知',
        app: res.app || '未知',
        SDKVersion: appBaseInfo.SDKVersion || '未知',
        storage: res.storage || '未知',
        
        // 屏幕信息
        pixelRatio: res.pixelRatio || 1,
        screenWidth: res.screenWidth || 0,
        screenHeight: res.screenHeight || 0,
        screen: screen,
        windowWidth: res.windowWidth || 0,
        windowHeight: res.windowHeight || 0,
        statusBarHeight: res.statusBarHeight || 0,
        titleBarHeight: res.titleBarHeight || 0,
        safeArea: safeArea,
        
        // 系统开关
        locationEnabled: res.locationEnabled || false,
        wifiEnabled: res.wifiEnabled || false,
        performance: res.performance || 'unknown',
        
        // 权限信息
        albumAuthorized: res.albumAuthorized || false,
        cameraAuthorized: res.cameraAuthorized || false,
        locationAuthorized: res.locationAuthorized || false,
        microphoneAuthorized: res.microphoneAuthorized || false,
        notificationAuthorized: res.notificationAuthorized || false,
        overlayAuthorized: res.overlayAuthorized || false,
        
        // 其他信息
        fontSizeSetting: res.fontSizeSetting || 16,
        isIphoneXSeries: res.isIphoneXSeries || false,
        transparentTitle: res.transparentTitle || false,
        currentBattery: res.currentBattery || '未知'
      };
    } catch (error) {
      console.error('获取系统信息失败:', error);
      return {
        brand: '获取失败',
        model: '获取失败',
        system: '获取失败',
        platform: '获取失败',
        language: '获取失败',
        version: '获取失败',
        app: '获取失败',
        SDKVersion: '获取失败',
        storage: '获取失败',
        pixelRatio: 1,
        screenWidth: 375,
        screenHeight: 667,
        screen: { width: 375, height: 667 },
        windowWidth: 375,
        windowHeight: 667,
        statusBarHeight: 20,
        titleBarHeight: 44,
        safeArea: {},
        locationEnabled: false,
        wifiEnabled: false,
        performance: 'unknown',
        albumAuthorized: false,
        cameraAuthorized: false,
        locationAuthorized: false,
        microphoneAuthorized: false,
        notificationAuthorized: false,
        overlayAuthorized: false,
        fontSizeSetting: 16,
        isIphoneXSeries: false,
        transparentTitle: false,
        currentBattery: '未知'
      };
    }
  }

  /**
   * 获取权限信息
   * @private
   */
  static _getAuthInfo() {
    return new Promise((resolve) => {
      my.getSetting({
        success: (res) => resolve({
          albumAuthorized: res.authSetting['scope.writePhotosAlbum'],
          cameraAuthorized: res.authSetting['scope.camera'],
          locationAuthorized: res.authSetting['scope.userLocation'],
          microphoneAuthorized: res.authSetting['scope.record']
        }),
        fail: () => resolve({
          albumAuthorized: false,
          cameraAuthorized: false,
          locationAuthorized: false,
          microphoneAuthorized: false
        })
      });
    });
  }

  /**
   * 获取网络信息
   * 支付宝 10.5.16+ 版本支持直接返回 signalStrength（dBm单位）
   * @private
   */
  static _getNetworkInfo() {
    return new Promise((resolve) => {
      my.getNetworkType({
        success: (res) => {
          // 支付宝直接返回 signalStrength，单位 dBm（仅WiFi时可用）
          resolve({
            networkType: res.networkType || '未知',
            networkAvailable: res.networkAvailable !== undefined ? res.networkAvailable : true,
            signalStrength: res.signalStrength !== undefined ? res.signalStrength : null,
            hasSystemProxy: res.hasSystemProxy || false
          });
        },
        fail: () => resolve({ 
          networkType: '未知', 
          networkAvailable: false,
          signalStrength: null,
          hasSystemProxy: false
        })
      });
    });
  }

  /**
   * 获取WiFi信息（包括信号强度）
   * 支付宝小程序需要先调用 my.startWifi 初始化
   * @returns {Promise<Object>} WiFi信息对象
   */
  static getWifiInfo() {
    return new Promise((resolve) => {
      // 检查是否有 WiFi 相关 API
      if (!my.startWifi || !my.getConnectedWifi) {
        resolve({ signalStrength: null, ssid: null, bssid: null });
        return;
      }
      
      // 先初始化 WiFi 模块
      my.startWifi({
        success: () => {
          // 初始化成功后获取已连接的WiFi信息
          my.getConnectedWifi({
            success: (res) => {
              const wifi = res.wifi || {};
              resolve({
                signalStrength: wifi.signalStrength !== undefined ? wifi.signalStrength : null,
                ssid: wifi.SSID || null,
                bssid: wifi.BSSID || null,
                secure: wifi.secure || false
              });
            },
            fail: (error) => {
              console.warn('获取WiFi信息失败:', error);
              resolve({ signalStrength: null, ssid: null, bssid: null });
            }
          });
        },
        fail: (error) => {
          console.warn('初始化WiFi模块失败:', error);
          resolve({ signalStrength: null, ssid: null, bssid: null });
        }
      });
    });
  }

  /**
   * 根据信号强度值计算信号等级描述
   * @param {number} signalStrength 信号强度（0-100，值越大信号越好）
   * @returns {string} 信号强度描述
   */
  static getSignalStrengthDesc(signalStrength) {
    if (signalStrength === null || signalStrength === undefined) return '未知';
    
    // 支付宝返回的 signalStrength 取值 0-100，值越大强度越大
    if (signalStrength >= 80) return '极好';
    if (signalStrength >= 60) return '很好';
    if (signalStrength >= 40) return '良好';
    if (signalStrength >= 20) return '一般';
    return '较弱';
  }

  /**
   * 获取IP地址
   * @returns {Promise<string>} IP地址
   */
  static async getIPAddress() {
    try {
      const ipServices = [
        {
          url: 'https://api.ipify.org?format=json',
          parser: (data) => data.ip
        }
      ];

      for (const service of ipServices) {
        try {
          const res = await new Promise((resolve, reject) => {
            my.request({
              url: service.url,
              timeout: 5000,
              success: resolve,
              fail: reject
            });
          });
          
          if (res.status === 200 && res.data) {
            const ip = service.parser(res.data);
            if (ip && ip !== '获取失败') {
              return ip;
            }
          }
        } catch (serviceError) {
          console.warn(`IP服务 ${service.url} 不可用:`, serviceError);
          continue;
        }
      }
      
      return '获取失败';
    } catch (error) {
      console.warn('获取IP地址失败:', error);
      return '获取失败';
    }
  }

  /**
   * 获取IPv4地址
   * @returns {Promise<string>} IPv4地址
   */
  static async getIPv4() {
    try {
      const networkType = await new Promise((resolve) => {
        my.getNetworkType({
          success: (res) => resolve(res.networkType),
          fail: () => resolve('none')
        });
      });
      
      if (networkType === 'none') {
        return '无网络连接';
      }

      const ipv4Services = [
        {
          url: 'https://api.ipify.org?format=json',
          parser: (data) => data.ip
        }
      ];

      for (const service of ipv4Services) {
        try {
          const res = await new Promise((resolve, reject) => {
            my.request({
              url: service.url,
              timeout: 5000,
              success: resolve,
              fail: reject
            });
          });

          if (res.status === 200 && res.data) {
            const ip = service.parser(res.data);
            if (ip && ip.length > 0 && ip.includes('.') && !ip.includes(':')) {
              return ip;
            }
          }
        } catch (serviceError) {
          console.warn(`IPv4服务 ${service.url} 不可用:`, serviceError);
          continue;
        }
      }
      
      return '获取失败';
    } catch (error) {
      console.warn('获取IPv4地址失败:', error);
      return '获取失败';
    }
  }

  /**
   * 获取IPv6地址
   * @returns {Promise<string>} IPv6地址
   */
  static async getIPv6() {
    try {
      const networkType = await new Promise((resolve) => {
        my.getNetworkType({
          success: (res) => resolve(res.networkType),
          fail: () => resolve('none')
        });
      });
      
      if (networkType === 'none') {
        return '无网络连接';
      }

      const ipv6Services = [
        {
          url: 'https://api6.ipify.org?format=json',
          parser: (data) => data.ip
        }
      ];

      for (const service of ipv6Services) {
        try {
          const res = await new Promise((resolve, reject) => {
            my.request({
              url: service.url,
              timeout: 5000,
              success: resolve,
              fail: reject
            });
          });

          if (res.status === 200 && res.data) {
            const ip = service.parser(res.data);
            if (ip && ip.length > 0 && ip.includes(':') && !ip.includes('.')) {
              return ip;
            }
          }
        } catch (serviceError) {
          console.warn(`IPv6服务 ${service.url} 不可用:`, serviceError);
          continue;
        }
      }
      
      return '不支持';
    } catch (error) {
      console.warn('获取IPv6地址失败:', error);
      return '不支持';
    }
  }
}

module.exports = DeviceService;