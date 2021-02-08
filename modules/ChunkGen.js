import Methods from '../modules/Methods.js'

const ChunkGen = function () {
  this.worker = new Worker('../modules/ChunkGenWorker.js',{type:'module'});
  const scope = this;
  this.setVoxelWorldParams = function(cellSize,tileSize,tileTextureWidth,tileTextureHeight){
    this.cellSize = cellSize;
    this.tileSize = tileSize;
    this.tileTextureWidth = tileTextureWidth;
    this.tileTextureHeight = tileTextureHeight;
  }
  this.generateChunk = function(x,y,z,seed) {
    this.worker.postMessage(['generateWorld',this.cellSize,this.tileSize,this.tileTextureWidth,this.tileTextureHeight,seed,x,y,z]);
  }
  this.worker.onmessage = function(e){
    if(e.data[0] == 'done'){
      scope.onComplete(e.data[1],[e.data[2],e.data[3],e.data[4]]);
    }
  }
}

export default ChunkGen;