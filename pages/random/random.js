Page({
  onShareTimeline: function() {
    return {
      title: '星芒集盒 - 随机数生成',
      imageUrl: '/images/tools.png'
    }
  },
  data: {
    minValue: '',
    maxValue: '',
    result: null,
    error: null
  },

  onMinChange: function(e) {
    this.setData({
      minValue: e.detail.value,
      error: null
    });
  },

  onMaxChange: function(e) {
    this.setData({
      maxValue: e.detail.value,
      error: null
    });
  },

  generateRandom: function() {
    if (!this.data.minValue || !this.data.maxValue) {
      this.setData({
        error: '请输入最小值和最大值',
        result: null
      });
      return;
    }
    
    const min = Number(this.data.minValue);
    const max = Number(this.data.maxValue);
    
    if (isNaN(min) || isNaN(max)) {
      this.setData({
        error: '请输入有效数字',
        result: null
      });
      return;
    }
    
    if (min >= max) {
      this.setData({
        error: '最小值必须小于最大值',
        result: null
      });
      return;
    }
    
    // 检测输入的小数精度，最大限制为15位
    const minPrecision = Math.min(this.getDecimalPrecision(this.data.minValue), 15);
    const maxPrecision = Math.min(this.getDecimalPrecision(this.data.maxValue), 15);
    const precision = Math.max(minPrecision, maxPrecision);
    
    let randomNumber;
    
    if (precision === 0) {
      // 整数情况
      randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      // 小数情况：在[min, max]范围内生成随机小数
      const randomValue = Math.random() * (max - min) + min;
      // 根据最大精度四舍五入，最大15位小数
      const factor = Math.pow(10, precision);
      randomNumber = Math.round(randomValue * factor) / factor;
    }
    
    this.setData({
      result: randomNumber,
      error: null
    });
  },

  // 获取小数位数，最大限制为15位
  getDecimalPrecision: function(str) {
    if (!str || str.indexOf('.') === -1) {
      return 0;
    }
    const decimalPart = str.split('.')[1];
    return decimalPart ? Math.min(decimalPart.length, 15) : 0;
  },
  
  onShareAppMessage: function() {
    return {
      title: '随机数生成器',
      path: '/pages/random/random',
      imageUrl: '/images/tools.png'
    }
  }
});