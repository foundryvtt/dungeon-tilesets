/**
 * @typedef {Object} RoomData
 */

/**
 * @param {RoomData}    The base room data
 */
export default class Room {
  constructor(roomData) {
    this.img = "path"
    this.data = roomData;
  }

  /**
   * @param {string} direction    n/s/e/w
   * @returns {RoomData}
   */
  rotate(direction) {
    // math here
    return rotatedData
  }

  /**
   * @param {boolean} x
   * @param {boolean} y
   * @returns {RoomData}
   */
  flip(x, y) {
    // math here
    return flippedData
  }

  /**
   * @returns {RoomData[]}
   */
  getPermutations() {
    // 16 permutations per room
    return permutations;
  }

  /**
   * @param {string} roomName
   * @returns {Promise<Room>}
   */
  static async fromJSON(roomName) {
    return new this(roomData);
  }

}