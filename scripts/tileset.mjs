/**
 * The collection of Rooms which can be used in a generated dungeon
 * @param {string} tilesetName      The named tileset
 */
export default class Tileset {
  constructor(tilesetName) {
    this.name = tilesetName;
    this.rooms = [];
  }

  async initialize() {}

  /**
   * Are there rooms that can fit?
   * @param options
   * @returns {Room[]}
   */
  findRooms(options) {
    const matchedRooms = [];
    return matchedRooms;
  }

  reset() {}
}