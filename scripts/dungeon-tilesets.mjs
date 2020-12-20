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
  await generator.commit(configuration);
  return generator;
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

/**
 * Extend the scene control buttons to provide a dungeon generation configuration menu.
 */
Hooks.on("getSceneControlButtons", function(controls) {
  let tileControls = controls.find(x => x.name === "tiles");
  tileControls.tools.push({
    icon: "fas fa-th",
    name: "dungeon-generator",
    title: "Dungeonator",
    button: true,
    onClick: () => new DungeonTilesetsConfig().render(true)
  });
});
