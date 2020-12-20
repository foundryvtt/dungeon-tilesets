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
  // return generator.commit(configuration);
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


Hooks.on("getSceneControlButtons", function(controls) {
  let tileControls = controls.find(x => x.name == "tiles");
  
  tileControls.tools.push({
    icon: "fas fa-th",
    name: "dungeon-generator",
    title: "Dungeonator"
  });
});

Hooks.on("renderSceneControls", function (sceneControls) {
  if (sceneControls.activeTool == "dungeon-generator") {
    new DungeonTilesetsConfig().render(true);
  }
});