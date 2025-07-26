/** @typedef { import('./awsImplement.js') } ImplementInterface */
let impl = null;

/**
 * 注入新的实现 
 * injectInterface 函数必须在 import handlers 之前调用
 * @param { ImplementInterface } newImpl 新的实现对象，必须包含 db 和 ws 属性
 */
function injectInterface(newImpl) {
  impl = newImpl
}

/**
 * 
 * @returns { ImplementInterface }
 */
function getInterface() {
  if (!impl) {
    impl = require('./awsImplement.js');
  }
  return impl;
}

module.exports = {
  injectInterface,  
  getInterface,
}
