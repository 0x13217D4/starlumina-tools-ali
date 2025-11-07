Page({
  data: {
    cards: [],
    expression: '',
    score: 0,
    message: '',
    usedCards: [],
    currentNumbers: []
  },

  onLoad: function() {
    this.startNewGame();
  },

  startNewGame: function() {
    const cards = this.generateRandomCards();
    this.setData({
      cards: cards,
      expression: '',
      message: '',
      usedCards: [],
      currentNumbers: []
    });
  },

  generateRandomCards: function() {
    // 无解的数字组合列表
    const noSolutionCombinations = [
      [1, 1, 1, 1], [1, 1, 1, 2], [1, 1, 2, 2], [1, 2, 2, 2], [2, 2, 2, 2],
      [1, 1, 1, 3], [1, 1, 2, 3], [1, 2, 2, 3], [1, 1, 3, 3], [1, 1, 1, 4],
      [1, 1, 2, 4], [2, 3, 3, 4], [1, 1, 1, 5], [1, 1, 2, 5], [1, 3, 5, 5],
      [2, 5, 5, 5], [3, 5, 5, 5], [1, 1, 1, 6], [2, 2, 2, 6], [2, 5, 5, 6],
      [4, 4, 6, 6], [1, 1, 1, 7], [1, 5, 5, 7], [5, 5, 5, 7], [1, 1, 6, 7],
      [3, 4, 6, 7], [4, 4, 6, 7], [1, 6, 6, 7], [6, 6, 6, 7], [1, 1, 7, 7],
      [1, 5, 7, 7], [3, 5, 7, 7], [1, 6, 7, 7], [2, 6, 7, 7], [6, 6, 7, 7],
      [1, 7, 7, 7], [2, 7, 7, 7], [5, 7, 7, 7], [6, 7, 7, 7], [7, 7, 7, 7],
      [3, 3, 5, 8], [1, 5, 5, 8], [5, 5, 5, 8], [1, 1, 7, 8], [1, 6, 7, 8],
      [6, 6, 7, 8], [1, 7, 7, 8], [5, 7, 7, 8], [6, 7, 7, 8], [7, 7, 7, 8],
      [3, 4, 8, 8], [6, 7, 8, 8], [7, 7, 8, 8], [7, 8, 8, 8], [8, 8, 8, 8],
      [1, 1, 1, 9], [1, 1, 5, 9], [4, 4, 5, 9], [5, 5, 6, 9], [1, 1, 7, 9],
      [2, 2, 7, 9], [5, 5, 7, 9], [2, 7, 7, 9], [4, 7, 7, 9], [6, 7, 7, 9],
      [7, 7, 7, 9], [1, 1, 8, 9], [7, 7, 8, 9], [8, 8, 8, 9], [1, 1, 9, 9],
      [1, 2, 9, 9], [2, 2, 9, 9], [1, 4, 9, 9], [4, 4, 9, 9], [2, 5, 9, 9],
      [6, 6, 9, 9], [2, 7, 9, 9], [5, 7, 9, 9], [7, 7, 9, 9], [1, 8, 9, 9],
      [5, 8, 9, 9], [7, 8, 9, 9], [8, 8, 9, 9], [1, 9, 9, 9], [2, 9, 9, 9],
      [4, 9, 9, 9], [5, 9, 9, 9], [6, 9, 9, 9], [7, 9, 9, 9], [8, 9, 9, 9],
      [9, 9, 9, 9], [1, 1, 1, 10], [3, 3, 4, 10], [1, 1, 5, 10], [3, 5, 5, 10],
      [5, 5, 5, 10], [1, 1, 6, 10], [5, 5, 6, 10], [3, 3, 7, 10], [1, 4, 7, 10],
      [5, 6, 7, 10], [4, 7, 7, 10], [7, 7, 7, 10], [1, 1, 8, 10], [1, 4, 8, 10],
      [3, 5, 8, 10], [2, 7, 8, 10], [3, 7, 8, 10], [7, 7, 8, 10], [1, 1, 9, 10],
      [1, 2, 9, 10], [3, 4, 9, 10], [4, 4, 9, 10], [6, 7, 9, 10], [1, 8, 9, 10],
      [5, 8, 9, 10], [8, 8, 9, 10], [1, 9, 9, 10], [2, 9, 9, 10], [5, 9, 9, 10],
      [7, 9, 9, 10], [8, 9, 9, 10], [9, 9, 9, 10], [1, 1, 10, 10], [1, 2, 10, 10],
      [3, 3, 10, 10], [1, 6, 10, 10], [6, 6, 10, 10], [1, 7, 10, 10], [7, 7, 10, 10],
      [1, 8, 10, 10], [5, 8, 10, 10], [6, 8, 10, 10], [8, 8, 10, 10], [1, 9, 10, 10],
      [4, 9, 10, 10], [6, 9, 10, 10], [7, 9, 10, 10], [8, 9, 10, 10], [9, 9, 10, 10],
      [1, 10, 10, 10], [2, 10, 10, 10], [3, 10, 10, 10], [4, 10, 10, 10], [5, 10, 10, 10],
      [7, 10, 10, 10], [8, 10, 10, 10], [9, 10, 10, 10], [10, 10, 10, 10], [1, 1, 4, 11],
      [1, 1, 5, 11], [1, 2, 5, 11], [3, 3, 5, 11], [4, 5, 5, 11], [5, 5, 5, 11],
      [1, 1, 6, 11], [4, 6, 6, 11], [5, 6, 6, 11], [1, 1, 7, 11], [2, 2, 7, 11],
      [1, 3, 7, 11], [4, 4, 7, 11], [3, 6, 7, 11], [4, 6, 7, 11], [5, 6, 7, 11],
      [3, 7, 7, 11], [7, 7, 7, 11], [1, 1, 8, 11], [1, 2, 8, 11], [2, 2, 8, 11],
      [3, 3, 8, 11], [3, 6, 8, 11], [4, 6, 8, 11], [5, 6, 8, 11], [5, 7, 8, 11],
      [5, 8, 8, 11], [1, 1, 9, 11], [2, 3, 9, 11], [2, 4, 9, 11], [3, 5, 9, 11],
      [4, 5, 9, 11], [1, 6, 9, 11], [4, 6, 9, 11], [6, 7, 9, 11], [7, 7, 9, 11],
      [7, 8, 9, 11], [1, 9, 9, 11], [4, 9, 9, 11], [7, 9, 9, 11], [8, 9, 9, 11],
      [9, 9, 9, 11], [1, 1, 10, 11], [2, 3, 10, 11], [3, 3, 10, 11], [3, 4, 10, 11],
      [4, 4, 10, 11], [1, 6, 10, 11], [6, 6, 10, 11], [1, 7, 10, 11], [6, 7, 10, 11],
      [7, 7, 10, 11], [8, 8, 10, 11], [1, 9, 10, 11], [8, 9, 10, 11], [9, 9, 10, 11],
      [1, 10, 10, 11], [3, 10, 10, 11], [6, 10, 10, 11], [8, 10, 10, 11], [9, 10, 10, 11],
      [10, 10, 10, 11], [3, 3, 11, 11], [1, 4, 11, 11], [3, 4, 11, 11], [4, 4, 11, 11],
      [2, 5, 11, 11], [1, 6, 11, 11], [2, 6, 11, 11], [6, 6, 11, 11], [1, 7, 11, 11],
      [2, 7, 11, 11], [7, 7, 11, 11], [1, 8, 11, 11], [5, 8, 11, 11], [7, 8, 11, 11],
      [8, 8, 11, 11], [5, 9, 11, 11], [6, 9, 11, 11], [9, 9, 11, 11], [1, 10, 11, 11],
      [3, 10, 11, 11], [4, 10, 11, 11], [6, 10, 11, 11], [7, 10, 11, 11], [9, 10, 11, 11],
      [10, 10, 11, 11], [1, 11, 11, 11], [3, 11, 11, 11], [4, 11, 11, 11], [5, 11, 11, 11],
      [6, 11, 11, 11], [7, 11, 11, 11], [8, 11, 11, 11], [10, 11, 11, 11], [11, 11, 11, 11],
      [1, 1, 5, 12], [4, 5, 5, 12], [5, 5, 6, 12], [1, 1, 7, 12], [2, 5, 7, 12],
      [5, 5, 7, 12], [4, 7, 7, 12], [5, 7, 7, 12], [6, 7, 7, 12], [1, 1, 8, 12],
      [1, 2, 8, 12], [5, 7, 8, 12], [7, 7, 8, 12], [5, 8, 8, 12], [1, 1, 9, 12],
      [5, 5, 9, 12], [2, 7, 9, 12], [7, 7, 9, 12], [7, 9, 9, 12], [2, 2, 10, 12],
      [3, 3, 10, 12], [5, 5, 10, 12], [3, 7, 10, 12], [7, 7, 10, 12], [7, 8, 10, 12],
      [5, 9, 10, 12], [9, 9, 10, 12], [6, 10, 10, 12], [9, 10, 10, 12], [1, 4, 11, 12],
      [1, 7, 11, 12], [5, 7, 11, 12], [2, 9, 11, 12], [5, 9, 11, 12], [5, 10, 11, 12],
      [7, 10, 11, 12], [8, 10, 11, 12], [4, 11, 11, 12], [5, 11, 11, 12], [7, 11, 11, 12],
      [8, 11, 11, 12], [9, 11, 11, 12], [2, 9, 12, 12], [2, 10, 12, 12], [3, 10, 12, 12],
      [5, 10, 12, 12], [4, 11, 12, 12], [7, 11, 12, 12], [5, 12, 12, 12], [7, 12, 12, 12],
      [8, 12, 12, 12], [1, 3, 3, 13], [3, 3, 3, 13], [1, 1, 4, 13], [1, 4, 4, 13],
      [4, 4, 4, 13], [1, 1, 5, 13], [2, 2, 5, 13], [3, 5, 5, 13], [4, 5, 5, 13],
      [5, 5, 5, 13], [1, 1, 6, 13], [5, 5, 6, 13], [4, 6, 6, 13], [5, 6, 6, 13],
      [6, 6, 6, 13], [1, 1, 7, 13], [1, 2, 7, 13], [2, 4, 7, 13], [3, 4, 7, 13],
      [5, 5, 7, 13], [1, 6, 7, 13], [4, 6, 7, 13], [6, 6, 7, 13], [1, 7, 7, 13],
      [4, 7, 7, 13], [5, 7, 7, 13], [6, 7, 7, 13], [7, 7, 7, 13], [1, 1, 8, 13],
      [2, 2, 8, 13], [1, 7, 8, 13], [5, 7, 8, 13], [6, 7, 8, 13], [7, 7, 8, 13],
      [1, 8, 8, 13], [3, 8, 8, 13], [6, 8, 8, 13], [2, 2, 9, 13], [4, 4, 9, 13],
      [2, 5, 9, 13], [5, 5, 9, 13], [2, 6, 9, 13], [6, 7, 9, 13], [7, 7, 9, 13],
      [1, 9, 9, 13], [4, 9, 9, 13], [5, 9, 9, 13], [6, 9, 9, 13], [8, 9, 9, 13],
      [9, 9, 9, 13], [1, 3, 10, 13], [1, 4, 10, 13], [3, 6, 10, 13], [4, 6, 10, 13],
      [2, 7, 10, 13], [4, 7, 10, 13], [3, 8, 10, 13], [4, 8, 10, 13], [5, 8, 10, 13],
      [6, 9, 10, 13], [7, 9, 10, 13], [1, 10, 10, 13], [3, 10, 10, 13], [4, 10, 10, 13],
      [7, 10, 10, 13], [8, 10, 10, 13], [1, 3, 11, 13], [1, 4, 11, 13], [2, 4, 11, 13],
      [1, 5, 11, 13], [2, 5, 11, 13], [3, 5, 11, 13], [4, 6, 11, 13], [1, 7, 11, 13],
      [2, 7, 11, 13], [3, 7, 11, 13], [2, 8, 11, 13], [3, 8, 11, 13], [4, 9, 11, 13],
      [7, 9, 11, 13], [1, 10, 11, 13], [5, 10, 11, 13], [6, 10, 11, 13], [8, 10, 11, 13],
      [3, 11, 11, 13], [4, 11, 11, 13], [5, 11, 11, 13], [6, 11, 11, 13], [7, 11, 11, 13],
      [8, 11, 11, 13], [9, 11, 11, 13], [1, 4, 12, 13], [2, 4, 12, 13], [1, 5, 12, 13],
      [5, 7, 12, 13], [1, 8, 12, 13], [5, 8, 12, 13], [6, 8, 12, 13], [1, 9, 12, 13],
      [4, 9, 12, 13], [7, 9, 12, 13], [3, 10, 12, 13], [3, 11, 12, 13], [5, 11, 12, 13],
      [7, 11, 12, 13], [8, 11, 12, 13], [4, 12, 12, 13], [5, 12, 12, 13], [8, 12, 12, 13],
      [9, 12, 12, 13], [3, 3, 13, 13], [1, 4, 13, 13], [3, 4, 13, 13], [4, 4, 13, 13],
      [1, 5, 13, 13], [2, 5, 13, 13], [1, 6, 13, 13], [2, 6, 13, 13], [6, 6, 13, 13],
      [2, 7, 13, 13], [6, 7, 13, 13], [7, 7, 13, 13], [1, 8, 13, 13], [5, 8, 13, 13],
      [7, 8, 13, 13], [8, 8, 13, 13], [1, 9, 13, 13], [4, 9, 13, 13], [5, 9, 13, 13],
      [6, 9, 13, 13], [8, 9, 13, 13], [9, 9, 13, 13], [1, 10, 13, 13], [2, 10, 13, 13],
      [3, 10, 13, 13], [4, 10, 13, 13], [6, 10, 13, 13], [7, 10, 13, 13], [9, 10, 13, 13],
      [10, 10, 13, 13], [3, 11, 13, 13], [4, 11, 13, 13], [5, 11, 13, 13], [6, 11, 13, 13],
      [7, 11, 13, 13], [8, 11, 13, 13], [10, 11, 13, 13], [11, 11, 13, 13], [4, 12, 13, 13],
      [5, 12, 13, 13], [7, 12, 13, 13], [8, 12, 13, 13], [9, 12, 13, 13], [1, 13, 13, 13],
      [3, 13, 13, 13], [4, 13, 13, 13], [5, 13, 13, 13], [6, 13, 13, 13], [7, 13, 13, 13],
      [8, 13, 13, 13], [9, 13, 13, 13], [13, 13, 13, 13]
    ];

    // 检查数字组合是否在无解列表中
    function isNoSolution(cards) {
      const sortedCards = [...cards].sort((a, b) => a - b);
      return noSolutionCombinations.some(noSolution => {
        return noSolution.every((num, index) => num === sortedCards[index]);
      });
    }

    // 生成随机数字组合，直到找到不在无解列表中的组合
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (attempts < maxAttempts) {
      const cards = [];
      for (let i = 0; i < 4; i++) {
        cards.push(Math.floor(Math.random() * 13) + 1);
      }
      
      if (!isNoSolution(cards)) {
        console.log('生成的随机数字组合:', cards, '尝试次数:', attempts + 1);
        return cards;
      }
      
      attempts++;
    }
    
    // 如果尝试1000次都没找到有解的组合，返回一个默认的有解组合
    console.log('无法找到有解的随机组合，使用默认组合');
    return [1, 2, 3, 4];
  },

  onNumberTap: function(e) {
    const value = e.currentTarget.dataset.value;
    const index = e.currentTarget.dataset.index;
    
    // 检查该数字是否已经被使用过
    if (this.data.usedCards.includes(index)) {
      this.showMessage('该数字已经使用过了！', 'error');
      return;
    }

    // 添加到表达式
    const newExpression = this.data.expression + value;
    this.setData({
      expression: newExpression,
      usedCards: [...this.data.usedCards, index],
      currentNumbers: [...this.data.currentNumbers, value]
    });
  },

  onOperatorTap: function(e) {
    const operator = e.currentTarget.dataset.value;
    const expression = this.data.expression;
    
    // 检查表达式是否为空或最后一个字符是否为运算符或左括号
    if (expression === '' || this.isOperator(expression[expression.length - 1]) || expression[expression.length - 1] === '(') {
      this.showMessage('请先输入数字！', 'error');
      return;
    }

    // 添加运算符到表达式
    const displayOperator = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
    this.setData({
      expression: expression + displayOperator
    });
  },

  onBracketTap: function(e) {
    const bracket = e.currentTarget.dataset.value;
    const expression = this.data.expression;
    
    if (bracket === '(') {
      // 左括号可以在表达式开头、运算符后或其他左括号后
      const lastChar = expression[expression.length - 1];
      if (expression === '' || this.isOperator(lastChar) || lastChar === '(') {
        this.setData({
          expression: expression + bracket
        });
      } else {
        this.showMessage('左括号只能在开头或运算符后使用！', 'error');
      }
    } else if (bracket === ')') {
      // 右括号需要确保前面有对应的左括号且不是运算符
      if (expression === '') {
        this.showMessage('表达式不能以右括号开头！', 'error');
        return;
      }
      
      const lastChar = expression[expression.length - 1];
      if (this.isOperator(lastChar) || lastChar === '(') {
        this.showMessage('右括号前必须有数字或右括号！', 'error');
        return;
      }
      
      // 检查括号匹配
      if (!this.canAddRightBracket(expression)) {
        this.showMessage('没有匹配的左括号！', 'error');
        return;
      }
      
      this.setData({
        expression: expression + bracket
      });
    }
  },

  onClear: function() {
    this.setData({
      expression: '',
      usedCards: [],
      currentNumbers: []
    });
  },

  onDelete: function() {
    const expression = this.data.expression;
    if (expression === '') return;

    // 删除最后一个字符
    const newExpression = expression.slice(0, -1);
    
    // 如果删除的是数字，需要从usedCards和currentNumbers中移除
    const lastChar = expression[expression.length - 1];
    if (!this.isOperator(lastChar)) {
      const newUsedCards = [...this.data.usedCards];
      const newCurrentNumbers = [...this.data.currentNumbers];
      newUsedCards.pop();
      newCurrentNumbers.pop();
      
      this.setData({
        expression: newExpression,
        usedCards: newUsedCards,
        currentNumbers: newCurrentNumbers
      });
    } else {
      this.setData({
        expression: newExpression
      });
    }
  },

  onSubmit: function() {
    const expression = this.data.expression;
    
    // 验证表达式
    if (expression === '') {
      this.showMessage('请输入表达式！', 'error');
      return;
    }

    // 检查是否使用了所有4个数字
    if (this.data.usedCards.length !== 4) {
      this.showMessage('请使用所有4个数字！', 'error');
      return;
    }

    // 计算表达式结果
    try {
      const result = this.evaluateExpression(expression);
      if (Math.abs(result - 24) < 0.0001) {
        this.setData({
          score: this.data.score + 10,
          message: '恭喜！答案正确！+10分'
        });
        setTimeout(() => {
          this.startNewGame();
        }, 2000);
      } else {
        this.showMessage(`结果是 ${result}，不等于24！`, 'error');
      }
    } catch (error) {
      this.showMessage('表达式无效！', 'error');
    }
  },

  onNewGame: function() {
    this.startNewGame();
  },

  isOperator: function(char) {
    return ['+', '-', '*', '/', '×', '÷'].includes(char);
  },

  evaluateExpression: function(expression) {
    // 将显示的运算符转换为JavaScript可识别的运算符
    let jsExpression = expression.replace(/×/g, '*').replace(/÷/g, '/');
    
    console.log('原始表达式:', expression);
    console.log('转换后表达式:', jsExpression);
    
    // 验证表达式格式
    const isValid = this.isValidExpression(jsExpression);
    console.log('表达式验证结果:', isValid);
    
    if (!isValid) {
      throw new Error('Invalid expression');
    }

    // 使用栈式计算方法计算表达式
    try {
      const result = this.calculateExpression(jsExpression);
      console.log('计算结果:', result);
      return result;
    } catch (calcError) {
      console.log('计算错误:', calcError);
      throw calcError;
    }
  },

  // 计算表达式（使用栈式计算）
  calculateExpression: function(expression) {
    const tokens = this.tokenizeExpression(expression);
    const valueStack = [];
    const operatorStack = [];
    
    const precedence = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2
    };
    
    const applyOperator = () => {
      const operator = operatorStack.pop();
      const b = valueStack.pop();
      const a = valueStack.pop();
      
      let result;
      switch (operator) {
        case '+':
          result = a + b;
          break;
        case '-':
          result = a - b;
          break;
        case '*':
          result = a * b;
          break;
        case '/':
          if (b === 0) {
            throw new Error('Division by zero');
          }
          result = a / b;
          break;
      }
      
      valueStack.push(result);
    };
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (this.isNumber(token)) {
        valueStack.push(parseFloat(token));
      } else if (token === '(') {
        operatorStack.push(token);
      } else if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          applyOperator();
        }
        operatorStack.pop(); // 移除左括号
      } else if (this.isOperator(token)) {
        while (operatorStack.length > 0 && 
               operatorStack[operatorStack.length - 1] !== '(' &&
               precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
          applyOperator();
        }
        operatorStack.push(token);
      }
    }
    
    while (operatorStack.length > 0) {
      applyOperator();
    }
    
    return valueStack[0];
  },

  canAddRightBracket: function(expression) {
    let openBrackets = 0;
    for (let char of expression) {
      if (char === '(') {
        openBrackets++;
      } else if (char === ')') {
        openBrackets--;
      }
    }
    return openBrackets > 0;
  },

  isValidExpression: function(expression) {
    console.log('开始验证表达式:', expression);
    
    // 基本验证：表达式不能为空
    if (!expression || expression.length === 0) {
      console.log('表达式为空');
      return false;
    }
    
    // 将表达式分解为token（数字、运算符、括号）
    const tokens = this.tokenizeExpression(expression);
    console.log('表达式tokens:', tokens);
    
    // 检查连续运算符
    for (let i = 0; i < tokens.length - 1; i++) {
      const currentToken = tokens[i];
      const nextToken = tokens[i + 1];
      
      // 如果当前是运算符，下一个不能是运算符（除非是左括号）
      if (this.isOperator(currentToken) && this.isOperator(nextToken)) {
        if (nextToken !== '(') {
          console.log('连续运算符:', currentToken + nextToken);
          return false;
        }
      }
      
      // 如果当前是数字，下一个不能是数字（除非是同一个多位数的一部分）
      if (this.isNumber(currentToken) && this.isNumber(nextToken)) {
        console.log('连续数字token:', currentToken + nextToken);
        return false;
      }
    }
    
    // 验证括号匹配
    let openBrackets = 0;
    for (let token of tokens) {
      if (token === '(') {
        openBrackets++;
      } else if (token === ')') {
        openBrackets--;
        if (openBrackets < 0) {
          console.log('右括号多于左括号');
          return false;
        }
      }
    }
    if (openBrackets !== 0) {
      console.log('括号不匹配，左括号多:', openBrackets);
      return false;
    }

    // 检查表达式是否以数字或左括号开头
    const firstToken = tokens[0];
    if (!this.isNumber(firstToken) && firstToken !== '(') {
      console.log('表达式必须以数字或左括号开头:', firstToken);
      return false;
    }
    
    // 检查表达式是否以数字或右括号结尾
    const lastToken = tokens[tokens.length - 1];
    if (!this.isNumber(lastToken) && lastToken !== ')') {
      console.log('表达式必须以数字或右括号结尾:', lastToken);
      return false;
    }

    console.log('表达式验证通过');
    return true;
  },

  // 将表达式分解为tokens
  tokenizeExpression: function(expression) {
    const tokens = [];
    let currentNumber = '';
    
    for (let char of expression) {
      if (this.isDigit(char)) {
        currentNumber += char;
      } else {
        if (currentNumber) {
          tokens.push(currentNumber);
          currentNumber = '';
        }
        tokens.push(char);
      }
    }
    
    if (currentNumber) {
      tokens.push(currentNumber);
    }
    
    return tokens;
  },

  // 检查字符串是否为有效的数字（支持多位数）
  isNumber: function(str) {
    return /^[0-9]+$/.test(str);
  },

  // 检查字符是否为数字
  isDigit: function(char) {
    return /[0-9]/.test(char);
  },

  showMessage: function(text, type = 'success') {
    this.setData({
      message: text
    });
    
    // 3秒后自动清除消息
    setTimeout(() => {
      this.setData({
        message: ''
      });
    }, 3000);
  }
});