/**
 * A controller to handle the
 * @param {Tileset} tileset
 */
export default class Generator {
  constructor(tileset) {
    this.tileset = tileset;
  }

  /**
   * Get rid of everything and reset back to blank canvas
   */
  clear() {
    return canvas.scene.update({
      tiles: [],
      walls: []
    });
  }

  /**
   * Implement a configuration by drawing it to the Canvas scene
   * @param {object} configuration    The configuration to apply
   * @return {Promise<Scene>}         The updated Scene
   */
  commit(configuration) {
    return canvas.scene.update(configuration);
  }

  /**
   * Generate a usable Tileset configuration
   * @param {object} options
   * @param {string} [options.size=small]
   * @param {number} [options.entrances=1]
   * @return {object} configuration
   */
  generate({size="small", entrances=1}={}) {

    // TODO - for testing, just return an empty scene
    return {tiles: [], walls: []};

    // Unsuccessful
    throw new Error("We failed");

    // Successful
    const configuration = {};
    return configuration;
  }
}
