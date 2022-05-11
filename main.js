/*
SortaCraft

It's.. SortaCraft!
@author tussiez
@coauthor Baconman321
@coauthor xxpertHacker

sortagames.repl.co

sortacraft.sortagames.repl.co
*/

// Imports
import * as THREE from "/three.js";
import Methods from "/modules/Methods.js";
import PlayerControls from "/modules/PlayerControls.js";
import VoxelWorld from "/modules/VoxelEngine.js";
import GeometryData from "/modules/GeometryData.js";
import ChunkGen from "/modules/ChunkGen.js";
import Raycast from "/modules/Raycast.js";
import Commands from "/modules/Commands.js";
import TouchControls from '/modules/TouchControlsWorker.js';

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
  startGame,
  mousemove,
  graphicsToggle,
  setFpsCap,
  setrenderdist,
  touch_forward,
  touch_backward,
  touch_left,
  touch_right,
  touch_jump,
  touch_forward_end,
  touch_backward_end,
  touch_left_end,
  touch_right_end,
  touch_jump_end,
  touch_look,
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
let touchControls;
let hasRender = false;
let sun;

const cellSize = 32;
const tileSize = 16;
const tileTextureWidth = 768;
const tileTextureHeight = 48;

const keys = new Set();

const Chunks = {}; // should probably be a Map
const ChunksIndex = [];

const Player = {
  speed: .1,
  canCull: true,
  canMove: false,
  fpsCap: 0,//AUTO
  fogDensityMult: 1,
  jumping: false,
  canUp: true,
  velocity: 0.01,
  sunCycle: true,
  fly: false,
  graphicsMode: true,
  shadowMap: true,
  setGraphics: (v) => {
    if(Player.graphicsMode != v) {
      if(v === true) {
        Player.shadowMap = true;
      } else {
        Player.shadowMap = false;
      }
    }
    Player.graphicsMode = v;
  },
  edits: [],
  maxReach: 8, // Cannot select things farther than X blocks away
  renderDist: 4 * cellSize,
  setRenderDist: (dist) => {
    Player.renderDist = dist * cellSize;
  },
  getRenderDist: () => {
    return Player.renderDist / cellSize;
  },
  canLoad: true,
  seed: 12345,
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
  bbox: new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 1.5, 0.5))
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

function setFpsCap(e) {
  let val = e[1];
  if(val >= 0 && val <= 120) {
    Player.fpsCap = val;
  }
}

function startGame() {
  if (hasRender === false) {
    hasRender = true;
    render(); // Start rendering & world gen
  }
}

function setrenderdist(e) {
  Player.setRenderDist(e[1]);
}

function pointerLock(e) {
  Player.canMove = e[1];
}

function graphicsToggle(e) {
  let v = e[1];
  Player.setGraphics(v);
}

function playerCommand(e) {
  Commands.parse(e[1], Player);
}

function mouseup() {
  // Nothing
}

function touch_forward() {
  Player.canMove = true;
  touchControls.onForward();
}

function touch_backward() {
  Player.canMove = true;
  touchControls.onBackward();
}

function touch_left() {
  Player.canMove = true;
  touchControls.onLeft();
}

function touch_right() {
  Player.canMove = true;
  touchControls.onRight();
}

function touch_jump() {
  Player.canMove = true;
  touchControls.onJump();
}

function touch_forward_end() {
  touchControls.onForwardEnd();
}

function touch_backward_end() {
  touchControls.onBackwardEnd();
}

function touch_left_end() {
  touchControls.onLeftEnd();
}

function touch_right_end() {
  touchControls.onRightEnd();
}

function touch_jump_end() {
  touchControls.onJumpEnd();
}

function touch_look(e) {
  let { x, y } = e[1];
  touchControls.look(x, y);
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
  scene.background = new THREE.Color("skyblue");
  Player.fog = scene.fog = new THREE.Fog(
    "skyblue",
    1,
    250,
  );
  Player.updateFog = () => {
    scene.fog.near = Player.fogDensityMult;
  };
  camera = new THREE.PerspectiveCamera(70, c[2] / c[3], 0.1, 1000);
  Player.camera = camera;
  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(c[2], c[3], false); //false for offscreen
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  setupLighting();
  controls = new PlayerControls(camera);
  touchControls = new TouchControls(camera, keys);

  geometryData = new GeometryData(
    new THREE.MeshLambertMaterial({
      color: "gray",
      //  transparent: true,
      depthWrite: true,
      depthTest: true,
      opacity: 0,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    }),
  );
  geometryData.onTextureLoad = () => globalThis.postMessage(['asset_loaded']);

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
    //   Promise.resolve().then(render);
  });
}

function createPointer() {
  Player.pointer = new THREE.Mesh(
    new THREE.BoxGeometry(1.01, 1.01, 1.01),
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
  const [maxX, minX] = pm(floor(x), renderDist/2);
  const [maxY, minY] = pm(floor(y), renderDist/2);
  const [maxZ, minZ] = pm(floor(z), renderDist/2);

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
      } else if (chunk != undefined && chunk.mesh == undefined) {
        chunk.checked = true; // is in range
      }
      if (chunk)
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
        chunk.building = false;
      }
    } else if (!chunk.mesh && chunk.checked == true && chunk.building == false && Player.canLoad == true) {
      // rebuild mesh from cell, if in render distance
      geometryData.getGeometry(chunk.cell, ...Methods.spread(chunk.orgPosition), false);
      chunk.building = true;
      Player.canLoad = false;
    }
  }
  globalThis.postMessage(['progress',loadedNearPlayer/((Player.renderDist/cellSize)**2)]);
}

function setupLighting() {
  sun = new THREE.Mesh(
    new THREE.BoxGeometry(50, 50, 50),
    new THREE.MeshBasicMaterial({ color: 'yellow', fog: false })
  );
  sun.position.set(0, 500, 0);
  sun.lite = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.4);

  sun.spot = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.spot.castShadow = true;
  sun.spot.shadow.camera.near = 200;
  sun.spot.shadow.camera.far = 400;
  sun.spot.shadow.camera.left = -125;
  sun.spot.shadow.camera.right = 125;
  sun.spot.shadow.camera.top = 125;
  sun.spot.shadow.camera.bottom = -125;
  sun.spot.shadow.mapSize.height = 2048;
  sun.spot.shadow.mapSize.width = 2048;
  sun.spot.shadow.bias = -0.001;

  scene.add(sun.spot);
  scene.add(sun.spot.target);
  scene.add(sun);
  scene.add(sun.lite);
}

function updateSun() {
  sun.position.set(camera.position.x, camera.position.y + 300, camera.position.z);
  sun.lookAt(camera.position);
  sun.spot.target.position.copy(camera.position);
  sun.spot.target.lookAt(camera.position);
  sun.spot.position.set(camera.position.x-100,camera.position.y+300,camera.position.z);

  if (Player.sunCycle === true) {

    sun.position.x += 500 * Math.cos(performance.now() / 50000);
    sun.position.y += 1000 * Math.sin(performance.now() / 50000);
  } else {
    sun.position.set(camera.position.x - 100,camera.position.y+300,camera.position.z);
  }
}

function render() {
  if(Player.fpsCap === 0) {
    requestAnimationFrame(render);
  } else {
    setTimeout(render, 1000/Player.fpsCap);
  }
  if(Math.random() > 0.85) {
    renderer.shadowMap.enabled = true;
    // Random update
  }
  movePlayer();
  idleLoad();
  updateDebugger();
  updateSun();
  renderer.render(scene, camera);
  renderer.shadowMap.enabled = false; // Disable after render
}


function updateDebugger() {
  globalThis.postMessage(['debug_info', [
    Player.fps,
    camera.position
  ]
  ]);
}


function movePlayer() {
  let computedPlayerSpeed = Player.speed/(1000/60)*(1000/Player.fps);
  if (Player.canMove == true) {
    if (keys.has("w")) {
      controls.forward(computedPlayerSpeed, intersectPlayerSelf);
    }
    if (keys.has("a")) {
      controls.right(-computedPlayerSpeed, intersectPlayerSelf);
    }
    if (keys.has("s")) {
      controls.forward(-computedPlayerSpeed, intersectPlayerSelf);
    }
    if (keys.has("d")) {
      controls.right(computedPlayerSpeed, intersectPlayerSelf);
    }
    camera.position.y -= 1.5;
    if (keys.has(" ")) {
      if (Player.canUp == true && Player.jumping === false && Player.fly == false) {
        //

        // Jump
        Player.velocity = -0.4;
        Player.jumping = true;
      }
      if (Player.fly === true) {
        camera.position.addScaledVector(new THREE.Vector3(0, 1, 0), Player.speed);
        camera.position.y += 1.5;
        if (intersectPlayerSelf() == true) {
          camera.position.addScaledVector(new THREE.Vector3(0, 1, 0), -Player.speed)
        }
        camera.position.y -= 1.5;
        if (intersectPlayerSelf() == true) {
          camera.position.y += 1.5;
        }
      }
    }
    if (keys.has("shift") && Player.fly === true) {
      camera.position.addScaledVector(
        new THREE.Vector3(0, 1, 0),
        -Player.speed,
      );
      if (intersectPlayerSelf() === true) {
        camera.position.addScaledVector(
          new THREE.Vector3(0, 1, 0),
          Player.speed,
        )
      }
    }

    if (
      [..."wasd ", "shift"].some((key) => keys.has(key))
    ) {
      movePointer();
    }
    if (Player.fly === false) {
      if (Player.velocity > 0) {
        Player.velocity *= 1.10; // Faster
      } else {
        Player.velocity *= 0.9;
        if (Player.jumping === true && Player.velocity > -0.2) {
          Player.velocity = 0.05;
        }
      }

      if (Player.velocity > 0.4) Player.velocity = 0.4; // cap
      camera.position.y -= Player.velocity;
      if (intersectPlayerSelf() === true) {
        camera.position.y += Player.velocity;
        Player.velocity = 0.01;
        Player.jumping = false;
      }




    }
    camera.position.y += 1.5;
  }
  // Calculate bbox
  Player.bbox.set(
    new THREE.Vector3(camera.position.x - 0.5, camera.position.y - 1.5, camera.position.z - 0.5),
    new THREE.Vector3(camera.position.z + 0.5, camera.position.y, camera.position.z + 0.5)
  );
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
  if(Player.shadowMap === true) renderer.shadowMap.enabled = true;
}

function updateChunk(geometry, position) {
  let chunk = Chunks[Methods.string(Methods.spread(position))];
  if (chunk != undefined) {
    chunk.mesh.geometry = geometry;
    Player.canCull = true;
  } else {
    setChunk(geometryData.makeMesh(geometry, position));

  }
  if(Player.shadowMap === true) renderer.shadowMap.enabled = true;
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
      let aabb1 = Methods.arrVec(intersection);
      let aabb = new THREE.Box3(
        new THREE.Vector3(aabb1.x - 0.5, aabb1.y - 0.5, aabb1.z - 0.5),
        new THREE.Vector3(aabb1.x + 0.5, aabb1.y + 0.5, aabb1.z + 0.5)
      );
      if (type != 0 && (
        !Player.bbox.intersectsBox(aabb)
      ) || type === 0) {
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
