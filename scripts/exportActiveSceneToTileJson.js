let gridSize = 200;
let gridWidth = 9;
let gridHeight = 9;
let activeScene = game.scenes.find(x => x.active);

function getEdgeTypeFromGrid(x, y, direction) {
  console.log(direction);
  //console.log("X: " + x + ", Y: " + y);
  let translatedX = gridSize * x;
  let translatedY = gridSize * y;
  console.log("Looking up token at " + translatedX + ", " + translatedY);
  let token = activeScene.data.tokens.find(t => t.x == translatedX && t.y == translatedY);
  //console.log(token);
  if (token.name == "Wall") return false;
  let name = token.name.toLowerCase();
  console.log(name);

  let type = "unknown";
  let isMatch = false;


  if (name.includes("hallway")) type = "hallway";

  if (name.includes("north") && direction == "north") isMatch = true;
  if (name.includes("east") && direction == "east") isMatch = true;
  if (name.includes("south") && direction == "south") isMatch = true;
  if (name.includes("west") && direction == "west") isMatch = true;

  if (!isMatch) return false;

  return { type: type };
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

let tileData = {
  name: activeScene.name,
  size: gridWidth,
  walls: activeScene.data.walls,
  edges: {
    n: [],
    e: [],
    s: [],
    w: []
  }
};

// North
for (let x = 0; x < gridWidth; x++) {
  tileData.edges.n.push(getEdgeTypeFromGrid(x, 0, "north"));
}
// East
for (let y = 0; y < gridHeight; y++) {
  tileData.edges.e.push(getEdgeTypeFromGrid(gridWidth - 1, y, "east"));
}
// South
for (let x = gridWidth - 1; x >= 0; x--) {
  tileData.edges.s.push(getEdgeTypeFromGrid(x, gridHeight - 1, "south"));
}
// West
for (let y = gridHeight - 1; y >= 0; y--) {
  tileData.edges.w.push(getEdgeTypeFromGrid(0, y, "west"));
}

console.log(tileData);

// Write to file
let sceneImagePath = activeScene.img;
let jsonWritePath = sceneImagePath.replace(".webp", ".json");
let splitWritePath = jsonWritePath.split("/");
jsonWritePath = splitWritePath[splitWritePath.length - 1];

console.log(jsonWritePath);
download(JSON.stringify(tileData, null, 2), jsonWritePath, "test/plain");