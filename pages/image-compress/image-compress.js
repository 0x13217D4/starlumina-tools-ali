// utils/imageCompressor.js (或直接在页面JS文件中)

/**
 * 计算最优质量
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @param {number} baseQuality - 基础质量
 * @returns {number} - 计算后的最优质量 (0-100)
 */
function calculateOptimalQuality(width, height, baseQuality = 80) {
  const complexity = (width * height) / 1000000; // 百万像素为单位
  let quality = baseQuality;

  if (complexity > 10) {
    quality = Math.max(50, baseQuality - 20);
  } else if (complexity > 5) {
    quality = Math.max(60, baseQuality - 15);
  } else if (complexity > 2) {
    quality = Math.max(70, baseQuality - 10);
  } else if (complexity > 1) {
    quality = Math.max(75, baseQuality - 5);
  }

  return Math.min(90, quality); // 降低最大质量到90%，提高压缩效率
}

/**
 * 选择最佳文件格式
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @param {string} userFormat - 用户选择的格式 ('jpg', 'png', 'webp', 'auto')
 * @returns {string} - 最终使用的格式 ('jpg', 'png', 'webp')
 */
function selectBestFormat(width, height, userFormat) {
    if (userFormat === 'auto') {
        // 简单规则：大图用jpg，小图或可能透明用png
        // 注意：webp支持需要微信版本和平台支持检查
        return (width * height > 1000000) ? 'jpg' : 'png'; 
    }
    return userFormat;
}


// pages/compress/compress.js (或你的页面JS文件)
Page({
  data: {
    originalSize: '0 KB',
    compressedSize: '0 KB',
    dimensions: '0 × 0',
    compressedDimensions: '0 × 0',
    saving: '0%',
    quality: 80,
    showResize: false,
    imagePath: '',
    compressedPath: '',
    format: 'auto', // 默认设为auto
    isCompressing: false,
    progress: 0
  },

  onLoad: function(options) {
    // 页面创建时执行
  },

  chooseImage: function() {
    const that = this;
    my.chooseImage({
      count: 1,
      sizeType: ['original'], // 原图
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        if (!tempFilePath || typeof tempFilePath !== 'string') {
          my.showToast({ 
            type: 'none',
            content: '图片路径无效', 
            duration: 2000 
          });
          return;
        }
        
        const fs = my.getFileSystemManager();
        // 并行获取文件大小和图片信息
        Promise.all([
            new Promise((resolve, reject) => {
                fs.getFileInfo({
                    filePath: tempFilePath,
                    success: resolve,
                    fail: reject
                });
            }),
            new Promise((resolve, reject) => {
                my.getImageInfo({
                    src: tempFilePath,
                    success: resolve,
                    fail: reject
                });
            })
        ]).then(([fileInfo, imgInfo]) => {
             that.setData({
                imagePath: tempFilePath,
                originalSize: (fileInfo.size / 1024).toFixed(2) + ' KB',
                dimensions: `${imgInfo.width} × ${imgInfo.height}`,
                compressedPath: '',
                compressedSize: '0 KB',
                saving: '0%'
            });
        }).catch(err => {
            console.error('获取图片信息失败:', err);
            my.showToast({ 
              type: 'none',
              content: '图片加载失败', 
              duration: 2000 
            });
        });
      },
      fail(err) {
        console.error('选择图片失败:', err);
        my.showToast({ 
          type: 'none',
          content: '选择图片失败', 
          duration: 2000 
        });
      }
    });
  },
  compressImage: function() {
    const that = this;
    if (!this.data.imagePath) {
      my.showToast({ 
        type: 'none',
        content: '请先选择图片', 
        duration: 2000 
      });
      return;
    }

    if (this.data.isCompressing) {
      return; // 防止重复点击
    }

    this.setData({ isCompressing: true, progress: 0 });
    my.showLoading({ 
      content: '压缩中...',
      success: () => {
        console.log('Loading显示成功');
      },
      fail: (err) => {
        console.error('Loading显示失败:', err);
        // 即使loading显示失败，也继续压缩流程
      }
    });

    // 添加全局超时保护
    this.compressTimeout = setTimeout(() => {
      console.error('压缩过程超时');
      that.handleCompressError('压缩超时，请重试');
    }, 60000); // 60秒超时

    const { showResize, format: userFormat, quality: userQuality } = this.data;
    const imagePath = this.data.imagePath;
    
    // 清理旧压缩文件
    if (this.data.compressedPath) {
        my.getFileSystemManager().unlink({
            filePath: this.data.compressedPath,
            success: () => console.log('旧压缩文件已清理'),
            fail: (err) => console.log('清理旧文件失败(可能不存在):', err)
        });
    }

        // 获取图片信息并执行压缩
        my.getImageInfo({
          src: imagePath,
          success(imgInfo) {
            let targetWidth = imgInfo.width;
            let targetHeight = imgInfo.height;

            // 智能尺寸调整
            const maxDimension = Math.max(targetWidth, targetHeight);
            let shouldResize = false;
            
            if (showResize) {
              if (maxDimension > 2048) {
                // 超大图片：大幅压缩
                const ratio = 2048 / maxDimension;
                targetWidth = Math.round(targetWidth * ratio);
                targetHeight = Math.round(targetHeight * ratio);
                shouldResize = true;
              } else if (maxDimension > 1920) {
                // 大图片：适度压缩
                const ratio = 1920 / maxDimension;
                targetWidth = Math.round(targetWidth * ratio);
                targetHeight = Math.round(targetHeight * ratio);
                shouldResize = true;
              } else if (maxDimension > 1280) {
                // 中等图片：轻微压缩
                const ratio = 1280 / maxDimension;
                targetWidth = Math.round(targetWidth * ratio);
                targetHeight = Math.round(targetHeight * ratio);
                shouldResize = true;
              }
            }

            // 计算最优质量（考虑是否调整了尺寸）
            const baseQuality = shouldResize ? Math.max(userQuality - 10, 50) : userQuality;
            const optimalQuality = calculateOptimalQuality(targetWidth, targetHeight, baseQuality);
            that.setData({ quality: optimalQuality });

            console.log(`压缩参数: 原始尺寸${imgInfo.width}x${imgInfo.height}, 目标尺寸${targetWidth}x${targetHeight}, 质量${optimalQuality}%`);

            // 使用支付宝原生压缩API
            my.compressImage({
              src: imagePath,
              quality: optimalQuality,
              success(res) {
                console.log('压缩成功，临时文件路径:', res.tempFilePath);
                const fs = my.getFileSystemManager();
                fs.getFileInfo({
                  filePath: res.tempFilePath,
                  success(info) {
                    console.log('压缩文件信息:', info);
                    const originalSizeKB = parseFloat(that.data.originalSize);
                    const compressedSizeKB = (info.size / 1024);
                    const savingPercentage = originalSizeKB > 0 
                      ? (100 - ((compressedSizeKB / originalSizeKB) * 100)).toFixed(1) 
                      : '0.0';
                    
                    that.setData({
                      compressedPath: res.tempFilePath,
                      compressedSize: compressedSizeKB.toFixed(2) + ' KB',
                      compressedDimensions: `${targetWidth} × ${targetHeight}`,
                      saving: savingPercentage + '%',
                      progress: 100,
                      isCompressing: false
                    });
                    
                    my.hideLoading();
                    my.showToast({ 
                      type: 'success',
                      content: '压缩成功',
                      duration: 2000 
                    });
                  },
                  fail(err) {
                    console.error('获取压缩文件信息失败:', err);
                    // 即使获取文件信息失败，也尝试显示压缩成功
                    that.setData({
                      compressedPath: res.tempFilePath,
                      compressedSize: '未知',
                      compressedDimensions: `${targetWidth} × ${targetHeight}`,
                      saving: '未知',
                      progress: 100,
                      isCompressing: false
                    });
                    
                    my.hideLoading();
                    my.showToast({ 
                      type: 'success',
                      content: '压缩完成（文件信息获取失败）',
                      duration: 2000 
                    });
                  }
                });
              },
              fail(err) {
                console.error('压缩失败:', err);
                console.error('错误详情:', JSON.stringify(err));
                
                // 尝试使用canvas压缩作为备选方案
                that.tryCanvasCompression(imagePath, optimalQuality, targetWidth, targetHeight);
              }
            });
          },
          fail(err) {
            console.error('获取图片信息失败:', err);
            that.handleCompressError('图片信息获取失败');
          }
        });
      },

  setFormat: function(e) {
    this.setData({ format: e.detail.value });
  },

  // 统一错误处理方法
  handleCompressError: function(message) {
    // 清理超时定时器
    if (this.compressTimeout) {
      clearTimeout(this.compressTimeout);
      this.compressTimeout = null;
    }
    
    this.setData({ isCompressing: false });
    try {
      my.hideLoading();
    } catch (err) {
      console.error('隐藏Loading失败:', err);
    }
    my.showToast({ 
      type: 'none',
      content: message, 
      duration: 3000
    });
  },

  cancelCompress: function() {
    if (this.data.isCompressing) {
      this.handleCompressError('已取消压缩');
    }
  },

  downloadImage: function() {
    if (!this.data.compressedPath) {
      my.showToast({ 
        type: 'none',
        content: '请先压缩图片', 
        duration: 2000 
      });
      return;
    }

    my.saveImageToPhotosAlbum({
      filePath: this.data.compressedPath,
      success() {
        my.showToast({ 
          type: 'success',
          content: '保存成功',
          duration: 2000 
        });
      },
      fail(err) {
        console.error('保存图片失败:', err);
        // 用户拒绝授权也会走fail
        if (err.errMsg && err.errMsg.includes('auth')) {
            my.showToast({ 
              type: 'none',
              content: '请授权相册权限', 
              duration: 2000 
            });
        } else {
            my.showToast({ 
              type: 'none',
              content: '保存失败', 
              duration: 2000 
            });
        }
      }
    });
  },

  setQuality: function(e) {
    this.setData({ quality: parseInt(e.detail.value, 10) }); // 确保是数字
  },

  toggleResize: function(e) {
    // 注意：switch组件的值是 e.detail.value (true/false)
    // checkbox-group的值是 e.detail.value (数组)
    // 根据你的wxml调整，这里假设是switch
    this.setData({ showResize: e.detail.value });
  },

  // Canvas压缩备选方案
  tryCanvasCompression: function(imagePath, quality, targetWidth, targetHeight) {
    const that = this;
    console.log('尝试Canvas压缩方案');
    
    my.createCanvas({
      id: 'compressCanvas',
      type: '2d',
      success(canvas) {
        const ctx = canvas.getContext('2d');
        const img = canvas.createImage();
        
        img.onload = function() {
          // 设置canvas尺寸
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          // 绘制压缩后的图片
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          // 导出图片
          canvas.toDataURL({
            quality: quality / 100,
            success(dataUrl) {
              // 将base64转换为临时文件路径
              that.dataURLtoFile(dataUrl, function(tempFilePath) {
                if (tempFilePath) {
                  const fs = my.getFileSystemManager();
                  fs.getFileInfo({
                    filePath: tempFilePath,
                    success(info) {
                      const originalSizeKB = parseFloat(that.data.originalSize);
                      const compressedSizeKB = (info.size / 1024);
                      const savingPercentage = originalSizeKB > 0 
                        ? (100 - ((compressedSizeKB / originalSizeKB) * 100)).toFixed(1) 
                        : '0.0';
                      
                      that.setData({
                        compressedPath: tempFilePath,
                        compressedSize: compressedSizeKB.toFixed(2) + ' KB',
                        compressedDimensions: `${targetWidth} × ${targetHeight}`,
                        saving: savingPercentage + '%',
                        progress: 100,
                        isCompressing: false
                      });
                      
                      my.hideLoading();
                      my.showToast({ 
                        type: 'success',
                        content: 'Canvas压缩成功',
                        duration: 2000 
                      });
                    },
                    fail(err) {
                      console.error('Canvas压缩文件信息获取失败:', err);
                      that.handleCompressError('Canvas压缩失败');
                    }
                  });
                } else {
                  that.handleCompressError('Canvas压缩转换失败');
                }
              });
            },
            fail(err) {
              console.error('Canvas导出失败:', err);
              that.handleCompressError('Canvas导出失败');
            }
          });
        };
        
        img.onerror = function(err) {
          console.error('图片加载失败:', err);
          that.handleCompressError('图片加载失败');
        };
        
        img.src = imagePath;
      },
      fail(err) {
        console.error('Canvas创建失败:', err);
        that.handleCompressError('Canvas创建失败');
      }
    });
  },

  // Base64转临时文件
  dataURLtoFile: function(dataUrl, callback) {
    // 移除data URL前缀
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    
    // 创建临时文件
    const tempFilePath = my.env.USER_DATA_PATH + '/compressed_' + Date.now() + '.jpg';
    const fs = my.getFileSystemManager();
    
    fs.writeFile({
      filePath: tempFilePath,
      data: base64Data,
      encoding: 'base64',
      success() {
        callback(tempFilePath);
      },
      fail(err) {
        console.error('写入临时文件失败:', err);
        callback(null);
      }
    });
  },

  // 添加页面卸载时的清理
  onUnload: function() {
    // 清理压缩状态
    if (this.data.isCompressing) {
      this.setData({ isCompressing: false });
      try {
        my.hideLoading();
      } catch (err) {
        console.error('页面卸载时隐藏Loading失败:', err);
      }
    }
    
    // 清理超时定时器
    if (this.compressTimeout) {
      clearTimeout(this.compressTimeout);
      this.compressTimeout = null;
    }
  }
});