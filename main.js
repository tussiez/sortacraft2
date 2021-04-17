/*
SortaCraft
It's.. SortaCraft
@author tussiez
@coauthor Baconman321
Worker
*/

// Imports
import * as THREE from "https://threejs.org/build/three.module.js";
import Methods from "/modules/Methods.js";
import PlayerControls from "/modules/PlayerControls.js";
import VoxelWorld from "/modules/VoxelEngine.js";
import GeometryData from "/modules/GeometryData.js";
import ChunkGen from "/modules/ChunkGen.js";
import Raycast from "/modules/Raycast.js";
import Commands from "/modules/Commands.js";

const {
  Promise,
  Math: { floor },
  requestAnimationFrame,
  console,
  setTimeout,
  Set,
  Uint8Array,
  globalThis,
} = self;

const delay = (seconds) =>
  new Promise(
    (resolve) => {
      setTimeout(resolve, 1000.0 * seconds);
    },
  );

Commands.message = (msg) => globalThis.postMessage(["message", msg]);

globalThis.onmessage = ({ data }) => {
  const [command] = data;

  if (command in handlers) {
    handlers[command](data);
  } else {
    console.warn("unknown command");
  }
};

const handlers = {
  pointerLock,
  playerCommand,
  main,
  keydown,
  keyup,
  mousedown,
  mouseup,
  resize,
  mousemove,
};

// Variables

let canvas;
let camera;
let scene;
let controls;
let geometryData;
let chunkGen;
let localWorld;
let renderer;

const cellSize = 32;
const tileSize = 16;
const tileTextureWidth = 768;
const tileTextureHeight = 48;

const keys = new Set();
const emptyCell = new Uint8Array(cellSize ** 3); // what is this for? Dead code?

const Chunks = {}; // should probably be a Map
const ChunksIndex = [];

const Player = {
  speed: .1,
  canCull: true,
  canMove: false,
  fogDensityMult: 1.5,
  jumping: false,
  velocity: 0,
  edits: [],
  maxReach: 8, // Cannot select things farther than X blocks away
  renderDist: 4 * cellSize,
  canLoad: true,
  seed: floor(Math.random() * 99999),
  selectedVoxel: 1,
  camera: undefined,
  fps: 0,
  render: true,
  getFPS: async function getFPS() {
    const { render } = renderer.info;
    const last = render.frame;
    // how about `requestAnimationFrame`?
    await delay(1);
    Player.fps = render.frame - last;
    getFPS();
  },
};

function keydown(dat) {
  const key = dat[1].toLowerCase();
  keys.add(key);

  if ("1" === key) {
    Player.selectedVoxel = 1;
  } else if ("2" === key) {
    Player.selectedVoxel = 46;
  } else if ("3" === key) {
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
  Player.canMove = e[1];
}

function playerCommand(e) {
  Commands.parse(e[1], Player);
}

function mouseup() {
  // Nothing
}

function keyup(dat) {
  keys.delete(dat[1].toLowerCase());
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
  console.log("Loading");

  scene = new THREE.Scene();
  scene.background = new THREE.Color("gray");
  Player.fog = scene.fog = new THREE.FogExp2(
    "gray",
    Player.fogDensityMult / Player.renderDist,
  );
  Player.updateFog = () => {
    scene.fog.density = Player.fogDensityMult / Player.renderDist;
  };
  camera = new THREE.PerspectiveCamera(70, c[2] / c[3], 0.1, 500);
  Player.camera = camera;
  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(c[2], c[3], false); //false for offscreen
  controls = new PlayerControls(camera);

  geometryData = new GeometryData(
    new THREE.MeshBasicMaterial({
      color: "gray",
      transparent: true,
      depthWrite: true,
      depthTest: true,
      alphaTest: .1,
      opacity: 0,
      // side: THREE.DoubleSide, double sided
    }),
  );

  chunkGen = new ChunkGen();

  chunkGen.setVoxelWorldParams(
    cellSize,
    tileSize,
    tileTextureWidth,
    tileTextureHeight,
  );

  geometryData.createWorld(
    cellSize,
    tileSize,
    tileTextureWidth,
    tileTextureHeight,
  );

  Player.world = localWorld = new VoxelWorld({
    cellSize,
    tileSize,
    tileTextureWidth,
    tileTextureHeight,
  });

  geometryData.addMesh = setChunk;

  geometryData.updateMesh = function (geometry, position) {
    // Updated geometry
    updateChunk(geometry, position);
  };

  chunkGen.onComplete = function (cell, coordinates) {
    localWorld.cells[Methods.string(coordinates)] = cell;
    geometryData.getGeometry(cell, ...Methods.multiply(coordinates, cellSize));
  };

  // X Y Z seed

  // localWorld.cells[x,y,z] = position

  createPointer();
  Player.getFPS();

  camera.position.set(32, 48, 32);
  camera.lookAt(new THREE.Vector3(16, 32, 16));
  Methods.WASMInitiateS().then(() => {
    Promise.resolve().then(render);
  });
}

function createPointer() {
  Player.pointer = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({
      color: "white",
      wireframe: true,
      transparent: true,
      opacity: 1,
      polygonOffset: true,
      depthTest: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 0.1,
    }),
  );
  scene.add(Player.pointer);
}

// plus-minus
function pm(x, y) {
  return [x + y, x - y];
}

function idleLoad() {
  camera.updateMatrix();
  camera.updateMatrixWorld();
  let loadedNearPlayer = 0;
  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();
  projScreenMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse,
  );
  frustum.setFromProjectionMatrix(camera.projectionMatrix);
  // now check with frustrum.containsPoint(mesh.position)
  const { x, y, z } = camera.position;
  const { renderDist } = Player;
  // floor( camera.position.{x, y, z} ) +- Player.renderDist
  const [maxX, minX] = pm(floor(x), renderDist);
  const [maxY, minY] = pm(floor(y), renderDist);
  const [maxZ, minZ] = pm(floor(z), renderDist);

  for (const chunk of ChunksIndex) {
    let ch = Chunks[Methods.string(chunk)];
    ch.checked = false;
    if (ch.mesh) {
      ch.mesh.checked = false; // reset checker
      if (scene.children.includes(ch.mesh)) {
        // remove if player cannot see chunk
        scene.remove(ch.mesh);
      }
    } 
  }

  for (let x = minX; x < maxX; x += cellSize) {
    for (let z = minZ; z < maxZ; z += cellSize) {
      const roundCoord = Methods.multiply(
        Methods.arr(localWorld.computeCellId(x, 0, z)),
        cellSize,
      );
      if (!Chunks[Methods.string(roundCoord)] && Player.canLoad == true) {
        // Chunk does not exist, should create one
        Player.canLoad = false;
        chunkGen.generateChunk(
          ...Methods.divide(roundCoord, cellSize),
          Player.seed,
        );
      }

      // Cull operation
      const chunk = Chunks[Methods.string(roundCoord)];
      if (chunk != undefined && chunk.mesh != undefined) {
        // add to loaded chunk count, this will be used in progess bar
        loadedNearPlayer++;
        chunk.mesh.checked = true; // for a prune
      } else if(chunk != undefined && chunk.mesh == undefined) {
        chunk.checked = true; // is in range
      }
      if(chunk )
      if (
        chunk != undefined && chunk.mesh != undefined && chunk.culled == false && Player.canCull == true &&
        Player.canLoad == true
      ) {
        //Hmmmm, sometimes Methods.WASMSub returns undefined. Why tho... Heap problems? Oh wait, I mean the *stack* (big difference on allocation and storing methods) - baconman
        const fwd = Chunks[Methods.sub(roundCoord, [cellSize, 0, 0])];
        const bwd = Chunks[Methods.sub(roundCoord, [-cellSize, 0, 0])];
        const l = Chunks[Methods.sub(roundCoord, [0, 0, cellSize])];
        const r = Chunks[Methods.sub(roundCoord, [0, 0, -cellSize])];
        if (
          fwd != undefined && bwd != undefined && l != undefined &&
          r != undefined
        ) {
          // Can cull
          Player.canCull = false;
          chunk.culled = true;
          geometryData.getGeometry(chunk.voxels, ...roundCoord, true);
        }
      }
      for (let y = minY; y < maxY; y += cellSize) {
        const rounded2 = Methods.multiply(
          Methods.arr(localWorld.computeCellId(x, y, z)),
          cellSize,
        );
        const chunk2 = Chunks[Methods.string(rounded2)];
        if (chunk2 != undefined && chunk2.mesh != undefined) {
          const distToCam = floor(
            Methods.arrVec(rounded2).distanceTo(camera.position) / cellSize,
          );
          chunk2.mesh.renderOrder = distToCam;
          if (!scene.children.includes(chunk2.mesh)) {
            scene.add(chunk2.mesh);
            if (chunk2.mesh.material.opacity < 1) {
              chunk2.mesh.material.opacity += 0.05;
            }
          }
        }
      }
    }
  }
  for (const chun of ChunksIndex) {
    let chunk = Chunks[Methods.string(chun)]
    if (chunk.mesh && chunk.mesh.checked == false) {
      // remove geometry and material from memory, but DO NOT erase cell.
      if (chunk.mesh.geometry && chunk.mesh.material) {
        chunk.mesh.geometry.dispose();
        chunk.mesh.material.dispose();
        scene.remove(chunk.mesh);
        chunk.orgPosition = chunk.mesh.position.clone();
        chunk.mesh = undefined; // delete
      }
    } else if(!chunk.mesh && chunk.checked == true) {
      // rebuild mesh from cell, if in render distance
      geometryData.getGeometry(chunk.cell, ...Methods.spread(chunk.orgPosition));
    }
  }
  globalThis.postMessage(['progress', (loadedNearPlayer / renderDist) * 2]);
}

function render() {
  requestAnimationFrame(render);
  movePlayer();
  idleLoad();
  renderer.render(scene, camera);
}

function movePlayer() {
  if (Player.canMove == true) {
    if (keys.has("w")) {
      controls.forward(Player.speed);
    }
    if (keys.has("a")) {
      controls.right(-Player.speed);
    }
    if (keys.has("s")) {
      controls.forward(-Player.speed);
    }
    if (keys.has("d")) {
      controls.right(Player.speed);
    }
    if (keys.has(" ")) {
      camera.position.addScaledVector(new THREE.Vector3(0, 1, 0), Player.speed);
    }
    if (keys.has("shift")) {
      camera.position.addScaledVector(
        new THREE.Vector3(0, 1, 0),
        -Player.speed,
      );
    }

    if (
      [..."wasd ", "shift"].some((key) => keys.has(key))
    ) {
      movePointer();
    }
  }
}

function setChunk(mesh) {
  // Get cell (divide by cellSize)
  const { position } = mesh;
  const cell = localWorld.getCellForVoxel(...Methods.spread(position));

  Chunks[Methods.string(Methods.spread(position))] = {
    voxels: cell,
    mesh,
    culled: false,
  };

  ChunksIndex.push(Methods.string(Methods.spread(position)));
  Player.canLoad = true;
  scene.add(mesh);
}

function updateChunk(geometry, position) {
  const chunk = Chunks[Methods.string(Methods.spread(position))];

  if (chunk != undefined) {
    chunk.mesh.geometry = geometry;
    Player.canCull = true;
  } else {
    setChunk(geometryData.makeMesh(geometry, position));
  }
}

function movePointer() {
  const { material, position } = Player.pointer;

  const intersection = Raycast.fromPlayer(0, Player);

  if (intersection) {
    intersection[0] = floor(intersection[0]) + 0.5;
    intersection[1] = floor(intersection[1]) + 0.5;
    intersection[2] = floor(intersection[2]) + 0.5;
    material.opacity = 1;
    position.set(...intersection);
  } else {
    material.opacity = 0;
  }
}

function modifyChunk(type) {
  const intersection = Raycast.fromPlayer(type, Player);
  if (intersection) {
    if (intersection[1] < 1000) { // Below chunk height limit
      localWorld.setVoxel(...intersection, type);
      const cell = localWorld.getCellForVoxel(...intersection);
      const position = Methods.multiply(
        Methods.arr(localWorld.computeCellId(...intersection)),
        cellSize,
      );
      const floorPos = Methods.floor(position);
      const localPos = Methods.WASMSub(Methods.floor(intersection), position);
      geometryData.getGeometry(cell, ...position, true);
      if (posInCorner(...localPos)) {
        // Corner, update neighboring chunks to prevent invisible chunk

        const positions = {
          fwd: Methods.WASMSub(floorPos, [cellSize, 0, 0]),
          bwd: Methods.WASMSub(floorPos, [-cellSize, 0, 0]),
          left: Methods.WASMSub(floorPos, [0, 0, cellSize]),
          right: Methods.WASMSub(floorPos, [0, 0, -cellSize]),
        };

        const {
          [positions.fwd]: fwd,
          [positions.bwd]: bwd,
          [positions.left]: l,
          [positions.right]: r,
        } = Chunks;

        if (
          fwd != undefined && bwd != undefined && l != undefined &&
          r != undefined
        ) {
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
  if (
    x == 0 || y == 0 || z == 0 || x == cellSize - 1 || y == cellSize - 1 ||
    z == cellSize - 1
  ) {
    return true;
  }
}

function intersectPlayerSelf() {
  const start = new THREE.Vector3().copy(camera.position);

  const intersection = localWorld.intersectRay(start, start);

  if (intersection) return true;
}
