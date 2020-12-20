import Room from "./room.mjs";

/**
 * A controller to handle the
 * @param {Tileset} tileset
 * @param {object} options
 * @param {number} [options.gridSize=200]
 * @param {number} [options.roomSize=9]
 */
export default class Generator {
  constructor(tileset, {gridSize=200, roomSize=9}={}) {
    this.gridSize = gridSize;
    this.roomSize = roomSize;
    this.tileset = tileset;
    this._configure();
  }

  /**
   * The maximum placement attempts which can be tried before a layout is declared invalid
   * @type {number}
   */
  static MAX_ALLOWED_ATTEMPTS = 1000;

  /* -------------------------------------------- */

  /**
   * Get rid of everything and reset back to blank canvas
   */
  clear() {
    return canvas.scene.update({
      tiles: [],
      walls: []
    });
  }

  /* -------------------------------------------- */

  /**
   * Implement a configuration by drawing it to the Canvas scene
   * @param {object} configuration    The configuration to apply
   * @return {Promise<Scene>}         The updated Scene
   */
  commit(configuration) {
    return canvas.scene.update(configuration);
  }

  /* -------------------------------------------- */

  /**
   * Generate a usable Tileset configuration
   * @param {object} options
   * @return {object} configuration
   */
  generate(options={}) {

    // Configure the generator
    this._configure(options);

    // Generate room configuration
    this._generate();

    // Export scene data
    return this._export();
  }

  /* -------------------------------------------- */

  /**
   * Configure the generator to produce a layout with requested options
   * @param {object} options
   * @param {string} [options.size=small]
   * @param {number} [options.entrances=1]
   */
  _configure({size="small", entrances=1}={}) {

    // Determine the layout size
    this.size = size;
    this.nRooms = {
      small: 3,
      medium: 5,
      large: 7
    }[size];

    // Generate the placeholder layout
    this.attempts = 0;
    this.placements = [];
    const nr = Array.fromRange(this.nRooms);
    this.layout = nr.map(r => nr.map(i => null));
  }

  /* -------------------------------------------- */

  /**
   * Get the size of the canvas which should be set for a dungeon of a specified size
   * @param {string} size     The desired dungeon size
   * @returns {number}        The pixel size in width and height
   * @private
   */
  _getCanvasSize(size) {
    return this.nRooms * this.roomSize * this.gridSize;
  }

  /* -------------------------------------------- */

  /**
   * Place tiles until the layout is completed or the maximum allowed attempts are surpassed.
   * @private
   */
  _generate() {
    const max = Generator.MAX_ALLOWED_ATTEMPTS;
    let isComplete = false;
    while ( !isComplete && (this.attempts < max) ) {
      try {
        this.attempts++;
        this._try();
        isComplete = this.placements.length === this.roomSize;
      } catch(err) {
        this._backtrack();
      }
    }
    if ( !isComplete ) {
      // throw new Error(`We failed to generate a valid layout after ${max} attempts`);
      console.error(`We failed to generate a valid layout after ${max} attempts`);
    }
  }

  /* -------------------------------------------- */

  /**
   * Try a new placement
   * @private
   */
  _try() {

    // Determine the next location to place
    const [x, y] = this._getNextLocation();

    // Get existing constraints for that location
    const constraints = this._getAdjacentConstraints(x, y);

    // Get candidate Rooms that can provide permutations
    const rooms = this.tileset.findRooms({
      minOpen: !this.placements.length ? 9 : undefined
    });

    // Get the permutations which satisfy the constraints
    const permutations = this._getMatchingPermutations(rooms, constraints);
    if ( permutations.length === 0 ) {
      throw new Error("We failed");
    }

    // Choose a permutation at random
    const chosen = permutations[Math.floor(Math.random() * permutations.length)];

    // Add the chosen permutation to the layout
    this.placements.push([x, y]);
    this.layout[x][y] = chosen;
  }

  /* -------------------------------------------- */

  /**
   * Step backwards by removing the last attempted placement
   * @private
   */
  _backtrack() {
    if ( !this.placements.length ) {
      throw new Error("We failed completely");
    }
    const [x, y] = this.placements.pop();
    this.layout[x][y] = null;
  }

  /* -------------------------------------------- */
  /*  Generation Helpers                          */
  /* -------------------------------------------- */

  /**
   * Return the adjacent room configurations for a given position.
   * Return a RoomData object if one is assigned.
   * Return null if the adjacent position is blank.
   * Return false if the adjacent position is an outer edge.
   * @param {number} x    The target column coordinate
   * @param {number} y    The target row coordinate
   * @returns {
   *   n: (RoomData|null|boolean),
   *   e: (RoomData|null|boolean),
   *   s: (RoomData|null|boolean),
   *   w: (RoomData|null|boolean)
   * }
   */
  getAdjacent(x, y) {
    return {
      n: y === 0 ? false : (this.layout[x][y-1] ?? null),
      e: x === (this.nRooms-1) ? false : (this.layout[x+1][y] ?? null),
      s: y === (this.nRooms-1) ? false : (this.layout[x][y+1] ?? null),
      w: x === 0 ? false : (this.layout[x-1][y] ?? null)
    };
  }

  /* -------------------------------------------- */

  /**
   * Get the current constraints for a certain location
   * @returns {
   *   n: (EdgeData|boolean|null)[],
   *   e: (EdgeData|boolean|null)[],
   *   s: (EdgeData|boolean|null)[],
   *   w: (EdgeData|boolean|null)[]
   * }
   * @private
   */
  _getAdjacentConstraints(x, y) {
    const adjacent = this.getAdjacent(x, y);
    const constraints = {};
    for ( let [k, v] of Object.entries(adjacent) ) {
      constraints[k] = this._getAdjacentEdges(k, v);
    }
    return constraints;
  }

  /* -------------------------------------------- */

  /**
   * Get the edges for an adjacent space
   * @param {string} direction                  The cardinal direction
   * @param {RoomData|boolean|null} adjacent    The contents of the adjacent space
   * @return {(EdgeData|boolean|null)[]}        The adjacent edges
   * @private
   */
  _getAdjacentEdges(direction, adjacent) {

    // Case 1: adjacent is an outer edge, all edges should be closed (false)
    if ( adjacent === false ) return Array.fromRange(this.roomSize).map(n => false);

    // Case 2: adjacent is interior blank, edges can be anything (null)
    if ( adjacent === null ) return Array.fromRange(this.roomSize).map(n => null);

    // Case 3: adjacent is interior data with known edges
    const idx = { n: "s", e: "w", s: "n", w: "e" }[direction]; // reverse the direction
    const edges = duplicate(adjacent.edges[idx]);
    return edges ?? Array.fromRange(this.roomSize).map(n => null);
  }

  /* -------------------------------------------- */

  /**
   * Given a list of rooms and a set of adjacent constraints - find the subset of rooms, if any, which can be used
   * @param {Room[]} rooms                  An array of Room instances which can be evaluated
   * @param {EdgeConstraints} constraints   A set of adjacency constraints which must be satisfied
   * @returns {RoomData[]}                  An array of room permutations which are eligible to be chosen
   * @private
   */
  _getMatchingPermutations(rooms, constraints) {
    const matches = [];

    // Match room permutations
    for ( let r of rooms ) {
      const permutations = r.getPermutations();
      for ( let p of permutations ) {
        const match = this._testPermutation(p, constraints);
        if ( match ) matches.push(p);
      }
    }

    // Allow for a blank tile
    if ( !matches.length ) {
      const blank = Room.getBlankPermutation();
      const match = this._testPermutation(blank, constraints);
      if ( match ) matches.push(blank);
    }
    return matches;
  }

  /* -------------------------------------------- */

  /**
   * Determine whether the edges of a candidate RoomData permutation satisfy the adjacent constraints
   * @param {RoomData} permutation          A candidate room data permutation
   * @param {EdgeConstraints} constraints   A set of adjacent edge constraints
   * @private
   */
  _testPermutation(permutation, constraints) {
    for ( let [k, v] of Object.entries(constraints) ) {
      const match = this._testEdge(permutation.edges[k], v);
      if ( match === false ) return false;
    }
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Test a single edge of a candidate permutation to see if it matches a provided constraint
   * @param {EdgeData[]} edge
   * @param {EdgeData[]} constraint
   * @private
   */
  _testEdge(edge, constraint) {
    return constraint.every((v, i) => {
      const e = edge[i];
      if ( v === null ) return true;    // null can match anything
      else if ( v === false ) return e === false; // Closed must match closed
      else return !!e === !!v;          // Open must match open
    });
  }

  /* -------------------------------------------- */

  /**
   * Determine the next tile location to try and place
   * @returns {number[]}
   * @private
   */
  _getNextLocation() {

    // Case 1: a brand new layout
    if ( !this.placements.length ) {
      const i1 = Math.floor(this.nRooms / 2);
      return [i1, i1];
    }

    // Case 2: adjacent to the last placement
    const last = this.placements[this.placements.length - 1];
    const adjacent = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for ( let a of adjacent ) {
      let next = [last[0]+a[0], last[1]+a[1]];
      if ( !next[0].between(0, this.nRooms-1) ) continue;
      if ( !next[1].between(0, this.nRooms-1) ) continue;
      if ( !this.placements.some(p => p.equals(next)) ) return next;
    }

    // Case 3: pick a random position which is not yet placed
    const spaces = Array.from(this.nRooms);
    const remaining = [];
    for ( let x of spaces ) {
      for ( let y of spaces ) {
        let next = [x, y];
        if ( !this.placements.some(p => p.equals(next)) ) remaining.push(next);
      }
    }
    if ( !remaining.length ) throw new Error("Failed to determine the next room location");
    return remaining[Math.floor(Math.random() * remaining.length)];
  }

  /* -------------------------------------------- */

  /**
   * Export the generated dungeon layout to Scene data
   * @returns {{padding: number, size: number, width: number, height: number}}
   * @private
   */
  _export() {

    // Get the canvas dimensions
    const s = this._getCanvasSize(this.size);
    const config = {
      width: s,
      height: s,
      size: this.gridSize,
      padding: 0,
      backgroundColor: "#000000",
      tiles: [],
      walls: []
    };

    // Get tile configuration
    for ( let [x, col] of this.layout.entries() ) {
      for ( let [y, d] of col.entries() ) {
        if ( d === null ) continue;
        const s = this.roomSize * this.gridSize;
        const tileData = {
          x: x * s,
          y: y * s,
          width: s,
          height: s,
          rotation: d.rotation,
          mirrorX: d.mirrorX,
          mirrorY: d.mirrorY,
          img: d.img,
          locked: true
        };
        config.tiles.push(tileData);
      }
    }

    // Return the exported configuration
    return config;
  }
}
