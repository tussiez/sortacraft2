/*
ChunkGenWorker
Creates voxel terrain using 2d and 3d perlin noise.
@author tussiez
@coauthor xxpertHacker
*/

import VoxelWorld from "../modules/VoxelEngine.js";
import Perlin from "../modules/Perlin.js";

const {
  Math: { round },
  TypeError,
} = globalThis;

(async () => {
  const {
    voxWorld,
    perlin,
    cell,
    cellSize,
    seed,
    ...firstWorldData
  } = await new Promise(
    (resolve, reject) => {
      globalThis.addEventListener(
        "message",
        ({ data }) => {
          const [
            op,
            cellSize,
            tileSize,
            tileTextureWidth,
            tileTextureHeight,
            seed,
            x,
            y,
            z,
          ] = data;

          if (op !== "generateWorld") {
            // how did we get here?
            const unreachable = new TypeError("unreachable");
            reject(unreachable);
          } else {
            // Create voxel world
            const voxWorld = new VoxelWorld({
              cellSize,
              tileSize,
              tileTextureWidth,
              tileTextureHeight,
            });

            const cell = voxWorld.cells["0,0,0"] = new Uint8Array(
              cellSize ** 3,
            );

            resolve({
              voxWorld,
              perlin: new Perlin(seed),
              cell,
              seed,
              x,
              y,
              z,
              cellSize,
            });
          }
        },
        {
          once: true,
          passive: true,
        },
      );
    },
  );

  globalThis.addEventListener(
    "message",
    ({ data }) => {
      const { 0: op, 6: x, 7: y, 8: z } = data;
      if ("generateWorld" === op) {
        makeWorld(seed, x, y, z, cellSize);
      }
    },
    {
      passive: true,
    },
  );

  {
    const { x, y, z } = firstWorldData;
    makeWorld(
      seed,
      x,
      y,
      z,
      cellSize,
    );
  }

  function getBiome(x, z, hm, cellSize) {
    const g = perlin.noise(x / 0x100, z / 0x100, 0);
    if (hm > cellSize - 5) return 33;
    else if (g >= 0.7) return 33;
    else if (g > 0.3) return 2;
    else if (g < 0.3) return 3;
  }

  function mineHeight(x, z, y = 0, cellSize) {
    const eleD = perlin.noise(x / 32, z / 32, y) * 128 + 32;
    const ele = perlin.noise(x / eleD, z / eleD, y);
    const rough = perlin.noise(x / 64, z / 64, y);
    const det = perlin.noise(x / 32, z / 32, y);
    return round(((ele + (rough * det) * 0.3) * cellSize));
  }

  function makeWorld(seed, x1, y1, z1, cellSize) {
    cell.fill(0); // clear array

    x1 *= cellSize;
    y1 *= cellSize;
    z1 *= cellSize;

    for (let x = 0; x < cellSize; ++x) {
      for (let z = 0; z < cellSize; ++z) {
        const hm = mineHeight(x + x1, z + z1, 0, cellSize);
        const biome = getBiome(x + x1, z + z1, hm, cellSize);
        voxWorld.setVoxel(x, hm, z, biome);
        for (let y = 0; y < cellSize; ++y) {
          const type0 = y < hm - 2 ? 1 : 6;
          const type1 = y > hm - 3 && 3 === biome ? 3 : type0;
          const type2 = y === hm ? 2 : type1;
          const type = y !== cellSize - 1 ? type2 : biome;

          let hasCave = false;

          if (y < hm) {
            const cave = perlin.noise(
              (x + x1) / 12,
              (y + y1) / 12,
              (z + z1) / 12,
            );

            const atten = .25 - ((y / 120) - 0.10);

            if (cave > atten || 0 === y) {
              voxWorld.setVoxel(x, y, z, type);
            } else {
              hasCave = true;
              if (y === hm - 1) {
                voxWorld.setVoxel(x, hm, z, 0);
              }
            }
          }
        }
        const cactiNoise = perlin.noise((x + x1) / 2, (z + z1) / 2, 0);

        if (
          3 === biome &&
          cactiNoise > .8 &&
          0 !== voxWorld.getVoxel(x, hm - 1, z)
        ) {
          for (let i = 1; i <= cactiNoise * 5 - 2; ++i) {
            voxWorld.setVoxel(x, hm + i, z, 47);
          }
        }
      }
    }

    postMessage(["done", cell, x1 / cellSize, y1 / cellSize, z1 / cellSize]);
  }
})();
