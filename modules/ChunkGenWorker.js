/*
ChunkGenWorker
Creates voxel terrain

@author tussiez
@coauthor xxperthacker

sortagames.repl.co
*/

import VoxelWorld from "../modules/VoxelEngine.js";
import Perlin from "../modules/Perlin.js";
import GlobalM from "../modules/GlobalMethods.js";

let voxWorld, perlin;
// Use "GlobalM.debugMode = true;" to show debug logs (all the logs were significantly slowing down the game :/  ).
// GlobalM.debugMode = true;
onmessage = function (e) {
  if (e.data[0] == "generateWorld") {
    if (!voxWorld) {
      voxWorld = new VoxelWorld({
        cellSize: e.data[1],
        tileSize: e.data[2],
        tileTextureWidth: e.data[3],
        tileTextureHeight: e.data[4],
      });

      GlobalM.log("Perlin generating with (%O)!", e.data[5]);
      perlin = new Perlin(e.data[5]);
    } else {
      voxWorld.cells["0,0,0"].fill(0);
    }
    // Create voxel world
    makeWorld(e.data[5], e.data[6], e.data[7], e.data[8], e.data[1]);
  }
};

function getBiome(x, z, hm, cellSize) {
  const g = perlin.noise(x / 256, z / 256, 0);
//  GlobalM.log("Value of `g`: (%O)!", g);

  if (hm > cellSize - 5) {
    return 33;
  } else if (g >= .7) {
    return 33;
  } else if (g > .3) {
    return 2;
  } else if (g < .3) {
    return 3;
  }
}

function mineHeight(x, z, y, cellSize) {
  const eleD = perlin.noise(x / 256, z / 256, y) * 32 + 128;
  const ele = perlin.noise(x / eleD, z / eleD, y);
  const rough = perlin.noise(x / 64, z / 64, y);
  const det = perlin.noise(x / 32, z / 32, y);
  return Math.round(((ele + (rough * det) * .5) * (cellSize)));
}

function makeWorld(seed, x1, y1, z1, cellSize) {
  x1 *= cellSize;
  y1 *= cellSize;
  z1 *= cellSize;
  for (let x = 0; x < cellSize; x++) {
    for (let z = 0; z < cellSize; z++) {
      let hm = mineHeight(x + x1, z + z1, 0, cellSize);
      let biome = getBiome(x + x1, z + z1, hm, cellSize);
      let tallGrass = perlin.noise((x + x1) / 2, (z + z1) / 2, 0);
     // GlobalM.log("tallGrass: (%O)", tallGrass);
      if (hm < 15) biome = 4;
      voxWorld.setVoxel(x, hm, z, biome);
      if (tallGrass > 0.8 && biome == 2) voxWorld.setVoxel(x, hm + 1, z, 48);
      if (tallGrass > 0.85 && biome == 2) voxWorld.setVoxel(x, hm + 2, z, 48);
      for (let y = 0; y < cellSize; y++) {
        let type = y < hm - 2 ? 1 : 6;
        type = (y > hm - 3 && biome == 3) ? 3 : type;
        type = y == hm ? 2 : type;
        type = y != cellSize - 1 ? type : biome;
        type = biome == 4 && y > hm - 5 ? biome : type;
        let cave = false;
        if (y < hm) {
          let cave = perlin.noise((x + x1) / 12, (y + y1) / 12, (z + z1) / 12);
          //GlobalM.log("cave: (%O)", cave);
          let atten = .25 - ((y / 120) - .10);
          if (cave > atten || y == 0) {
            voxWorld.setVoxel(x, y, z, type);
          } else {
            cave = true;
            if (y == hm - 1) { // also not water
              voxWorld.setVoxel(x, hm, z, 0);
            }
          }
        }
        if (biome == 4 && y <= hm && y > hm - 5) {
          voxWorld.setVoxel(x, y, z, biome);
        }
      }

      let cactiNoise = perlin.noise((x + x1) / 2, (z + z1) / 2, 0);
      //GlobalM.log("cactiNoise: (%O)", cactiNoise);
      if (
        biome == 3 && cactiNoise > .8 && voxWorld.getVoxel(x, hm - 1, z) != 0
      ) {
        for (let i = 0; i < cactiNoise * 5 - 2; i++) {
          voxWorld.setVoxel(x, hm + i + 1, z, 47);
        }
      }
    }
  }
  let cell = voxWorld.cells["0,0,0"];
  postMessage(["done", cell, x1 / cellSize, y1 / cellSize, z1 / cellSize]);
}
