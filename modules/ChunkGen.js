/*
ChunkGen
Handles ChunkGenWorker
@author tussiez
@coauthor Baconman321
@coauthor xxpertHacker
*/

// import Methods from "../modules/Methods.js";

const { Worker } = globalThis;

class ChunkGen {
  cellSize;
  tileSize;
  tileTextureWidth;
  tileTextureHeight;
  worker = new Worker("../modules/ChunkGenWorker.js", {
    type: "module",
  });
  // You can bind to functions scope. Pretty much eliminates the need to make a variable with the scope outside of the function and use it inside... :D - Baconman
  // hey, I've updated this code :D ~ xxpertHacker
  setVoxelWorldParams(
    cellSize,
    tileSize,
    tileTextureWidth,
    tileTextureHeight,
  ) {
    this.cellSize = cellSize;
    this.tileSize = tileSize;
    this.tileTextureWidth = tileTextureWidth;
    this.tileTextureHeight = tileTextureHeight;
  }
  generateChunk = (x, y, z, seed) => {
    // passing arrays is really bad, and requires one to know what the array looked like before being passed, passing objects retains names, which helps ~ xxpertHacker
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
  constructor() {
    this.worker.onmessage = ({ data }) => {
      const [op, messageName, ...passedData] = data;
      if ("done" === op) {
        this.onComplete(messageName, passedData);
      }
    };
  }
}

export default ChunkGen;
