/*
Raycast
Used to do raycasting on the voxel world
@author tussiez

sortagames.repl.co
*/

import { Vector3 } from "./three.js";

const Raycast = {
  fromPlayer: (type, Player) => {
    const start = new Vector3();
    const end = new Vector3();
    const dir = new Vector3();
    start.setFromMatrixPosition(Player.camera.matrixWorld);
    end.set(0, 0, 1).unproject(Player.camera);

    dir.subVectors(end, start).normalize();

    end.copy(start);
    end.addScaledVector(dir, Player.maxReach);

    const intersection = Player.world.intersectRay(start, end);

    if (intersection) {
      const pos = intersection.position.map((v, ndx) =>
        v + intersection.normal[ndx] * (type > 0 ? 0.5 : -0.5)
      );
      return pos;
    }
    // should return or throw here
  },
};

export default Raycast;
