import VoxelWorld from "../modules/VoxelEngine.js";
import Perlin from "../modules/Perlin.js";

let voxWorld, perlin;

globalThis.onmessage = function ({ data }) {
  if ("generateWorld" == data[0]) {
    const [
      ,
      cellSize,
      tileSize,
      tileTextureWidth,
      tileTextureHeight,
      seed,
      x,
      y,
      z,
    ] = data;

    voxWorld = new VoxelWorld({
      cellSize,
      tileSize,
      tileTextureWidth,
      tileTextureHeight,
    });
    // Create voxel world
    makeWorld(seed, x, y, z, cellSize);
  }
};

function makeWorld(seed, x1, y1, z1, cellSize) {
  x1 *= cellSize;
  y1 *= cellSize;
  z1 *= cellSize;
  perlin = new Perlin(seed);
  for (let x = 0; x < cellSize; ++x) {
    for (let z = 0; z < cellSize; ++z) {
      const hm = mineHeight(x, z);
      const biome = getBiome(x, z, hm);
      voxWorld.setVoxel(x, hm, z, biome);
      for (let y = 0; y < cellSize; ++y) {
        let type = y < hm - 2 ? 1 : 6;
        type = (y > hm - 3 && 3 == biome) ? 3 : type;
        type = y == hm ? 2 : type;
        type = y != cellSize - 1 ? type : biome;
        if (y < hm) {
          const cave = perlin.noise((x + x1) / 12, (y + y1) / 12, (z + z1) / 12);
          const atten = 0.25 - ((y / 120) - 0.10);
          if (cave > atten || y == 0) {
            voxWorld.setVoxel(x, y, z, type);
          } else {
            if (y == hm - 1) {
              voxWorld.setVoxel(x, hm, z, 0);
            }
          }
        }
      }
      const cactiNoise = perlin.noise((x + x1) / 2, (z + z1) / 2, 0);
      if (
        biome == 3 && cactiNoise > .8 && voxWorld.getVoxel(x, hm - 1, z) != 0
      ) {
        for (let i = 0; i < (cactiNoise * 5 - 2); ++i) {
          voxWorld.setVoxel(x, hm + i + 1, z, 47);
        }
      }
    }
  }
  const cell = voxWorld.cells["0,0,0"];
  postMessage(["done", cell, x1 / cellSize, y1 / cellSize, z1 / cellSize]);

  function getBiome(x, z, hm) {
    const g = perlin.noise((x + x1) / 256, (z + z1) / 256, 0);

    if (hm > cellSize - 5) return 33;
    if (g >= .7) return 33;
    if (g > .3) return 2;
    if (g < .3) return 3;
  }

  function mineHeight(x, z, y) {
    var x2a = x + x1;
    var z2a = z + z1;
    y = y || 0;
    var eleD = perlin.noise(x2a / 256, z2a / 256, y) * 64 + 128;
    var ele = perlin.noise(x2a / eleD, z2a / eleD, y);
    var rough = perlin.noise(x2a / 64, z2a / 64, y);
    var det = perlin.noise(x2a / 32, z2a / 32, y);
    return Math.round(((ele + (rough * det) * .5) * cellSize));
  }
}
