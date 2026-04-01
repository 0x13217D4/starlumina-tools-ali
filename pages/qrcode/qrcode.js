Page({
  onShareTimeline: function() {
    return {
      title: '星芒集盒 - 二维码工具'
    }
  },
  data: {
    qrText: '',
    generatedQRCode: null,
    qrBase64: null,
    isLoading: false,
    isSaving: false,
    mode: 'text', // 'text' 或 'wifi'
    wifiConfig: {
      ssid: '',
      password: '',
      encryption: 'WPA' // WPA/WEP/none
    },
    themeClass: '',
    // 高级设置
    advancedSettings: {
      width: 200,           // 宽度 px
      codeColor: '#000000', // 二维码颜色
      bgColor: '#ffffff',   // 背景颜色
      correctLevel: 'H',    // 纠错等级: L/M/Q/H
      noPadding: false      // 无边距
    },
    showAdvanced: false,    // 是否展开高级设置
    lastCacheKey: ''        // 缓存键
  },
  
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ 
      mode,
      generatedQRCode: null
    });
  },

  onInputChange(e) {
    this.setData({ qrText: e.detail.value });
  },

  onWifiInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`wifiConfig.${field}`]: e.detail.value
    });
  },

  onEncryptionChange(e) {
    const encryptions = ['WPA', 'WEP', 'none'];
    const newEncryption = encryptions[e.detail.value];
    this.setData({
      'wifiConfig.encryption': newEncryption,
      // 当切换到无加密时清空密码
      'wifiConfig.password': newEncryption === 'none' ? '' : this.data.wifiConfig.password
    });
  },

  // 切换高级设置展开/收起
  toggleAdvanced() {
    this.setData({ showAdvanced: !this.data.showAdvanced });
  },

  // 更新宽度
  onWidthChange(e) {
    let width = parseInt(e.detail.value) || 200;
    width = Math.min(500, Math.max(100, width));
    this.setData({ 'advancedSettings.width': width });
  },

  // 更新二维码颜色
  onCodeColorChange(e) {
    this.setData({ 'advancedSettings.codeColor': e.detail.value });
  },

  // 更新背景颜色
  onBgColorChange(e) {
    this.setData({ 'advancedSettings.bgColor': e.detail.value });
  },

  // 更新纠错等级
  onCorrectLevelChange(e) {
    const levels = ['L', 'M', 'Q', 'H'];
    this.setData({ 'advancedSettings.correctLevel': levels[e.detail.value] });
  },

  // 切换无边距
  toggleNoPadding() {
    this.setData({ 
      'advancedSettings.noPadding': !this.data.advancedSettings.noPadding 
    });
  },

  handleGenerateQRCode(e) {
    console.log('按钮点击事件:', e); // 调试日志
    my.vibrateShort({ type: 'light' }); // 触觉反馈
    this.generateQRCode();
  },

  generateQRCode() {
    console.log('生成按钮被点击'); // 调试日志
      
    if (this.data.mode === 'text') {
      const text = this.data.qrText.trim();
      if (!text) {
        my.showToast({ content: '请输入二维码内容', type: 'none' });
        return;
      }
      this.generateTextQR(text);
    } else {
      const { ssid, password } = this.data.wifiConfig;
      if (!ssid) {
        my.showToast({ content: '请输入 WIFI 名称', type: 'none' });
        return;
      }
      this.generateWifiQR();
    }
  },

  // 检查API是否可用
  checkApiSupport() {
    if (!my.generateImageFromCode) {
      my.showModal({
        title: '提示',
        content: '当前支付宝版本过低，请升级到最新版本',
        showCancel: false
      });
      return false;
    }
    return true;
  },

  // 使用原生API生成二维码
  generateQRCodeNative(code) {
    const { width, codeColor, bgColor, correctLevel, noPadding } = this.data.advancedSettings;
    
    // 验证颜色格式（必须是6位十六进制）
    const colorPattern = /^#[0-9A-Fa-f]{6}$/;
    const validCodeColor = colorPattern.test(codeColor) ? codeColor : '#000000';
    const validBgColor = colorPattern.test(bgColor) ? bgColor : '#ffffff';
    
    // 限制宽度范围
    const validWidth = Math.min(500, Math.max(100, width || 200));
    
    my.generateImageFromCode({
      code: code,
      format: 'QRCODE',
      width: validWidth,
      codeColor: validCodeColor,
      backgroundColor: validBgColor,
      correctLevel: correctLevel || 'H',
      forceNoPadding: noPadding || false,
      success: (res) => {
        // res.image 是完整的 data URL 格式 (如: data:image/jpeg;base64,xxx)
        // 可直接用于 image 组件的 src
        // 提取纯 base64 数据用于保存
        const base64Data = res.image.split(',')[1] || res.image;
        
        this.setData({
          generatedQRCode: res.image,
          qrBase64: base64Data,
          isLoading: false
        });
      },
      fail: (err) => {
        console.error('生成二维码失败:', err);
        let errorMsg = '生成失败，请重试';
        if (err.error === 102) {
          errorMsg = '参数错误，请检查输入';
        } else if (err.error === 103) {
          errorMsg = '内容无效，请检查二维码内容';
        }
        my.showToast({ content: errorMsg, type: 'none' });
        this.setData({ isLoading: false });
      }
    });
  },

  generateTextQR(text) {
    // 检查API支持
    if (!this.checkApiSupport()) {
      this.setData({ isLoading: false });
      return;
    }
    
    this.setData({ isLoading: true });
    
    // 缓存检查（考虑高级设置变化）
    const cacheKey = `text_${text}_${JSON.stringify(this.data.advancedSettings)}`;
    if (this.data.lastCacheKey === cacheKey && this.data.generatedQRCode) {
      this.setData({ isLoading: false });
      return;
    }
    
    this.setData({ lastCacheKey: cacheKey });
    this.generateQRCodeNative(text);
  },

  generateWifiQR() {
    // 检查API支持
    if (!this.checkApiSupport()) {
      this.setData({ isLoading: false });
      return;
    }
    
    this.setData({ isLoading: true });
    const { ssid, password, encryption } = this.data.wifiConfig;
    
    // 构建WiFi配置字符串
    let wifiStr = `WIFI:T:${encryption};S:${ssid};`;
    if (password) wifiStr += `P:${password};`;
    wifiStr += ';;';
    
    // 缓存检查
    const cacheKey = `wifi_${wifiStr}_${JSON.stringify(this.data.advancedSettings)}`;
    if (this.data.lastCacheKey === cacheKey && this.data.generatedQRCode) {
      this.setData({ isLoading: false });
      return;
    }
    
    this.setData({ lastCacheKey: cacheKey });
    this.generateQRCodeNative(wifiStr);
  },

  saveQRCode() {
    if (!this.data.qrBase64) {
      my.showToast({ content: '请先生成二维码', type: 'none' });
      return;
    }
    
    if (this.data.isSaving) return; // 防止重复点击
    
    this.setData({ isSaving: true });
    
    // 将base64保存为临时文件
    const fs = my.getFileSystemManager();
    const tempPath = `${my.env.USER_DATA_PATH}/qrcode_${Date.now()}.png`;
    
    fs.writeFile({
      filePath: tempPath,
      data: this.data.qrBase64,
      encoding: 'base64',
      success: () => {
        this.saveToAlbum(tempPath);
      },
      fail: (err) => {
        console.error('写入文件失败:', err);
        my.showToast({ content: '保存失败，请重试', type: 'none' });
        this.setData({ isSaving: false });
      }
    });
  },

  saveToAlbum(tempFilePath) {
    my.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        my.showToast({ content: '保存成功' });
        this.setData({ isSaving: false });
      },
      fail: (err) => {
        console.error('保存失败:', err);
        my.showToast({ 
          content: err.errMsg.includes('denied') ? '请授权相册访问权限' : '保存失败',
          type: 'none'
        });
        this.setData({ isSaving: false });
      }
    });
  },
  
  onShareAppMessage: function() {
    return {
      title: '二维码生成工具',
      path: '/pages/qrcode/qrcode'
    }
  },

  onShow() {
    this.loadThemeMode()
  },

  onThemeChanged(theme) {
    this.updateThemeClass(theme)
  },

  loadThemeMode() {
    const themeMode = my.getStorageSync('themeMode') || 'system'
    
    // 获取实际的主题 - 优先使用应用级别的当前主题
    const app = getApp()
    let actualTheme = app.globalData.theme || 'light'
    
    // 如果应用级别没有主题信息，则按传统方式计算
    if (!actualTheme || actualTheme === 'light') {
      if (themeMode === 'system') {
        const systemSetting = my.getSystemSetting()
        actualTheme = systemSetting.theme || 'light'
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
    if (my.setNavigationBarColor && typeof my.setNavigationBarColor === 'function') {
      my.setNavigationBarColor({
        frontColor: theme === 'dark' ? '#ffffff' : '#000000',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
      })
    }
  }
})