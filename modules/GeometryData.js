/*
Handles geometry data to/from GeometryDataWorker
Creates objects, loads texture
@author tussiez
*/

import * as THREE from '../modules/three.js'
import Methods from '../modules/Methods.js'
function GeometryData(material) {
  let scope = this;
  this.worker = new Worker('modules/GeometryDataWorker.js', { type: 'module' });
  this.material = material;
  this.texture = new THREE.ImageBitmapLoader();
  this.texture.setOptions({imageOrientation: 'flipY'})
  this.texture.load('../resources/img/textures.png', function (bitmap) {
    scope.texture = new THREE.CanvasTexture(bitmap);
    console.log(bitmap.width)
    scope.texture.minFilter = THREE.NearestFilter;
    scope.texture.magFilter = THREE.NearestFilter;
    scope.material.map = scope.texture;
  }, undefined, function (err) {
    console.log(err)
  })
  this.onGeometryUpdate = function (positions, normals, uvs, indices, x, y, z) {
    this.updateMesh(this.setGeometry(positions,normals,uvs,indices),new THREE.Vector3(x,y,z));
  }
  this.setGeometry = function(positions, normals, uvs, indices){
    let geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array(positions), 3
    ));

    geometry.setAttribute('normal', new THREE.BufferAttribute(
      new Float32Array(normals), 3
    ));

    geometry.setAttribute('uv', new THREE.BufferAttribute(
      new Float32Array(uvs), 2
    ));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return geometry;
  }
  this.onGeometry = function (positions, normals, uvs, indices, x, y, z) {
    // Got geometry, create chunk
    let geometry = this.setGeometry(positions,normals,uvs,indices);
    let mesh = this.makeMesh(geometry,new THREE.Vector3(x,y,z));
    this.addMesh(mesh);
  }

  this.makeMesh = function(geometry,position){
    let mesh = new THREE.Mesh(geometry,this.material.clone());
    mesh.position.set(...Methods.spread(position));
    return mesh;
  }

  this.createWorld = function (cellSize, tileSize, tileTextureWidth, tileTextureHeight) {
    this.worker.postMessage(['makeVoxelWorld', cellSize, tileSize, tileTextureWidth, tileTextureHeight]);
  }
  this.getGeometry = function (voxels, x, y, z, update) {
    if (update == undefined || update == false) {
      this.worker.postMessage(['geometrydata', x, y, z, voxels]);
    } else {
      this.worker.postMessage(['geometrydata2', x, y, z, voxels])
    }
  }
  this.worker.onmessage = function (e) {
    if (e.data[0] == 'geometrydata') {
      scope.onGeometry(
        e.data[1].positions,
        e.data[1].normals,
        e.data[1].uvs,
        e.data[1].indices,
        e.data[2],
        e.data[3],
        e.data[4],
      );
    }
    if (e.data[0] == 'geometrydata2') {
      scope.onGeometryUpdate(
        e.data[1].positions,
        e.data[1].normals,
        e.data[1].uvs,
        e.data[1].indices,
        e.data[2],
        e.data[3],
        e.data[4],
      );
    }
  }

}
export default GeometryData;