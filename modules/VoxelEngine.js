/*
Voxel Engine
@author threejsfundamentals (tutorial)
@author tussiez (this)
*/

const { floor, sqrt, abs } = Math;

const THREE = {
  MathUtils: {
    euclideanModulo: (c, a) => (c % a + a) % a,
  },
}; // euclidean modulo support

class VoxelWorld {
  // Map?
  cells = {};
  constructor(options) {
    this.cellSize = options.cellSize;
    this.tileSize = options.tileSize;
    this.tileTextureWidth = options.tileTextureWidth;
    this.tileTextureHeight = options.tileTextureHeight;
    this.cellSliceSize = this.cellSize ** 2;
  }

  computeCellId(x, y, z) {
    const { cellSize } = this;
    const cellX = floor(x / cellSize);
    const cellY = floor(y / cellSize);
    const cellZ = floor(z / cellSize);

    return `${cellX},${cellY},${cellZ}`;
  }

  computeVoxelOffset(x, y, z) {
    const { cellSize, cellSliceSize } = this;

    const { euclideanModulo } = THREE.MathUtils;

    // why not make `euclideanModulo` do the | 0 for you? ~ xxpertHacker

    const voxelX = euclideanModulo(x, cellSize) | 0;
    const voxelY = euclideanModulo(y, cellSize) | 0;
    const voxelZ = euclideanModulo(z, cellSize) | 0;

    return voxelY * cellSliceSize +
      voxelZ * cellSize +
      voxelX;
  }

  getCellForVoxel(x, y, z) {
    // yup, these are dynamic dictionary lookups ~ xxpertHacker
    return this.cells[this.computeCellId(x, y, z)];
  }

  setVoxel(x, y, z, v) {
    const cell = this.getCellForVoxel(x, y, z) || this.addCellForVoxel(x, y, z);
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    cell[voxelOffset] = v;
  }

  addCellForVoxel(x, y, z) {
    const cellId = this.computeCellId(x, y, z);

    const cell = this.cells[cellId] ||
      (this.cells[cellId] = new Uint8Array(this.cellSize ** 3));

    /*
	const cell = cellId in this.cells
		? this.cells[cellId]
		: this.cells[cellId] = new Uint8Array(this.cellSize ** 3);
    */

    return cell;
  }

  getVoxel(x, y, z) {
    const cell = this.getCellForVoxel(x, y, z);

    // undefined === cell ? ~ xxpertHacker
    if (!cell) {
      return 0;
    } else {
      const voxelOffset = this.computeVoxelOffset(x, y, z);

      return cell[voxelOffset];
    }
  }

  getTransparentVoxel(voxel) {
    if (voxel == 46) {
      return true;
    }
  }

  getCustomBlockType(voxel, typ) {
    return typ == undefined || typ == true ? VoxelWorld.faces : false;
  }

  generateGeometryDataForCell(cellX, cellY, cellZ, rx, ry, rz) {
    const { cellSize, tileSize, tileTextureWidth, tileTextureHeight } = this;
    // pre compute these array sizes ~ xxpertHacker
    const positions = [];
    const normals = [];
    const uvs = []; // (cellSize ** 3) * 2
    const indices = []; // (cellSize ** 3) * 6?
    const startX = cellX * cellSize;
    const startY = cellY * cellSize;
    const startZ = cellZ * cellSize;
    var needsClearVoxel = [];
    for (let y = 0; y < cellSize; ++y) {
      const voxelY = startY + y;
      for (let z = 0; z < cellSize; ++z) {
        const voxelZ = startZ + z;
        for (let x = 0; x < cellSize; ++x) {
          const voxelX = startX + x;
          const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
          const isTransparent = this.getTransparentVoxel(voxel);
          // var realX = rx + voxelX;
          // var realZ = rz + voxelZ;
          if (voxel) {
            // voxel 0 is sky (empty) so for UVs we start at 0
            const uvVoxel = voxel - 1;
            // There is a voxel here but do we need faces for it?
            const custom_blockType = this.getCustomBlockType(voxel);
            const notHalfSelf = this.getCustomBlockType(voxel, true);
            for (const { dir, corners, uvRow } of custom_blockType) {
              const neighbor = this.getVoxel(
                voxelX + dir[0],
                voxelY + dir[1],
                voxelZ + dir[2],
              );
              const neighborTransparent = this.getTransparentVoxel(neighbor);

              //handle voxels

              if (!neighbor || neighborTransparent && !isTransparent) {
                // If no neighbor OR the neighbor is transparent
                addFace(corners, dir, uvRow);
              }
            }
            function addFace(corners, dir, uvRow) {
              const ndx = positions.length / 3;
              for (const { pos, uv } of corners) {
                positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                normals.push(...dir);
                uvs.push(
                  (uvVoxel + uv[0]) * tileSize / tileTextureWidth,
                  1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight,
                );
              }

              indices.push(
                ndx,
                ndx + 1,
                ndx + 2,
                ndx + 2,
                ndx + 1,
                ndx + 3,
              );
            }
          }
        }
      }
    }
    return {
      positions,
      normals,
      uvs,
      indices,
    };
  }

  intersectRay(start, end) { //this not by me, it strange physics :3
    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let dz = end.z - start.z;
    const lenSq = dx * dx + dy * dy + dz * dz;
    const len = sqrt(lenSq);

    dx /= len;
    dy /= len;
    dz /= len;

    let t = 0.0;
    let ix = floor(start.x);
    let iy = floor(start.y);
    let iz = floor(start.z);

    /*
    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);
    const stepZ = Math.sign(dz);
	*/
    const stepX = dx > 0.0 ? 1 : -1;
    const stepY = dy > 0.0 ? 1 : -1;
    const stepZ = dz > 0.0 ? 1 : -1;

    const txDelta = abs(1.0 / dx);
    const tyDelta = abs(1.0 / dy);
    const tzDelta = abs(1.0 / dz);

    const xDist = stepX > 0 ? ix + 1 - start.x : start.x - ix;
    const yDist = stepY > 0 ? iy + 1 - start.y : start.y - iy;
    const zDist = stepZ > 0 ? iz + 1 - start.z : start.z - iz;

    // location of nearest voxel boundary, in units of t
    let txMax = txDelta < Infinity ? txDelta * xDist : Infinity;
    let tyMax = tyDelta < Infinity ? tyDelta * yDist : Infinity;
    let tzMax = tzDelta < Infinity ? tzDelta * zDist : Infinity;

    let steppedIndex = -1;

    // main loop along raycast vector
    while (t <= len) {
      const voxel = this.getVoxel(ix, iy, iz);
      if (voxel) {
        return {
          position: [
            start.x + t * dx,
            start.y + t * dy,
            start.z + t * dz,
          ],
          normal: [
            steppedIndex === 0 ? -stepX : 0,
            steppedIndex === 1 ? -stepY : 0,
            steppedIndex === 2 ? -stepZ : 0,
          ],
          voxel,
        };
      }

      // advance t to next nearest voxel boundary
      if (txMax < tyMax) {
        if (txMax < tzMax) {
          ix += stepX;
          t = txMax;
          txMax += txDelta;
          steppedIndex = 0;
        } else {
          iz += stepZ;
          t = tzMax;
          tzMax += tzDelta;
          steppedIndex = 2;
        }
      } else {
        if (tyMax < tzMax) {
          iy += stepY;
          t = tyMax;
          tyMax += tyDelta;
          steppedIndex = 1;
        } else {
          iz += stepZ;
          t = tzMax;
          tzMax += tzDelta;
          steppedIndex = 2;
        }
      }
    }
    return null;
  }

  static faces = [
    { // left
      uvRow: 0,
      dir: [-1, 0, 0],
      corners: [
        { pos: [0, 1, 0], uv: [0, 1] },
        { pos: [0, 0, 0], uv: [0, 0] },
        { pos: [0, 1, 1], uv: [1, 1] },
        { pos: [0, 0, 1], uv: [1, 0] },
      ],
    },
    { // right
      uvRow: 0,
      dir: [1, 0, 0],
      corners: [
        { pos: [1, 1, 1], uv: [0, 1] },
        { pos: [1, 0, 1], uv: [0, 0] },
        { pos: [1, 1, 0], uv: [1, 1] },
        { pos: [1, 0, 0], uv: [1, 0] },
      ],
    },
    { // bottom
      uvRow: 1,
      dir: [0, -1, 0],
      corners: [
        { pos: [1, 0, 1], uv: [1, 0] },
        { pos: [0, 0, 1], uv: [0, 0] },
        { pos: [1, 0, 0], uv: [1, 1] },
        { pos: [0, 0, 0], uv: [0, 1] },
      ],
    },
    { // top
      uvRow: 2,
      dir: [0, 1, 0],
      corners: [
        { pos: [0, 1, 1], uv: [1, 1] },
        { pos: [1, 1, 1], uv: [0, 1] },
        { pos: [0, 1, 0], uv: [1, 0] },
        { pos: [1, 1, 0], uv: [0, 0] },
      ],
    },
    { // back
      uvRow: 0,
      dir: [0, 0, -1],
      corners: [
        { pos: [1, 0, 0], uv: [0, 0] },
        { pos: [0, 0, 0], uv: [1, 0] },
        { pos: [1, 1, 0], uv: [0, 1] },
        { pos: [0, 1, 0], uv: [1, 1] },
      ],
    },
    { // front
      uvRow: 0,
      dir: [0, 0, 1],
      corners: [
        { pos: [0, 0, 1], uv: [0, 0] },
        { pos: [1, 0, 1], uv: [1, 0] },
        { pos: [0, 1, 1], uv: [0, 1] },
        { pos: [1, 1, 1], uv: [1, 1] },
      ],
    },
  ];

  static faces_half = [ // half block
    { // left
      uvRow: 0,
      dir: [-1, 0, 0],
      corners: [
        { pos: [0, .5, 0], uv: [0, 1] },
        { pos: [0, 0, 0], uv: [0, 0] },
        { pos: [0, .5, 1], uv: [1, 1] },
        { pos: [0, 0, 1], uv: [1, 0] },
      ],
    },
    { // right
      uvRow: 0,
      dir: [1, 0, 0],
      corners: [
        { pos: [1, .5, 1], uv: [0, 1] },
        { pos: [1, 0, 1], uv: [0, 0] },
        { pos: [1, .5, 0], uv: [1, 1] },
        { pos: [1, 0, 0], uv: [1, 0] },
      ],
    },
    { // bottom
      uvRow: 1,
      dir: [0, -1, 0],
      corners: [
        { pos: [1, 0, 1], uv: [1, 0] },
        { pos: [0, 0, 1], uv: [0, 0] },
        { pos: [1, 0, 0], uv: [1, 1] },
        { pos: [0, 0, 0], uv: [0, 1] },
      ],
    },
    { // top
      uvRow: 2,
      dir: [0, 1, 0],
      corners: [
        { pos: [0, .5, 1], uv: [1, 1] },
        { pos: [1, .5, 1], uv: [0, 1] },
        { pos: [0, .5, 0], uv: [1, 0] },
        { pos: [1, .5, 0], uv: [0, 0] },
      ],
    },
    { // back
      uvRow: 0,
      dir: [0, 0, -1],
      corners: [
        { pos: [1, 0, 0], uv: [0, 0] },
        { pos: [0, 0, 0], uv: [1, 0] },
        { pos: [1, .5, 0], uv: [0, 1] },
        { pos: [0, .5, 0], uv: [1, 1] },
      ],
    },
    { // front
      uvRow: 0,
      dir: [0, 0, 1],
      corners: [
        { pos: [0, 0, 1], uv: [0, 0] },
        { pos: [1, 0, 1], uv: [1, 0] },
        { pos: [0, .5, 1], uv: [0, 1] },
        { pos: [1, .5, 1], uv: [1, 1] },
      ],
    },
  ];
}

export default VoxelWorld;
