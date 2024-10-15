import {getCostForBodyPartsArr} from "../../utils/getCostForBodyPartsArr";
import {globalRoom} from "../../rooms/rooms";

let spawnResult = 0;
let filteredSpawnQueue: SpawnQueue[];

StructureSpawn.prototype._spawnPos = function(): RoomPosition {
  return new RoomPosition(this.pos.x + 1, this.pos.y, this.room.name);
}

const newSpawnTick = (spawn: StructureSpawn) => {
  if (spawn.spawning != null) { return; }
  if (!spawn.memory.queue) { spawn.memory.queue = []; }

  filteredSpawnQueue = _.filter(spawn.memory.queue, (item) => {
    return item.requiredSpawnStart && item.requiredSpawnStart <= Game.time && getCostForBodyPartsArr(item.body) <= spawn.room.energyAvailable;
  });

  if (filteredSpawnQueue.length == 0) { return; }

  let spawnItem = filteredSpawnQueue[0];

  if (!Memory.missions[spawnItem.missionId] || Memory.missions[spawnItem.missionId].roomId != spawn.room.name) {
    removeSpawnItemFromQueue(spawn, spawnItem);
    return;
  }

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
      Memory.empire.creepNum = Memory.empire.creepNum + 1;
      globalRoom(spawn.room.name).updateEmptyEnergyReservesArr = true;
      if (spawnItem.repeat) {
        spawnItem.requiredSpawnStart = Game.time + 1500;
        return;
      }
      removeSpawnItemFromQueue(spawn, spawnItem);
      return;
    }
    case -1: { // ERR_NOT_OWNER
      console.log(`${spawn.name}: ERR_NOT_OWNER, ${JSON.stringify(spawnItem)}`);
      return;
    }
    case -3: { // ERR_NAME_EXISTS
      Memory.empire.creepNum = Memory.empire.creepNum + 1000;
      return;
    }
    case -4: { // ERR_BUSY
      console.log(`${spawn.name}: ERR_BUSY, ${JSON.stringify(spawnItem)}`);
      return;
    }
    case -6: { // ERR_NOT_ENOUGH_ENERGY
      if (spawn.room.energyCapacityAvailable < getCostForBodyPartsArr(spawnItem.body)) { spawnItem.requiredSpawnStart = Game.time + 1500; return; }
      return;
    }
    case -10: { // ERR_INVALID_ARGS
      console.log(`${spawn.name}: ERR_INVALID_ARGS, ${JSON.stringify(spawnItem)}`);
      return;
    }
    case -14: { // ERR_RCL_NOT_ENOUGH
      console.log(`${spawn.name}: ERR_RCL_NOT_ENOUGH, ${JSON.stringify(spawnItem)}`);
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
}

const addToSpawnQueue = (spawn: StructureSpawn, item: SpawnQueue) => {
  spawn.memory.queue.push(item);
}

const removeSpawnItemFromQueue = (spawn: StructureSpawn, spawnItem: SpawnQueue) => {
  let index = spawn.memory.queue.indexOf(spawnItem);
  if (index > -1) { // only splice array when item is found
    spawn.memory.queue.splice(index, 1);
  }
}

const processSpawns = () => {
  for (let i in Game.spawns) {
    newSpawnTick(Game.spawns[i]);
  }
}

export { processSpawns, insertUpdateSpawnQueueItems }
