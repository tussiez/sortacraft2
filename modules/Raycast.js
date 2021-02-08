/*
Raycast
Used to do raycasting on the voxel world
@author tussiez
*/
import {Vector3} from './three.js'

const Raycast = {
  fromPlayer: function (type,Player) {
    let start = new Vector3();
    let end = new Vector3();
    let dir = new Vector3();
    start.setFromMatrixPosition(Player.camera.matrixWorld);
    end.set(0, 0, 1).unproject(Player.camera);

    dir.subVectors(end, start).normalize();

    end.copy(start);
    end.addScaledVector(dir, Player.maxReach);

    const intersection = Player.world.intersectRay(start, end);

    if (intersection) {
      const pos = intersection.position.map(function (v, ndx) {
        return v + intersection.normal[ndx] * (type > 0 ? 0.5 : -0.5)
      })
      return pos;
    }
  },

}

export default Raycast;