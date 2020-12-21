
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

  /* -------------------------------------------- */

  /**
   * @param {string} direction    n/s/e/w
   * @returns {RoomData}
   */
  rotate(direction) {
    let rotated = duplicate(this.data);
    rotated.edges = this._rotateEdges(direction, rotated.edges);
    rotated.walls = this._rotateWalls(direction, rotated.walls);
    rotated.rotation = {
      n: 0,
      e: 90,
      s: 180,
      w: 270
    }[direction];
    return rotated;
  }

  /* -------------------------------------------- */

  /**
   * Rotate the edges of the room data to form a rotated permutation
   * @param {string} direction          The desired direction of rotation
   * @param {EdgeConstraints} edges     The existing edge constraints
   * @returns {EdgeConstraints}         The rotated edge constraints
   * @private
   */
  _rotateEdges(direction, edges) {
    const directions = Room.DIRECTIONS;
    const rotations = directions.indexOf(direction);
    const rotated = {};
    for ( let [i, d] of directions.entries() ) {
      const x = (i + rotations) % 4;
      rotated[d] = edges[directions[x]];
    }
    return rotated;
  }

  _rotateWalls(direction, walls) {
    const directions = Room.DIRECTIONS;
    const rotations = directions.indexOf(direction);
    const rotated = {};

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

      rotated[d] = rotatedWalls;
    }
    return rotated;
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
  flipHorizontal(data) {
    let edges = duplicate(data.edges);
    let flipped = duplicate(data);
    flipped.edges.e = edges.w;
    flipped.edges.w = edges.e;
    flipped.mirrorX = true;
    flipped.walls = this._flipWallsHorizontally(flipped.walls);
    return flipped;
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
  flipVertical(data) {
    let edges = duplicate(data.edges);
    let flipped = duplicate(data);
    flipped.edges.n = edges.s;
    flipped.edges.s = edges.n;
    flipped.mirrorY = true;
    return flipped;
  }

  /* -------------------------------------------- */

  /**
   * Prepare an array of 12 permutations which can be supported for each Room
   * @returns {RoomData[]}
   */
  getPermutations() {

    // Generate all 4 rotations
    const rotations = Room.DIRECTIONS.map(d => {
      const p = this.rotate(d);
      p.img = this.img;
      p.mirrorX = false;
      p.mirrorY = false;
      return p;
    });

    // Generate horizontal and vertical flips
    const horizontal = rotations.map(d => this.flipHorizontal(d));
    const vertical = rotations.map(d => this.flipVertical(d));

    // Return all permutations
    return rotations.concat(horizontal).concat(vertical);
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
}