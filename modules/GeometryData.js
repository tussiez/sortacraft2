/*
Run as worker
Handles geometry data to/from GeometryDataWorker
Makes it easier to generate geometries
@author tussiez
@coauthor xxpertHacker
*/

import * as THREE from "../modules/three.js";
import Methods from "../modules/Methods.js";

const { Worker, Float32Array, console } = globalThis;

class GeometryData {
  worker = new Worker("modules/GeometryDataWorker.js", {
    type: "module",
  });

  texture = new THREE.ImageBitmapLoader();

  onGeometryUpdate(
    positions,
    normals,
    uvs,
    indices,
    x,
    y,
    z,
  ) {
    this.updateMesh(
      this.setGeometry(positions, normals, uvs, indices),
      new THREE.Vector3(x, y, z),
    );
  }

  setGeometry(positions, normals, uvs, indices) {
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array(positions),
        3,
      ),
    );

    geometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(
        new Float32Array(normals),
        3,
      ),
    );

    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(
        new Float32Array(uvs),
        2,
      ),
    );
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    return geometry;
  }

  onGeometry(positions, normals, uvs, indices, x, y, z) {
    // Got geometry, create chunk
    const geometry = this.setGeometry(positions, normals, uvs, indices);
    const mesh = this.makeMesh(geometry, new THREE.Vector3(x, y, z));
    this.addMesh(mesh);
  }

  makeMesh(geometry, position) {
    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.position.set(...Methods.spread(position));

    return mesh;
  }

  createWorld(
    cellSize,
    tileSize,
    tileTextureWidth,
    tileTextureHeight,
  ) {
    this.worker.postMessage([
      "makeVoxelWorld",
      cellSize,
      tileSize,
      tileTextureWidth,
      tileTextureHeight,
    ]);
  }

  getGeometry(voxels, x, y, z, update) {
    const message = undefined == update || false == update
      ? "geometrydata"
      : "geometrydata2";

    this.worker.postMessage([message, x, y, z, voxels]);
  }

  constructor(material) {
    this.material = material;
    {
      const { texture } = this;
      texture.setOptions({ imageOrientation: "flipY" });
      texture.load(
        "../resources/img/textures.png",
        (bitmap) => {
          const texture = this.texture = new THREE.CanvasTexture(bitmap);
          console.log(bitmap.width);
          texture.magFilter = texture.minFilter = THREE.NearestFilter;
          material.map = texture;
        },
        undefined,
        console.error,
      );
    }

    this.worker.onmessage = ({ data }) => {
      // captures [this]
      const [op, voxels, x, y, z] = data;
      let key = "";

      switch (op) {
        default: {
          break;
        }
        case "geometrydata": {
          key = "onGeometry";
          // fall through
        }
        case "geometrydata2": {
          key = "onGeometryUpdate";

          {
            const { positions, normals, uvs, indices } = voxels;

            this[key](
              positions,
              normals,
              uvs,
              indices,
              x,
              y,
              z,
            );
          }

          break;
        }
      }
    };
  }
}

export default GeometryData;
