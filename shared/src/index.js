/**
 * @file shared 入口，导出所有业务逻辑模块
 */

// 从同级文件导入五子棋逻辑
const { Wuziqi } = require('./wuziqi');

// 如果后续还有别的模块，也可以在这里一并 export
// const { validateRoom } = require('./validate')
// const { calcScore } = require('./score')

module.exports = {
  Wuziqi,
  // validateRoom,
  // calcScore,
};