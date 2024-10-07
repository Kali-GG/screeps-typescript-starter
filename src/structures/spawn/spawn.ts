import {getCostForBodyPartsArr} from "../../utils/getCostForBodyPartsArr";

let spawnResult = 0;
let filteredSpawnQueue: SpawnQueue[];

const newSpawnTick = (spawn: StructureSpawn) => {
  if (spawn.spawning != null) { return; }
  if (!spawn.memory.queue) { spawn.memory.queue = []; }

  filteredSpawnQueue = _.filter(spawn.memory.queue, (item) => {
    return item.requiredSpawnStart && item.requiredSpawnStart <= Game.time // todo idea: should we add a check that we can afford the creep here?
  });

  if (filteredSpawnQueue.length == 0) { return; }

  let spawnItem = filteredSpawnQueue[0];

  let options: SpawnOptions = {
    memory: {
      missionId: spawnItem.missionId,
      role: spawnItem.role
    },
    directions: [RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT, TOP, TOP_RIGHT]
  }

  spawnResult = spawn.spawnCreep(
    spawnItem.body,
    `_${Memory.empire.creepNum}`,
    options
  );

  switch (spawnResult) {
    case 0: { // OK
      if (spawnItem.repeat == true) {
        Memory.empire.creepNum ++;
        spawnItem.requiredSpawnStart = Game.time + 1500;
        return;
      }
      let index = spawn.memory.queue.indexOf(spawnItem);
      if (index > -1) { // only splice array when item is found
        spawn.memory.queue.splice(index, 1);
      }
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
      if (spawn.room.energyCapacityAvailable < getCostForBodyPartsArr(spawn.memory.queue[0].body)) { spawnItem.requiredSpawnStart = Game.time + 1500; return; }
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
      console.log(`Error while spawning ${JSON.stringify(spawnItem)} on spawn ${spawn.id}: (default case in switch statement reached. This should never happen)`);
      return;
    }
  }
}

const insertUpdateSpawnQueueItems = (missionId: string, spawn: StructureSpawn, args: SpawnQueue, requiredItems: number): void => {
  if (!spawn.memory.queue) { spawn.memory.queue = []; }
  let existingSpawnQueueItems = _.filter(spawn.memory.queue, (item) => { return item.missionId && item.missionId == missionId; });

  // update items
  existingSpawnQueueItems.forEach( item => {
    item.body = args.body;
    item.repeat = args.repeat;
    item.role = args.role;
  });

  // push new
  if (existingSpawnQueueItems.length < requiredItems) {
    for (let i = 0; i < requiredItems - existingSpawnQueueItems.length; i++) {
      addToSpawnQueue(spawn, args);
    }
  }

  // todo Remove items
}

/*
const isSpawning_Deprecated = (spawn: StructureSpawn): boolean => {
  if (spawn.spawning != null) { return true; }
  if (!spawn.memory.queue) { spawn.memory.queue = []; }
  if (spawn.memory.queue.length == 0) { return false; }



  spawnResult = spawn.spawnCreep(
    spawn.memory.queue[0].body,
    spawn.name + '_' + Game.time,
    spawn.memory.queue[0].opts
  );

  switch (spawnResult) {
    case 0: { // OK
      spawn.memory.queue.splice(0,1);
      return true;
    }
    case -1: { // ERR_NOT_OWNER
      console.log(spawnResult)
      return false;
    }
    case -3: { // ERR_NAME_EXISTS
      console.log(spawnResult)
      return false;
    }
    case -4: { // ERR_BUSY
      console.log(spawnResult)
      return false;
    }
    case -6: { // ERR_NOT_ENOUGH_ENERGY
      if (spawn.room.energyCapacityAvailable < getCostForBodyPartsArr(spawn.memory.queue[0].body)) { spawn.memory.queue.splice(0,1); }
      return false;
    }
    case -10: { // ERR_INVALID_ARGS
      //todo
      console.log(spawnResult)
      return false;
    }
    case -14: { // ERR_RCL_NOT_ENOUGH
      //todo
      console.log(spawnResult)
      return false;
    }
    default: {
      console.log('Error while spawning ' + spawn.memory.queue[0] + ' on spawn ' + spawn.id + ': (default case in switch statement reached. This should never happen)');
      return false;
    }
  }
}

 */

const addToSpawnQueue = (spawn: StructureSpawn, item: SpawnQueue) => {
  spawn.memory.queue.push(item);
}

const processSpawns = () => {
  for (let i in Game.spawns) {
    newSpawnTick(Game.spawns[i]);
    //isSpawning_Deprecated(Game.spawns[i]);
  }
}

export { processSpawns, insertUpdateSpawnQueueItems }
