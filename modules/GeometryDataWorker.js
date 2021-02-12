/*
GeometryDataWorker
Handles geometry data generation, as a worker.
@author tussiez
*/


import VoxelWorld from '../modules/VoxelEngine.js';
import Methods from '../modules/Methods.js';
// Use voxel engine

let voxelWorld;

postMessage(['ready'])

onmessage = function (e) {
  if (e.data[0] == 'makeVoxelWorld') {
    // Create a voxel world
    voxelWorld = new VoxelWorld({
      cellSize: e.data[1],
      tileSize: e.data[2],
      tileTextureWidth: e.data[3],
      tileTextureHeight: e.data[4],
    });
  }
  if (e.data[0] == 'geometrydata' || e.data[0] == 'geometrydata2') {

    // Assign voxel data to cell.

    // postMessage: ..postMessage(['geometrydata',X,Y,Z,voxels])
    // voxels = Uint8Array of cell
    makeGeometry(e);
  }
}


function makeGeometry(e) {
  let id = voxelWorld.computeCellId(e.data[1],e.data[2],e.data[3]);
  let pos = Methods.numArr(Methods.arr(id));
  voxelWorld.cells[id] = e.data[4];

  // Generate geometry data
  const { positions, normals, uvs, indices } = voxelWorld.generateGeometryDataForCell(...pos);
  // Send geometry data
  postMessage([e.data[0], { positions, normals, uvs, indices }, e.data[1], e.data[2], e.data[3]]);
}