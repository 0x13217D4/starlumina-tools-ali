Page({
  onShareTimeline: function() {
    return {
      title: '星芒集盒 - 条形码工具',
      imageUrl: '/images/tools.png'
    }
  },
  data: {
    barcodeText: '',
    barcodeType: 'code128',
    barcodeTypes: ['code128', 'ean13', 'code39'],
    generatedBarcode: null,
    barcodeBase64: null,
    isLoading: false,
    isSaving: false,
    themeClass: '',
    // 条形码设置
    barcodeSettings: {
      width: 300,
      height: 100
    }
  },

  onLoad() {
    this.loadThemeMode();
  },

  onShow() {
    this.loadThemeMode()
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
  },
  
  onInputChange(e) {
    this.setData({ barcodeText: e.detail.value });
  },
  
  onTypeChange(e) {
    this.setData({ barcodeType: this.data.barcodeTypes[e.detail.value] });
  },

  // 更新宽度
  onWidthChange(e) {
    let width = parseInt(e.detail.value) || 300;
    width = Math.min(500, Math.max(100, width));
    this.setData({ 'barcodeSettings.width': width });
  },

  // 更新高度
  onHeightChange(e) {
    let height = parseInt(e.detail.value) || 100;
    height = Math.min(200, Math.max(50, height));
    this.setData({ 'barcodeSettings.height': height });
  },
  
  // 计算EAN13校验码
  calculateEAN13CheckDigit(code12) {
    let sum1 = 0; // 奇数位之和
    let sum2 = 0; // 偶数位之和
    
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(code12[i]);
      if ((i + 1) % 2 === 1) {
        sum1 += digit;
      } else {
        sum2 += digit;
      }
    }
    
    const total = sum1 + sum2 * 3;
    const checkDigit = (10 - (total % 10)) % 10;
    return checkDigit;
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

  generateBarcode() {
    const text = this.data.barcodeText.trim();
    if (!text) {
      my.showToast({ content: '请输入条码内容', type: 'none' });
      return;
    }
    
    // 检查API支持
    if (!this.checkApiSupport()) {
      return;
    }
    
    // 验证EAN13格式 - 只需要12位数字，校验码自动生成
    if (this.data.barcodeType === 'ean13') {
      if (!/^\d{12}$/.test(text)) {
        my.showToast({ content: 'EAN13需要12位数字', type: 'none' });
        return;
      }
    }
    
    // 验证CODE39格式
    if (this.data.barcodeType === 'code39') {
      if (!/^[A-Z0-9\-\. \$\/\+\%]+$/i.test(text)) {
        my.showToast({ content: 'CODE39包含非法字符', type: 'none' });
        return;
      }
    }
    
    // 验证CODE128格式 - 允许ASCII 32-126的可打印字符
    if (this.data.barcodeType === 'code128') {
      if (!/^[\x20-\x7E]+$/.test(text)) {
        my.showToast({ content: 'CODE128包含非法字符', type: 'none' });
        return;
      }
    }
    
    this.setData({ isLoading: true });
    
    // 准备条码内容
    let barcodeContent = text;
    
    // EAN13类型自动计算并添加校验码
    if (this.data.barcodeType === 'ean13') {
      const checkDigit = this.calculateEAN13CheckDigit(text);
      barcodeContent = text + checkDigit;
    }
    
    this.generateBarcodeNative(barcodeContent);
  },

  // 使用原生API生成条形码
  generateBarcodeNative(code) {
    const { width, height } = this.data.barcodeSettings;
    
    my.generateImageFromCode({
      code: code,
      format: 'BARCODE',
      width: width,
      height: height,
      success: (res) => {
        // res.image 是完整的 data URL 格式 (如: data:image/jpeg;base64,xxx)
        // 可直接用于 image 组件的 src
        // 提取纯 base64 数据用于保存
        const base64Data = res.image.split(',')[1] || res.image;
        
        this.setData({
          generatedBarcode: res.image,
          barcodeBase64: base64Data,
          isLoading: false
        });
      },
      fail: (err) => {
        console.error('生成条形码失败:', err);
        let errorMsg = '生成失败，请重试';
        if (err.error === 102) {
          errorMsg = '参数错误，请检查输入';
        } else if (err.error === 103) {
          errorMsg = '内容无效，请检查条码内容';
        }
        my.showToast({ content: errorMsg, type: 'none' });
        this.setData({ isLoading: false });
      }
    });
  },

  saveBarcode() {
    if (!this.data.barcodeBase64) {
      my.showToast({ content: '请先生成条形码', type: 'none' });
      return;
    }
    
    if (this.data.isSaving) return;
    
    this.setData({ isSaving: true });
    
    // 将base64保存为临时文件
    const fs = my.getFileSystemManager();
    const tempPath = `${my.env.USER_DATA_PATH}/barcode_${Date.now()}.png`;
    
    fs.writeFile({
      filePath: tempPath,
      data: this.data.barcodeBase64,
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
          content: err.errMsg && err.errMsg.includes('denied') ? '请授权相册访问权限' : '保存失败',
          type: 'none'
        });
        this.setData({ isSaving: false });
      }
    });
  },
  
  onShareAppMessage: function() {
    return {
      title: '条码生成工具',
      path: '/pages/barcode/barcode',
      imageUrl: '/images/tools.png'
    }
  }
})