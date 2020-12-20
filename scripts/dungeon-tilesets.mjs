import Room from "./room.mjs";
import Tileset from "./tileset.mjs"
import Generator from "./generator.mjs";
import DungeonTilesetsConfig from "./config.mjs";

/**
 * Test generation
 */
async function test() {
  const tileset = new Tileset("dungeon");
  await tileset.initialize();
  const generator = new Generator(tileset);
  const configuration = generator.generate();
  return generator.commit(configuration);
}

/**
 * Module initialization actions which occur on Foundry init hook.
 */
Hooks.on("init", function() {
  window.game.tilesets = {
    Room,
    Tileset,
    Generator,
    DungeonTilesetsConfig,
    test
  };
  console.log("Dungeon Tilesets Initialized");
});
