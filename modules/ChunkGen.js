import Methods from "../modules/Methods.js";

const ChunkGen = function () {
  this.worker = new Worker("../modules/ChunkGenWorker.js", { type: "module" });
  //You can bind to functions scope. Pretty much eliminates the need to make a variable with the scope outside of the function and use it inside... :D - Baconman
  this.setVoxelWorldParams = function (
    cellSize,
    tileSize,
    tileTextureWidth,
    tileTextureHeight,
  ) {
    this.cellSize = cellSize;
    this.tileSize = tileSize;
    this.tileTextureWidth = tileTextureWidth;
    this.tileTextureHeight = tileTextureHeight;
  };
  this.generateChunk = function (x, y, z, seed) {
    this.worker.postMessage([
      "generateWorld",
      this.cellSize,
      this.tileSize,
      this.tileTextureWidth,
      this.tileTextureHeight,
      seed,
      x,
      y,
      z,
    ]);
  };
  this.worker.onmessage = function (e) {
    if (e.data[0] == "done") {
      this.onComplete(e.data[1], [...e.data.splice(2)]);
    }
  }.bind(this);
};

export default ChunkGen;
