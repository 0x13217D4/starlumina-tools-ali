/**
 * 用户认证工具类（支付宝小程序版本）
 */

/**
 * 检查用户是否已登录
 * @returns {Boolean} 是否已登录
 */
function checkIsLoggedIn() {
  let userInfo = my.getStorageSync({ key: 'userInfo' })
  let token = my.getStorageSync({ key: 'token' })
  
  // 处理对象格式返回值
  if (userInfo && typeof userInfo === 'object' && userInfo.data !== undefined) {
    userInfo = userInfo.data
  }
  if (token && typeof token === 'object' && token.data !== undefined) {
    token = token.data
  }
  
  return !!(userInfo && token)
}

/**
 * 获取用户信息
 * @returns {Object} 用户信息
 */
function getUserInfo() {
  let userInfo = my.getStorageSync({ key: 'userInfo' })
  
  // 处理对象格式返回值
  if (userInfo && typeof userInfo === 'object' && userInfo.data !== undefined) {
    userInfo = userInfo.data
  }
  
  return userInfo || null
}

/**
 * 获取登录token
 * @returns {String} 登录token
 */
function getToken() {
  let token = my.getStorageSync({ key: 'token' })
  
  // 处理对象格式返回值
  if (token && typeof token === 'object' && token.data !== undefined) {
    token = token.data
  }
  
  return token || null
}

/**
 * 检查session_key是否过期
 * 支付宝使用 checkSession 替代
 * @param {Function} success 成功回调
 * @param {Function} fail 失败回调
 */
function checkSession(success, fail) {
  my.checkSession({
    success: () => {
      if (success) success()
    },
    fail: () => {
      if (fail) fail()
    }
  })
}

/**
 * 执行登录
 * 支付宝使用 getAuthCode 获取授权码
 * @param {Object} userInfo 用户信息
 * @param {Function} success 成功回调
 * @param {Function} fail 失败回调
 */
function login(userInfo, success, fail) {
  my.getAuthCode({
    scopes: ['auth_base'],
    success: (res) => {
      if (res.authCode) {
        // 这里应该将 authCode 发送到后台服务器换取 userId 和 token
        // 由于没有后台服务器，直接模拟登录成功
        mockLoginSuccess(userInfo, res.authCode, success)
      } else {
        console.log('登录失败：' + res.errorMessage)
        if (fail) fail(res.errorMessage)
      }
    },
    fail: (err) => {
      console.error('my.getAuthCode 调用失败：', err)
      if (fail) fail(err.errorMessage)
    }
  })
}

/**
 * 获取用户授权信息
 * 支付宝使用 getAuthorize 或者 showAuthButton
 * @param {Object} userInfo 用户信息
 * @param {Function} success 成功回调
 * @param {Function} fail 失败回调
 */
function getUserAuth(userInfo, success, fail) {
  my.getOpenUserInfo({
    success: (res) => {
      const userData = JSON.parse(res.response).response
      const userInfoData = {
        avatarUrl: userData.avatar || '',
        nickName: userData.nickName || '支付宝用户',
        gender: userData.gender || 0,
        birthday: ''
      }
      mockLoginSuccess(userInfoData, '', success)
    },
    fail: (err) => {
      console.error('获取用户信息失败:', err)
      // 如果获取失败，使用默认信息
      mockLoginSuccess({
        avatarUrl: '',
        nickName: '支付宝用户',
        gender: 0,
        birthday: ''
      }, '', success)
    }
  })
}

/**
 * 模拟登录成功（实际项目应该调用后台接口）
 * @param {Object} userInfo 用户信息
 * @param {String} code 登录凭证
 * @param {Function} callback 回调函数
 */
function mockLoginSuccess(userInfo, code, callback) {
  const userData = {
    avatarUrl: userInfo.avatarUrl,
    nickName: userInfo.nickName,
    gender: userInfo.gender || 0,
    birthday: ''
  }

  my.setStorageSync({ key: 'userInfo', data: userData })
  my.setStorageSync({ key: 'token', data: 'mock_token_' + Date.now() })
  my.setStorageSync({ key: 'loginTime', data: Date.now() })

  if (callback) callback(userData)
}

/**
 * 退出登录
 */
function logout() {
  try {
    my.removeStorageSync({ key: 'userInfo' })
    my.removeStorageSync({ key: 'token' })
    my.removeStorageSync({ key: 'loginTime' })
    console.log('退出登录成功')
  } catch (e) {
    console.error('退出登录失败:', e)
  }
}

module.exports = {
  checkIsLoggedIn,
  getUserInfo,
  getToken,
  checkSession,
  login,
  getUserAuth,
  logout
}