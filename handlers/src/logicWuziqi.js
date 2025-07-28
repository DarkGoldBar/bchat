/** @typedef {import('@bchat/types').Room} Room */
/** @typedef {import('@bchat/types').User} User */
/** @typedef {import('@bchat/types').WuziqiState} WuziqiState */

class Wuziqi {
  /** 
   * @param {Room} room
   * @returns {boolean}
   */
  static canStart(room) {
    return room.members.filter(m => m.position > 0).length === posLimit
  }

  /** 
   * @param {Room} room
   * @returns {Wuziqi}
   */
  static start(room) {
    
  }

  /** @param {WuziqiState} state */
  constructor(state) {}
}

module.exports = { Wuziqi }