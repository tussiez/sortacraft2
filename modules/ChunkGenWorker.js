import VoxelWorld from '../modules/VoxelEngine.js'
import Perlin from '../modules/Perlin.js'

let voxWorld, perlin;

onmessage = function (e) {
  if (e.data[0] == 'generateWorld') {
    voxWorld = new VoxelWorld({
      cellSize: e.data[1],
      tileSize: e.data[2],
      tileTextureWidth: e.data[3],
      tileTextureHeight: e.data[4]
    });
    // Create voxel world
    let seed = e.data[5];
    let x = e.data[6], y = e.data[7], z = e.data[8], cellSize = e.data[1];
    makeWorld(seed, x, y, z, e.data[1]);
  }
}


function makeWorld(seed, x1, y1, z1, cellSize) {
  x1 *= cellSize;
  y1 *= cellSize;
  z1 *= cellSize;
  perlin = new Perlin(seed);
  for (let x = 0; x < cellSize; x++) {
    for (let z = 0; z < cellSize; z++) {
      let hm = mineHeight(x, z);
      let biome = getBiome(x, z, hm);
      let cactiNoise = perlin.noise((x+x1)/2,(z+z1)/2,0);
      if(biome == 3 && cactiNoise > .8){
        for(let i = 0;i < cactiNoise*5-2;i++){
          voxWorld.setVoxel(x,hm+i+1,z,47);
        }
      }
      voxWorld.setVoxel(x, hm, z, biome);
      for (let y = 0; y < cellSize; y++) {
        let type = y < hm - 2 ? 1 : 6;
        type = (y > hm - 3 && biome == 3) ? 3 : type;
        type = y == hm ? 2 : type;
        type = y != cellSize - 1 ? type : biome;
        let cave = false;
        if (y < hm) {
          let cave = perlin.noise((x + x1) / 12, (y + y1) / 12, (z + z1) / 12);
          let atten = .25 - ((y / 120) - .10)
          if (cave > atten || y == 0) {
            voxWorld.setVoxel(x, y, z, type);

          } else {
            cave = true;
            if (y == hm - 1) {
              voxWorld.setVoxel(x, hm, z, 0)
            }
          }
        }
      }

    }
  }
  let cell = voxWorld.cells["0,0,0"];
  postMessage(['done', cell, x1 / cellSize, y1 / cellSize, z1 / cellSize])

  function getBiome(x, z, hm) {
    let g = perlin.noise((x + x1) / 64, (z + z1) / 64, 0);
    if (hm > cellSize - 5) return 33;
    if (g >= .8) return 33;
    if (g > .3) return 2;
    if (g < .3) return 3;
  }

  function mineHeight(x, z, y) {
    var x2a = x + x1;
    var z2a = z + z1;
    y = y || 0;
    var eleD = perlin.noise(x2a / 12, z2a / 12, y) * 52 + 64;
    var ele = perlin.noise(x2a / eleD, z2a / eleD, y);
    var rough = perlin.noise(x2a / 64, z2a / 64, y);
    var det = perlin.noise(x2a / 32, z2a / 32, y);
    return Math.round(((ele + (rough * det) * .5) * cellSize));
  }
}