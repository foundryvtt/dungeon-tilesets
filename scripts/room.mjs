
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

  /**
   * The ordered set of cardinal directions a room can be oriented towards
   * @type {[string, string, string, string]}
   */
  static DIRECTIONS = ["n", "e", "s", "w"];

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

  /**
   * Does this Room have at least one central opening?
   * @returns {boolean}
   */
  get hasCenterOpen() {
    for ( let edges of Object.values(this.data.edges) ) {
      const center = edges.slice(3,6);
      if ( center.some(e => !!e) ) return true;
    }
  }

  /**
   * Does this Room have at least one corner opening?
   * @returns {boolean}
   */
  get hasCornerOpen() {
    for ( let edges of Object.values(this.data.edges) ) {
      const c1 = edges.slice(0,3);
      if ( c1.some(e => !!e) ) return true;
      const c2 = edges.slice(6,9);
      if ( c2.some(e => !!e) ) return true;
    }
  }

  /* -------------------------------------------- */

  /**
   * Create a permutation of Room Data which is rotated and/or mirrored
   * @param {string} direction          The cardinal direction to rotate
   * @param {boolean} flipHorizontal    Whether to mirror horizontally
   * @param {boolean} flipVertical      Whether to mirror vertically
   * @returns {RoomData}                A permutation of Room Data
   */
  transform(direction, flipHorizontal=false, flipVertical=false) {
    const transformed = duplicate(this.data);
    transformed.mirrorX = transformed.mirrorY = false;
    transformed.rotation = 0;

    // First apply any mirroring
    if ( flipHorizontal ) this._mirrorX(transformed);
    if ( flipVertical ) this._mirrorY(transformed);

    // Next apply rotation
    this._rotateEdges(direction, transformed);
    this._rotateWalls(direction, transformed);
    return transformed;
  }

  /* -------------------------------------------- */

  /**
   * Rotate the edges of the room data to form a rotated permutation
   * @param {string} direction          The desired direction of rotation
   * @param {RoomData} data             A permutation of Room Data
   * @private
   */
  _rotateEdges(direction, data) {
    const directions = Room.DIRECTIONS;
    const edges = duplicate(data.edges);
    const rotations = directions.indexOf(direction);
    if ( rotations === 0 ) return edges;

    // Rotate once (90 degrees)
    if ( rotations === 1 ) {
      data.edges.n = edges.w.reverse();
      data.edges.e = edges.n;
      data.edges.s = edges.e.reverse();
      data.edges.w = edges.s;
      data.rotation = 90;
    }

    // Rotate twice (180 degrees)
    else if ( rotations === 2 ) {
      data.edges.n = edges.s.reverse();
      data.edges.e = edges.w.reverse();
      data.edges.s = edges.n.reverse();
      data.edges.w = edges.e.reverse();
      data.rotation = 180;
    }

    // Rotate thrice (270 degrees)
    else if ( rotations === 3 ) {
      data.edges.n = edges.e;
      data.edges.e = edges.s.reverse();
      data.edges.s = edges.w;
      data.edges.w = edges.n.reverse();
      data.rotation = 270;
    }
  }

  /* -------------------------------------------- */

  _rotateWalls(direction, data) {
    const directions = Room.DIRECTIONS;
    const rotations = directions.indexOf(direction);
    const walls = duplicate(data.walls);

    for ( let [i, d] of directions.entries() ) {
      const x = (i + rotations) % 4;
      let rotationIndex = directions.indexOf(d);

      let rotatedWalls = [];

      // Already good to go
      if (rotationIndex == 0) {
        rotatedWalls = walls;
      }
      else {
        for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
          let wall = walls[wallIndex];
          let rotatedWall = duplicate(wall);

          for (let numOfRotations = 0; numOfRotations < rotationIndex; numOfRotations++) {
            let point1 = this._rotatePointClockwise(rotatedWall.c[0], rotatedWall.c[1]);
            let point2 = this._rotatePointClockwise(rotatedWall.c[2], rotatedWall.c[3]);
            rotatedWall.c[0] = point1.x;
            rotatedWall.c[1] = point1.y;
            rotatedWall.c[2] = point2.x;
            rotatedWall.c[3] = point2.y;
          }

          rotatedWalls.push(rotatedWall);
        }
      }

      data.walls[d] = rotatedWalls;
    }
  }

  /* -------------------------------------------- */

  // X, Y -> 1800 (Max Y) - Y, X
  _rotatePointClockwise(x, y) {
    // TODO: Don't hardcode the max
    return { x: 1800 - y, y: x };
  }

  /* -------------------------------------------- */

  /**
   * Generate a permutation of the Room Data by flipping its data horizontally
   * @param {RoomData} data       Original un-flipped room data
   * @returns {RoomData}          Horizontally flipped room data
   */
  _mirrorX(data) {
    let edges = duplicate(data.edges);
    data.edges.n = edges.n.reverse();
    data.edges.e = edges.w;
    data.edges.s = edges.s.reverse();
    data.edges.w = edges.e;
    data.mirrorX = !data.mirrorX;
  }

  _flipWallsHorizontally(walls) {
    let flippedWalls = [];

    for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
      let wall = walls[wallIndex];
      let flippedWall = duplicate(wall);

      let point1 = this._flipPointHorizontally(flippedWall.c[0], flippedWall.c[1]);
      let point2 = this._flipPointHorizontally(flippedWall.c[2], flippedWall.c[3]);
      flippedWall.c[0] = point1.x;
      flippedWall.c[1] = point1.y;
      flippedWall.c[2] = point2.x;
      flippedWall.c[3] = point2.y;

      flippedWalls.push(flippedWall);
    }

    return flippedWalls;
  }

  _flipWallsVertically(walls) {
    let flippedWalls = [];

    for (let wallIndex = 0; wallIndex < walls.length; wallIndex++) {
      let wall = walls[wallIndex];
      let flippedWall = duplicate(wall);

      let point1 = this._flipPointVertically(flippedWall.c[0], flippedWall.c[1]);
      let point2 = this._flipPointVertically(flippedWall.c[2], flippedWall.c[3]);
      flippedWall.c[0] = point1.x;
      flippedWall.c[1] = point1.y;
      flippedWall.c[2] = point2.x;
      flippedWall.c[3] = point2.y;

      flippedWalls.push(flippedWall);
    }

    return flippedWalls;
  }

   // X, Y -> 1800 (Max X) - X, Y
   _flipPointHorizontally(x, y) {
    // TODO: Don't hardcode the max
    return { x: 1800 - x, y: y };
  }

  // X, Y -> X, 1800 (Max Y) - Y
  _flipPointVertically(x, y) {
    // TODO: Don't hardcode the max
    return { x: x, y: 1800 - y };
  }

  /* -------------------------------------------- */

  /**
   * Generate a permutation of the Room Data by flipping its data vertically
   * @param {RoomData} data       Original un-flipped room data
   * @returns {RoomData}          Vertically flipped room data
   */
  _mirrorY(data) {
    let edges = duplicate(data.edges);
    data.edges.n = edges.s;
    data.edges.e = edges.e.reverse();
    data.edges.s = edges.n;
    data.edges.w = edges.e.reverse();
    data.mirrorY = !data.mirrorY;
  }

  /* -------------------------------------------- */

  /**
   * Prepare an array of 12 permutations which can be supported for each Room
   * @returns {RoomData[]}
   */
  getPermutations() {
    const permutations = [];
    for ( let m of ["", "mirrorX", "mirrorY"] ) {
      for ( let d of Room.DIRECTIONS ) {
        const p = this.transform(d, m === "mirrorX", m === "mirrorY");
        p.img = this.img;
        p.room = this;
        permutations.push(p);
      }
    }
    return permutations;
  }

  /* -------------------------------------------- */

  static getBlankPermutation() {
    const edges = Array.fromRange(9).map(n => false);
    return {
      name: "Blank",
      size: 9,
      walls: [],
      edges: {
        n: edges,
        e: edges,
        s: edges,
        w: edges
      },
      rotation: 0,
      img: null,
      mirrorX: false,
      mirrorY: false
    }
  }

  /* -------------------------------------------- */

  /**
   * Return an array of the cardinal directions which this Room has open?
   * @returns {string[]}
   */
  static getOpenDirections(data) {
    const open = [];
    for ( let [d, edges] of Object.entries(data.edges) ) {
      if ( edges.some(e => !!e) ) open.push(d);
    }
    return open;
  }
}