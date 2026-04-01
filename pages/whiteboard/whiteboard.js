Page({
  data: {
    currentTool: 'pen', // 当前工具: select, pen, eraser
    selectedColor: '#000000', // 默认黑色
    brushSize: 5, // 默认笔刷大小
    colors: ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'],
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    points: [], // 存储触摸点用于压感
    showPenPanel: false, // 笔工具面板显示状态
    showEraserPanel: false, // 橡皮擦面板显示状态
    scale: 1, // 画布缩放比例
    scalePercent: 100, // 缩放百分比显示
    offsetX: 0, // 画布X偏移
    offsetY: 0, // 画布Y偏移
    isPanning: false, // 是否正在拖动画布
    lastPanX: 0, // 上一次拖动X坐标
    lastPanY: 0, // 上一次拖动Y坐标
    strokes: [], // 保存所有笔画路径数据
    currentStroke: null, // 当前正在绘制的笔画
    canvasWidth: 300,
    canvasHeight: 500,
    dpr: 1 // 设备像素比，用于高清显示
  },

  onLoad() {
    // 初始化 Canvas（支付宝小程序使用旧版 API）
    this.initCanvas();
  },

  // 阻止页面滚动
  preventTouchMove(e) {
    // 空函数，用于阻止事件冒泡和默认滚动行为
  },

  // 初始化 Canvas（支付宝小程序兼容方式）
  initCanvas() {
    // 支付宝小程序使用 my.createCanvasContext
    this.ctx = my.createCanvasContext('whiteboardCanvas', this);
    
    // 获取系统信息设置画布大小
    my.getSystemInfo({
      success: (res) => {
        // 获取设备像素比，用于高清显示
        const dpr = res.pixelRatio || 1;
        // 窗口高度减去工具栏高度
        const canvasHeight = res.windowHeight - 120;
        const canvasWidth = res.windowWidth;
        
        // 存储实际像素尺寸用于绘图
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.dpr = dpr;
        
        this.setData({
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight,
          dpr: dpr
        });
        
        // 清空画布
        setTimeout(() => {
          this.clearBoard();
        }, 100);
      }
    });
  },

  onShow() {
    // 页面显示时重新绘制（如果有保存的内容）
    // setTimeout(() => {
    //   this.redrawCanvas();
    // }, 100);
  },

  switchTool(e) {
    const tool = e.currentTarget.dataset.tool;
    const currentTool = this.data.currentTool;
    
    if (currentTool === tool) {
      // 如果点击当前工具，切换面板状态
      if (tool === 'pen') {
        this.setData({
          showPenPanel: !this.data.showPenPanel,
          showEraserPanel: false
        });
      } else if (tool === 'eraser') {
        this.setData({
          showEraserPanel: !this.data.showEraserPanel,
          showPenPanel: false
        });
      } else if (tool === 'select') {
        // 选择工具关闭所有面板
        this.setData({
          showPenPanel: false,
          showEraserPanel: false
        });
      }
    } else {
      // 如果点击不同工具，切换到新工具并关闭所有面板
      this.setData({
        currentTool: tool,
        showPenPanel: false,
        showEraserPanel: false
      });
    }
  },

  selectColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      selectedColor: color
    });
  },

  onBrushSizeChange(e) {
    this.setData({
      brushSize: e.detail.value
    });
  },

  // 转换屏幕坐标到画布坐标
  screenToCanvas(x, y) {
    const { scale, offsetX, offsetY } = this.data;
    return {
      x: (x - offsetX) / scale,
      y: (y - offsetY) / scale
    };
  },

  onTouchStart(e) {
    if (!this.ctx) {
      this.initCanvas();
      return;
    }
    
    // 双指操作优先处理，阻断后续单指逻辑
    if (e.touches.length > 1) {
      // 如果正在绘图，先保存当前笔画
      if (this.data.isDrawing && this.data.currentStroke) {
        const strokes = this.data.strokes;
        strokes.push(this.data.currentStroke);
        this.setData({
          strokes: strokes,
          currentStroke: null,
          isDrawing: false
        });
      }
      this.handlePinchStart(e);
      return;
    }

    const touch = e.touches[0];
    const x = touch.x;
    const y = touch.y;

    const { currentTool } = this.data;

    // 选择工具模式下，支持拖动
    if (currentTool === 'select') {
      this.setData({
        isPanning: true,
        lastPanX: x,
        lastPanY: y
      });
      return;
    }

    // 绘图模式
    const canvasPos = this.screenToCanvas(x, y);
    
    this.setData({
      lastX: x,
      lastY: y,
      isDrawing: true,
      points: [{x: canvasPos.x, y: canvasPos.y, force: touch.force || 1}]
    });

    // 创建新笔画
    if (currentTool === 'pen' || currentTool === 'eraser') {
      const newStroke = {
        tool: currentTool,
        color: this.data.selectedColor,
        size: this.data.brushSize,
        points: [canvasPos],
        isEraser: currentTool === 'eraser'
      };
      
      this.setData({
        currentStroke: newStroke
      });
      
      // 开始新路径
      // 注意：支付宝小程序旧版 Canvas API 使用物理像素坐标
      // 画布的物理像素尺寸在 axml 中设置为 canvasWidth * dpr
      // 所以绘图坐标需要乘以 dpr
      const dpr = this.dpr || 1;
      this.ctx.beginPath();
      this.ctx.moveTo(canvasPos.x * dpr, canvasPos.y * dpr);
    }
  },

  handlePinchStart(e) {
    if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      
      const dx = t1.x - t2.x;
      const dy = t1.y - t2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 计算双指中点在画布坐标系中的位置
      const centerX = (t1.x + t2.x) / 2;
      const centerY = (t1.y + t2.y) / 2;
      const canvasCenterX = (centerX - this.data.offsetX) / this.data.scale;
      const canvasCenterY = (centerY - this.data.offsetY) / this.data.scale;
      
      this.setData({
        pinchStartDistance: distance,
        pinchStartScale: this.data.scale,
        pinchStartCenterX: canvasCenterX,
        pinchStartCenterY: canvasCenterY
      });
    }
  },

  onTouchMove(e) {
    // 双指缩放优先，不受当前工具和绘图状态限制
    if (e.touches.length > 1) {
      this.handlePinchMove(e);
      return;
    }
    
    const { isDrawing, isPanning, currentTool } = this.data;

    const touch = e.touches[0];
    const x = touch.x;
    const y = touch.y;

    // 拖动画布
    if (isPanning && currentTool === 'select') {
      const dx = x - this.data.lastPanX;
      const dy = y - this.data.lastPanY;
      
      this.setData({
        offsetX: this.data.offsetX + dx,
        offsetY: this.data.offsetY + dy,
        lastPanX: x,
        lastPanY: y
      });
      
      this.redrawCanvas();
      return;
    }

    // 绘图
    if (!isDrawing || !this.ctx) return;
    
    const canvasPos = this.screenToCanvas(x, y);
    this.data.points.push({x: canvasPos.x, y: canvasPos.y, force: touch.force || 1});

    // 绘制线条
    // 旧版 Canvas API 使用物理像素坐标
    const dpr = this.dpr || 1;
    if (currentTool === 'pen') {
      const pressure = touch.force || 1;
      const dynamicSize = Math.max(1, this.data.brushSize * pressure);
      
      this.ctx.setStrokeStyle(this.data.selectedColor);
      this.ctx.setLineWidth(dynamicSize * dpr);
      this.ctx.setLineCap('round');
      this.ctx.setLineJoin('round');
      this.ctx.lineTo(canvasPos.x * dpr, canvasPos.y * dpr);
      this.ctx.stroke();
    } else if (currentTool === 'eraser') {
      this.ctx.setStrokeStyle('#FFFFFF');
      this.ctx.setLineWidth(this.data.brushSize * 3 * dpr);
      this.ctx.setLineCap('round');
      this.ctx.setLineJoin('round');
      this.ctx.lineTo(canvasPos.x * dpr, canvasPos.y * dpr);
      this.ctx.stroke();
    }
    
    // 支付宝小程序需要调用 draw 来更新画布
    this.ctx.draw(true);

    this.setData({
      lastX: x,
      lastY: y
    });

    // 保存笔画点
    if (this.data.currentStroke) {
      this.data.currentStroke.points.push(canvasPos);
    }
  },

  handlePinchMove(e) {
    if (e.touches.length >= 2 && this.data.pinchStartDistance) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      
      const dx = t1.x - t2.x;
      const dy = t1.y - t2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 计算缩放比例，限制在 0.1 到 5 之间
      const newScale = this.data.pinchStartScale * (distance / this.data.pinchStartDistance);
      const clampedScale = Math.max(0.1, Math.min(5, newScale));
      
      // 计算当前双指中点
      const centerX = (t1.x + t2.x) / 2;
      const centerY = (t1.y + t2.y) / 2;
      
      // 计算新的偏移量，使缩放以双指中点为中心
      // 核心：保持 pinchStartCenterX/Y 在屏幕上的位置不变
      const newOffsetX = centerX - this.data.pinchStartCenterX * clampedScale;
      const newOffsetY = centerY - this.data.pinchStartCenterY * clampedScale;
      
      this.setData({
        scale: clampedScale,
        scalePercent: Math.round(clampedScale * 100),
        offsetX: newOffsetX,
        offsetY: newOffsetY
      });
      
      this.redrawCanvas();
    }
  },

  onTouchEnd(e) {
    const { isDrawing, isPanning, currentTool, pinchStartDistance } = this.data;
    
    // 双指操作结束，清除缩放状态
    if (pinchStartDistance) {
      this.setData({
        pinchStartDistance: null,
        pinchStartScale: null,
        pinchStartCenterX: null,
        pinchStartCenterY: null
      });
      return;
    }
    
    if (isPanning && currentTool === 'select') {
      this.setData({
        isPanning: false
      });
      return;
    }

    if (isDrawing) {
      this.setData({
        isDrawing: false
      });
      
      // 保存完成的笔画并重绘
      if (this.data.currentStroke) {
        const strokes = this.data.strokes;
        strokes.push(this.data.currentStroke);
        this.setData({
          strokes: strokes,
          currentStroke: null
        });
        // 重绘以统一显示
        this.redrawCanvas();
      }
    }
  },

  onTouchCancel(e) {
    this.setData({
      isDrawing: false,
      isPanning: false,
      pinchStartDistance: null,
      pinchStartScale: null,
      pinchStartCenterX: null,
      pinchStartCenterY: null
    });
  },

  // 重绘整个画布
  redrawCanvas() {
    if (!this.ctx) return;
    
    const { strokes, scale, offsetX, offsetY } = this.data;
    const dpr = this.dpr || 1;
    
    // 清空画布（使用物理像素尺寸）
    this.ctx.setFillStyle('#FFFFFF');
    this.ctx.fillRect(0, 0, this.canvasWidth * dpr, this.canvasHeight * dpr);
    
    // 重绘所有笔画（使用物理像素坐标）
    strokes.forEach(stroke => {
      if (stroke.points.length < 1) return;
      
      // 应用用户缩放和偏移，再转换为物理像素坐标
      const transformedPoints = stroke.points.map(p => ({
        x: (p.x * scale + offsetX) * dpr,
        y: (p.y * scale + offsetY) * dpr
      }));
      
      this.ctx.beginPath();
      this.ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y);
      
      for (let i = 1; i < transformedPoints.length; i++) {
        this.ctx.lineTo(transformedPoints[i].x, transformedPoints[i].y);
      }
      
      if (stroke.isEraser) {
        this.ctx.setStrokeStyle('#FFFFFF');
        this.ctx.setLineWidth(stroke.size * 3 * scale * dpr);
      } else {
        this.ctx.setStrokeStyle(stroke.color);
        this.ctx.setLineWidth(stroke.size * scale * dpr);
      }
      
      this.ctx.setLineCap('round');
      this.ctx.setLineJoin('round');
      this.ctx.stroke();
    });
    
    this.ctx.draw();
  },

  clearBoard() {
    if (!this.ctx) {
      this.initCanvas();
      return;
    }
    
    this.setData({
      strokes: [],
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      scalePercent: 100
    });
    
    // 清空画布（使用物理像素尺寸）
    const dpr = this.dpr || 1;
    this.ctx.setFillStyle('#FFFFFF');
    this.ctx.fillRect(0, 0, (this.canvasWidth || 300) * dpr, (this.canvasHeight || 500) * dpr);
    this.ctx.draw();
  },

  // 缩放控制
  zoomIn() {
    const newScale = Math.min(5, this.data.scale * 1.2);
    this.setData({
      scale: newScale,
      scalePercent: Math.round(newScale * 100)
    });
    this.redrawCanvas();
  },

  zoomOut() {
    const newScale = Math.max(0.1, this.data.scale / 1.2);
    this.setData({
      scale: newScale,
      scalePercent: Math.round(newScale * 100)
    });
    this.redrawCanvas();
  },

  resetView() {
    this.setData({
      scale: 1,
      scalePercent: 100,
      offsetX: 0,
      offsetY: 0
    });
    this.redrawCanvas();
  }
});