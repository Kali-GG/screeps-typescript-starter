import {getCostForBodyPartsArr} from "../../utils/getCostForBodyPartsArr";

let spawnResult = 0;

const spawnTick = (spawn: StructureSpawn) => {
  if (spawn.spawning != null) { return; }
  if (!spawn.memory.queue) { spawn.memory.queue = []; }
  if (spawn.memory.queue.length == 0) { return; }

  spawnResult = spawn.spawnCreep(
    spawn.memory.queue[0].body,
    spawn.name + '_' + Game.time,
    spawn.memory.queue[0].opts
  );

  switch (spawnResult) {
    case 0: { // OK
      spawn.memory.queue.splice(0,1);
      return;
    }
    case -1: { // ERR_NOT_OWNER
      console.log(spawnResult)
      return;
    }
    case -3: { // ERR_NAME_EXISTS
      console.log(spawnResult)
      return;
    }
    case -4: { // ERR_BUSY
      console.log(spawnResult)
      return;
    }
    case -6: { // ERR_NOT_ENOUGH_ENERGY
      if (spawn.room.energyCapacityAvailable < getCostForBodyPartsArr(spawn.memory.queue[0].body)) { spawn.memory.queue.splice(0,1); }
      return;
    }
    case -10: { // ERR_INVALID_ARGS
      //todo
      console.log(spawnResult)
      return;
    }
    case -14: { // ERR_RCL_NOT_ENOUGH
      //todo
      console.log(spawnResult)
      return;
    }
    default: {
      console.log('Error while spawning ' + spawn.memory.queue[0] + ' on spawn ' + spawn.id + ': (default case in switch statement reached. This should never happen)');
      return;
    }
  }
}

const addToSpawnQueue = (spawn: StructureSpawn, item: SpawnQueue) => {
  if (!spawn.memory.queue) { spawn.memory.queue = []; }
  spawn.memory.queue.push(item);
}

const removeFromSpawnQueue = () => {

}

const processSpawns = () => {
  for (let i in Game.spawns) {
    spawnTick(Game.spawns[i]);
  }
}

export { processSpawns, addToSpawnQueue, removeFromSpawnQueue }
