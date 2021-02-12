/*
SortaCraft
It's.. SortaCraft
@author tussiez
@coauthor Baconman321
*/


// Imports
import * as THREE from 'https://threejs.org/build/three.module.js';
import Methods from '/modules/Methods.js';
import PlayerControls from '/modules/PlayerControls.js';
import VoxelWorld from '/modules/VoxelEngine.js';
import GeometryData from '/modules/GeometryData.js';
import ChunkGen from '/modules/ChunkGen.js';
import Raycast from '/modules/Raycast.js'
import Commands from '/modules/Commands.js';

Commands.message = (msg) => postMessage(['message', msg])

onmessage = function (e) {
  let command = e.data[0];
  if (handlers[command]) {
    handlers[command](e.data)
  } else {
    console.warn('unknown command')
  }
}

const handlers = {
  pointerLock,
  playerCommand,
  main,
  keydown,
  keyup,
  mousedown,
  mouseup,
  resize,
  mousemove
}

// Variable

let canvas,
  camera,
  scene,
  keys = [],
  controls,
  geometryData,
  cellSize = 32,
  tileSize = 16,
  chunkGen,
  tileTextureWidth = 752,
  tileTextureHeight = 48,
  localWorld,
  emptyCell = new Uint8Array(cellSize * cellSize * cellSize),
  renderer;

let Chunks = {};
let ChunksIndex = [];

let Player = {
  speed: .1,
  canCull: true,
  canMove: false,
  maxReach: 8, // Cannot select things farther than X blocks away
  renderDist: 4 * cellSize,
  canLoad: true,
  seed: Math.floor(Math.random() * 99999),
  selectedVoxel: 1,
  camera: undefined,
  fps: 0,
  getFPS: function () {
    let last = renderer.info.render.frame;
    setTimeout(function () {
      Player.fps = renderer.info.render.frame - last;
      Player.getFPS();
    }, 1000)
  },
}

function keydown(dat) {
  keys[dat[1].toLowerCase()] = true;

  let key = dat[1].toLowerCase();
  if (key == '1') {
    Player.selectedVoxel = 1;
  }
  if (key == '2') {
    Player.selectedVoxel = 46;
  }
  if (key == '3') {
    Player.selectedVoxel = 47;
  }
}

function mousedown(e) {
  if (Player.canMove == true) {
    if (e[1] == 2) {
      modifyChunk(Player.selectedVoxel);
    }
    if (e[1] == 0) {
      modifyChunk(0); //Break block
    }
  }
}

function pointerLock(e) {
  Player.canMove = e[1]
}

function playerCommand(e) {
  Commands.parse(e[1], Player);
}

function mouseup() {
  // Nothing
}

function keyup(dat) {
  keys[dat[1].toLowerCase()] = false;
}

function mousemove(dat) {
  if (Player.canMove == true) {
    // Mous movv
    controls.look(dat[1], dat[2]);

    // Update pointer locattion
    movePointer();
  }
}

function resize(dat) {
  renderer.setSize(dat[1], dat[2], false);
  camera.aspect = dat[1] / dat[2];
  camera.updateProjectionMatrix();
}

function main(c) {
  canvas = c[1];
  console.log('Loading');

  scene = new THREE.Scene();
  scene.background = new THREE.Color('gray');
  scene.fog = new THREE.FogExp2('gray', .01);
  camera = new THREE.PerspectiveCamera(70, c[2] / c[3], 0.1, 500);
  Player.camera = camera;
  renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setSize(c[2], c[3], false); //false for offscreen
  controls = new PlayerControls(camera);

  geometryData = new GeometryData(new THREE.MeshBasicMaterial({
    color: 'gray',
    transparent: true,
    depthWrite: true,
    depthTest: true,
    alphaTest: .1,
  }));

  chunkGen = new ChunkGen();
  chunkGen.setVoxelWorldParams(cellSize, tileSize, tileTextureWidth, tileTextureHeight);


  geometryData.createWorld(cellSize, tileSize, tileTextureWidth, tileTextureHeight);

  localWorld = new VoxelWorld({
    cellSize,
    tileSize,
    tileTextureWidth,
    tileTextureHeight
  });
  Player.world = localWorld;


  geometryData.addMesh = function (mesh) {
    setChunk(mesh);
  };

  geometryData.updateMesh = function (geometry, position) {
    // Updated geometry
    updateChunk(geometry, position);
  }

  chunkGen.onComplete = function (cell, coordinates) {
    localWorld.cells[Methods.string(coordinates)] = cell;
    geometryData.getGeometry(cell, ...Methods.multiply(coordinates, cellSize));
  }

  // X Y Z seed

  // localWorld.cells[x,y,z] = position

  createPointer();
  Player.getFPS();


  camera.position.set(32, 48, 32);
  camera.lookAt(new THREE.Vector3(16, 32, 16));
  Methods.WASMInitiateS().then(function (res) {
    console.log('Success!');
    render();
  }).catch(function (err) {
    throw new Error("WASM initiation failed with error: " + err);
  });

}

function createPointer() {
  Player.pointer = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 'white',
      wireframe: true,
      transparent: true,
      opacity: 1,
      polygonOffset: true,
      depthTest: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 0.1,
    })
  );
  scene.add(Player.pointer);
}

function idleLoad() {
  let minX = Math.floor(camera.position.x) - Player.renderDist;
  let maxX = Math.floor(camera.position.x) + Player.renderDist;
  let minZ = Math.floor(camera.position.z) - Player.renderDist;
  let maxZ = Math.floor(camera.position.z) + Player.renderDist;
  for (let i in ChunksIndex) {
    let c = Chunks[Methods.string(ChunksIndex[i])];
    if (scene.children.includes(c.mesh) && c.mesh.position.y < 32) {
      scene.remove(c.mesh);
    }
  }
  for (let x = minX; x < maxX; x += cellSize) {
    for (let z = minZ; z < maxZ; z += cellSize) {
      let roundCoord = Methods.multiply(Methods.arr(localWorld.computeCellId(x, 0, z)), cellSize);
      if (!Chunks[Methods.string(roundCoord)] && Player.canLoad == true) {
        // Chunk does not exist, should create one
        Player.canLoad = false;
        chunkGen.generateChunk(...Methods.divide(roundCoord, cellSize), Player.seed);
      }

      // Cull operation
      let chunk = Chunks[Methods.string(roundCoord)];
      if (chunk != undefined && chunk.culled == false && Player.canCull == true && Player.canLoad == true) {
        let fwd = Chunks[Methods.sub(roundCoord, [cellSize, 0, 0])];
        let bwd = Chunks[Methods.sub(roundCoord, [-cellSize, 0, 0])];
        let l = Chunks[Methods.sub(roundCoord, [0, 0, cellSize])];
        let r = Chunks[Methods.sub(roundCoord, [0, 0, -cellSize])];
        if (fwd != undefined && bwd != undefined && l != undefined && r != undefined) {
          // Can cull
          Player.canCull = false;
          chunk.culled = true;
          geometryData.getGeometry(chunk.voxels, ...roundCoord, true);


        }
      }
      if (chunk != undefined) {
        if (!scene.children.includes(chunk.mesh)) {
          scene.add(chunk.mesh);
        }
      }

    }

  }
}

function render() {
  requestAnimationFrame(render);
  movePlayer();
  idleLoad();
  renderer.render(scene, camera);
}


function movePlayer() {
  if (Player.canMove == true) {

    if (keys['w']) {
      controls.forward(Player.speed);
    }
    if (keys['a']) {
      controls.right(-Player.speed);
    }
    if (keys['s']) {
      controls.forward(-Player.speed);
    }
    if (keys['d']) {
      controls.right(Player.speed);
    }
    if (keys[' ']) {
      camera.position.addScaledVector(new THREE.Vector3(0, 1, 0), Player.speed);
    }
    if (keys['shift'] == true) {
      camera.position.addScaledVector(new THREE.Vector3(0, 1, 0), -Player.speed)
    }

    if (keys['w'] || keys['a'] || keys['s'] || keys['d'] || keys[' '] || keys['shift'] == true) {
      movePointer();
    }

  }
}

function setChunk(mesh) {
  // Get cell (divide by cellSize)
  let position = mesh.position;
  let cell = localWorld.getCellForVoxel(...Methods.spread(position));
  Chunks[Methods.string(Methods.spread(position))] = {
    voxels: cell,
    mesh: mesh,
    culled: false,
  };
  ChunksIndex.push(Methods.string(Methods.spread(position)));
  Player.canLoad = true;
  scene.add(mesh);

}

function updateChunk(geometry, position) {
  let chunk = Chunks[Methods.string(Methods.spread(position))];
  if (chunk != undefined) {
    chunk.mesh.geometry = geometry;
    Player.canCull = true;
  } else {
    setChunk(geometryData.makeMesh(geometry, position));
  }
}

function movePointer() {
  let intersection = Raycast.fromPlayer(0, Player);
  if (intersection) {
    intersection[0] = Math.floor(intersection[0]) + 0.5;
    intersection[1] = Math.floor(intersection[1]) + 0.5;
    intersection[2] = Math.floor(intersection[2]) + 0.5;
    Player.pointer.material.opacity = 1;
    Player.pointer.position.set(...intersection);
  } else {
    Player.pointer.material.opacity = 0;
  }
}

function modifyChunk(type) {
  let intersection = Raycast.fromPlayer(type, Player);
  if (intersection) {
    if (intersection[1] < 1000) { // Below chunk height limit
      localWorld.setVoxel(...intersection, type);
      let cell = localWorld.getCellForVoxel(...intersection);
      let position = Methods.multiply(Methods.arr(localWorld.computeCellId(...intersection)), cellSize);
      let floorPos = Methods.floor(position);
      let localPos = Methods.sub(Methods.floor(intersection), position);
      geometryData.getGeometry(cell, ...position, true);
      if (posInCorner(...localPos)) {
        // Corner, update neighboring chunks to prevent invisible chunk

        let positions = {
          fwd: Methods.sub(floorPos, [cellSize, 0, 0]),
          bwd: Methods.sub(floorPos, [-cellSize, 0, 0]),
          left: Methods.sub(floorPos, [0, 0, cellSize]),
          right: Methods.sub(floorPos, [0, 0, -cellSize]),
        }
        let fwd = Chunks[positions.fwd];
        let bwd = Chunks[positions.bwd];
        let l = Chunks[positions.left];
        let r = Chunks[positions.right];
        if (fwd != undefined && bwd != undefined && l != undefined && r != undefined) {
          geometryData.getGeometry(fwd.voxels, ...positions.fwd, true);
          geometryData.getGeometry(bwd.voxels, ...positions.bwd, true);
          geometryData.getGeometry(l.voxels, ...positions.left, true);
          geometryData.getGeometry(r.voxels, ...positions.right, true);
        }


      }
      movePointer(); // Update pointer
    }
  }
}

function posInCorner(x, y, z) {
  if (x == 0 || y == 0 || z == 0 || x == cellSize - 1 || y == cellSize - 1 || z == cellSize - 1) return true;
}
/*
function intersectPlayer(type) {
  let start = new THREE.Vector3();
  let end = new THREE.Vector3();
  let dir = new THREE.Vector3();
  start.setFromMatrixPosition(camera.matrixWorld);
  end.set(0, 0, 1).unproject(camera);

  dir.subVectors(end, start).normalize();

  end.copy(start);
  end.addScaledVector(dir, Player.maxReach);

  const intersection = localWorld.intersectRay(start, end);

  if (intersection) {
    const pos = intersection.position.map(function (v, ndx) {
      return v + intersection.normal[ndx] * (type > 0 ? 0.5 : -0.5)
    })
    return pos;
  }
}
*/

function intersectPlayerSelf() {
  let start = new THREE.Vector3().copy(camera.position);

  const intersection = localWorld.intersectRay(start, start);

  if (intersection) return true;
}