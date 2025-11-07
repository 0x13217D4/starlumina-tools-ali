Page({
  onShareTimeline: function() {
    return {
      title: '星芒集盒 - 扫码工具',
      imageUrl: '/images/tools.png'
    }
  },
  data: {
    isScanning: false,
    result: null,
    parsedResult: null,
    resultType: 'text'
  },

  startScan() {
    if (this.data.isScanning) return;
    
    this.setData({ isScanning: true });
    
    my.scan({
      type: 'qr',
      success: (res) => {
        const parsedData = this.parseScanResult(res.code);
        this.setData({ 
          result: res.code,
          parsedResult: parsedData.content,
          resultType: parsedData.type,
          isScanning: false
        });
      },
      fail: (err) => {
        console.error('扫描失败:', err);
        my.showToast({
          title: '扫描取消或失败',
          duration: 2000
        });
        this.setData({ isScanning: false });
      }
    });
  },

  // 解析扫描结果
  parseScanResult(result) {
    if (!result) {
      return { type: 'text', content: '无内容' };
    }

    // 检查是否为URL
    if (this.isURL(result)) {
      return {
        type: 'url',
        content: result
      };
    }

    // 检查是否为WiFi配置
    const wifiMatch = result.match(/^WIFI:([^;]+);([^;]+);([^;]+);?;?$/);
    if (wifiMatch) {
      return {
        type: 'wifi',
        content: {
          ssid: wifiMatch[1],
          encryption: wifiMatch[2], 
          password: wifiMatch[3]
        }
      };
    }

    // 检查是否为电话号码
    if (this.isPhoneNumber(result)) {
      return {
        type: 'phone',
        content: result
      };
    }

    // 检查是否为邮箱
    if (this.isEmail(result)) {
      return {
        type: 'email',
        content: result
      };
    }

    // 检查是否为名片信息
    if (result.includes('BEGIN:VCARD') || result.includes('N:')) {
      return {
        type: 'vcard',
        content: this.parseVCard(result)
      };
    }

    // 检查是否为地理位置
    const geoMatch = result.match(/^geo:([^,]+),([^,]+)(?:,(.+))?$/);
    if (geoMatch) {
      return {
        type: 'geo',
        content: {
          latitude: geoMatch[1],
          longitude: geoMatch[2],
          name: geoMatch[3] || '未知位置'
        }
      };
    }

    // 检查是否为JSON格式
    try {
      const jsonData = JSON.parse(result);
      return {
        type: 'json',
        content: jsonData
      };
    } catch (e) {
      // 不是JSON格式，继续其他检查
    }

    // 默认为文本
    return {
      type: 'text',
      content: result
    };
  },

  // 检查是否为URL
  isURL(str) {
    try {
      new URL(str);
      return true;
    } catch (e) {
      // 检查常见的URL格式
      return /^(https?:\/\/|www\.|ftp:\/\/)/.test(str) || 
             /\.(com|cn|org|net|gov|edu|io|co|ai)(\/|$)/.test(str);
    }
  },

  // 检查是否为电话号码
  isPhoneNumber(str) {
    const phoneRegex = /^(\+?86)?[-\s]?1[3-9]\d{9}$|^(\+?\d{1,3}[-\s]?)?\d{3,4}[-\s]?\d{3,4}[-\s]?\d{4}$/;
    return phoneRegex.test(str.replace(/[^0-9+\-\s]/g, ''));
  },

  // 检查是否为邮箱
  isEmail(str) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  },

  // 解析名片信息
  parseVCard(vcard) {
    const result = {};
    const lines = vcard.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith('FN:')) {
        result.name = line.substring(3);
      } else if (line.startsWith('TEL:')) {
        result.phone = line.substring(4);
      } else if (line.startsWith('EMAIL:')) {
        result.email = line.substring(6);
      } else if (line.startsWith('ORG:')) {
        result.organization = line.substring(4);
      } else if (line.startsWith('TITLE:')) {
        result.title = line.substring(6);
      }
    });
    
    return result;
  },

  // 处理解析结果
  handleParsedResult() {
    const { resultType, parsedResult } = this.data;
    
    switch (resultType) {
      case 'url':
        // 可以添加打开链接的功能
        break;
      case 'phone':
        // 可以添加拨打电话的功能
        break;
      case 'email':
        // 可以添加发送邮件的功能
        break;
      case 'geo':
        // 可以添加打开地图的功能
        break;
      default:
        break;
    }
  },

  copyResult() {
    if (!this.data.result) return;
    
    let textToCopy = this.data.result;
    
    // 如果是结构化数据，格式化后复制
    if (this.data.resultType === 'wifi' && typeof this.data.parsedResult === 'object') {
      const wifi = this.data.parsedResult;
      textToCopy = `WiFi: ${wifi.ssid}\n密码: ${wifi.password}\n加密: ${wifi.encryption}`;
    } else if (this.data.resultType === 'vcard' && typeof this.data.parsedResult === 'object') {
      const card = this.data.parsedResult;
      textToCopy = `姓名: ${card.name || ''}\n电话: ${card.phone || ''}\n邮箱: ${card.email || ''}\n公司: ${card.organization || ''}`;
    }
    
    my.setClipboard({
      text: textToCopy,
      success: () => {
        my.showToast({
          title: '已复制到剪贴板',
          type: 'success'
        });
      }
    });
  },
  
  onShareAppMessage: function() {
    return {
      title: '扫码工具',
      path: '/pages/scan/scan',
      imageUrl: '/images/tools.png'
    }
  }
})