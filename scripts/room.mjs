
/**
 * The configuration of an edge location.
 * An object represents a known "open" edge
 * A false boolean represents a known "closed" edge
 * A null represents an unknown edge which may be either open or closed
 * @typedef {Object|boolean|null} EdgeData
 */

/**
 * A set of Edge constraints where each cardinal direction has a number of edge constraints equal to the room size.
 * @typedef {Object} EdgeConstraints
 * @property {EdgeData[]} n
 * @property {EdgeData[]} e
 * @property {EdgeData[]} s
 * @property {EdgeData[]} w
 */

/**
 * The configuration of a room.
 * @typedef {Object} RoomData
 * @property {string} name
 * @property {number} size
 * @property {WallData[]} walls
 * @property {EdgeConstraints} edges
 */

/**
 * @param {RoomData}    The base room data
 * @param {Tileset}     A reference back to the Tileset which owns this Room
 */
export default class Room {
  constructor(roomData, tileset) {
    this.tileset = tileset;
    this.data = roomData;
  }

  /* -------------------------------------------- */
  /*  Room Properties                             */
  /* -------------------------------------------- */

  /**
   * The identifying name of the room within the Tileset.
   * @type {string}
   */
  get name() {
    return this.data.name;
  }

  /**
   * The URL path to the image asset for this room
   * @type {string}
   */
  get img() {
    return `${this.tileset.path}/tiles/${this.name}.webp`;
  }

  /**
   * The number of open edges that a Room has
   * @type {number}
   */
  get nOpen() {
    const edges = Object.values(this.data.edges).flat();
    return edges.reduce((n, e) => {
      if ( (e !== false) && !!e.type ) return n+1;
      return n;
    }, 0);
  }

  /* -------------------------------------------- */

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
    // 12 permutations per room
    // TODO - for now, no permutations
    return [duplicate(this.data)];
  }

  /**
   * @param {string} roomName
   * @returns {Promise<Room>}
   */
  static async fromJSON(roomName) {
    return new this(roomData);
  }

}