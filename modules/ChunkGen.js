/*
ChunkGen
Handles ChunkGenWorker

@author tussiez
@coauthor xxpertHacker

sortagames.repl.co
*/


import Methods from '../modules/Methods.js'

const ChunkGen = function () {
  this.worker = new Worker('../modules/ChunkGenWorker.js',{type:'module'});
  const scope = this;
  this.avg = [];
  this.setVoxelWorldParams = function(cellSize,tileSize,tileTextureWidth,tileTextureHeight){
    this.cellSize = cellSize;
    this.tileSize = tileSize;
    this.tileTextureWidth = tileTextureWidth;
    this.tileTextureHeight = tileTextureHeight;
  }
  this.generateChunk = function(x,y,z,seed) {
    this.postTimestamp = performance.now();
    this.worker.postMessage(['generateWorld',this.cellSize,this.tileSize,this.tileTextureWidth,this.tileTextureHeight,seed,x,y,z]);
  }
  this.worker.onmessage = function(e){
    if(e.data[0] == 'done'){
      scope.onComplete(e.data[1],[e.data[2],e.data[3],e.data[4]]);
      scope.avg.push(performance.now()-scope.postTimestamp);
      // console.log(`Average load time: ${Math.floor(Methods.average(scope.avg))} ms`);
    }
  }
}

export default ChunkGen;