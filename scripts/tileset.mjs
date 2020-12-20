import Room from "./room.mjs";

/**
 * The collection of Rooms which can be used in a generated dungeon
 * @param {string} name      The named tileset
 */
export default class Tileset {
  constructor(name) {
    this.name = name;
    this.rooms = [];
  }

  /**
   * The URL path to the location of assets for this tileset
   * @type {string}
   */
  get path() {
    return getRoute(`modules/dungeon-tilesets/tilesets/${this.name}`);
  }

  /* -------------------------------------------- */

  /**
   * Initialize the Tileset, loading all available Rooms
   * @returns {Promise<void>}
   */
  async initialize() {
    const contents = await FilePicker.browse("data", `${this.path}/config`);
    const configs = contents.files.filter(f => /.json$/.test(f));
    for ( let c of configs ) {
      const roomData = await fetch(c).then(r => r.json());
      const room = new Room(roomData, this);
      const exists = await srcExists(room.img);
      if ( !exists ) {
        console.error(`The expected source image ${room.img} does not exist for Room ${room.name}`);
        continue;
      }
      this.rooms.push(room);
    }
  }

  /* -------------------------------------------- */

  /**
   * Are there rooms that can fit?
   * @param options
   * @param {number} [minOpen]      The minimum number of open edges
   * @param {number} [maxOpen]      The maximum number of open edges
   * @param {number} [centerOpen]   A minimum number of central openings the room must have
   * @param {number} [cornerOpen]   A minimum number of corner openings the room must have
   * @returns {Room[]}
   */
  findRooms({minOpen, maxOpen, centerOpen, cornerOpen}) {
    const matched = [];
    for ( let r of this.rooms ) {
      const nOpen = r.nOpen;
      if ( Number.isNumeric(minOpen) && (nOpen < minOpen) ) continue;
      if ( Number.isNumeric(maxOpen) && (nOpen > maxOpen) ) continue;
      matched.push(r);
    }
    return matched;
  }
}