/*
GeometryDataWorker
Runs voxelWorld.generateGeometryDataForCell in a worker to prevent main thread from freezing
@author tussiez
@coauthor xxpertHacker
*/

import VoxelWorld from "../modules/VoxelEngine.js";
import Methods from "../modules/Methods.js";
// Use voxel engine

let voxelWorld;

globalThis.postMessage(["ready"]);

globalThis.onmessage = ({ data }) => {
  const [op] = data;

  if (op == "makeVoxelWorld") {
    const [, cellSize, tileSize, tileTextureWidth, tileTextureHeight] = data;

    // Create a voxel world
    voxelWorld = new VoxelWorld({
      cellSize,
      tileSize,
      tileTextureWidth,
      tileTextureHeight,
    });
  }
  if ("geometrydata" == op || "geometrydata2" == op) {
    // Assign voxel data to cell.

    // postMessage: ..postMessage(['geometrydata',X,Y,Z,voxels])
    // voxels = Uint8Array of cell
    makeGeometry(data);
  }
};

function makeGeometry(data) {
  const [, x, y, z, voxels] = data;
  const id = voxelWorld.computeCellId(x, y, z);
  const pos = Methods.numArr(Methods.arr(id));
  voxelWorld.cells[id] = voxels;

  // Generate geometry data
  const voxel = voxelWorld
    .generateGeometryDataForCell(...pos);

  // Send geometry data

  globalThis.postMessage([
    data[0],
    voxel,
    x,
    y,
    z,
  ]);
}
