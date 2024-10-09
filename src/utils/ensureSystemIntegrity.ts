import {pushPositionToAvoidPositionArr} from "../rooms/rooms";

const latestMemoryVersion = 3;

const ensureSystemIntegrity = () => {
  global.costMatrixCache = {};
  if (!Memory.missions) { Memory.missions = {}; }
  if (!Memory.empire) {
    Memory.empire = {creepNum: 0, memoryVersion: 0};
  }

  if (!Memory.empire.memoryVersion || Memory.empire.memoryVersion < latestMemoryVersion) {
    Memory.empire = {creepNum: 0, memoryVersion: latestMemoryVersion};
    Memory.missions = {};
    Memory.spawns = {};
    Memory.rooms = {};
  }

  for (let i in Game.rooms) {
    ensureRoomMemoryIntegrity(Game.rooms[i]);
  }

  for (let i in Game.spawns) {
    ensureSpawnMemoryIntegrity(Game.spawns[i]);
    //todo: hardcoded to spawn right of spawn
    //sanity check could be removed if we trust that the arr is filled properly
    pushPositionToAvoidPositionArr(Game.spawns[i].room, {x: Game.spawns[i].pos.x + 1, y: Game.spawns[i].pos.y, type: i});
    cleanSpawnQueue(Game.spawns[i]);
  }

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  // Automatically delete memory of missing spawns
  for (const name in Memory.spawns) {
    if (!(name in Game.spawns)) {
      delete Memory.spawns[name];
    }
  }

}

const ensureRoomMemoryIntegrity = (room: Room): void => {
  if (!room._my()) { return; }
  if (room.memory.tickTillSpawnMissions == undefined) { room.memory.tickTillSpawnMissions = 0; }
  if (room.memory.avoidPositions == undefined) { room.memory.avoidPositions = []; }
}

const ensureSpawnMemoryIntegrity = (spawn: StructureSpawn) => {
  if (!spawn.memory.queue) { spawn.memory.queue = []; }
}

const cleanSpawnQueue = (spawn: StructureSpawn) => {
  for (let i = spawn.memory.queue.length - 1; i >= 0; i--) {
    if (spawn.memory.queue[i].body == undefined ||
      spawn.memory.queue[i].requiredSpawnStart == undefined ||
      spawn.memory.queue[i].repeat == undefined ||
      !Memory.missions[spawn.memory.queue[i].missionId] ||
      spawn.memory.queue[i].role == undefined
    ) {
      spawn.memory.queue.splice(i, 1);
    }
  }
}

export { ensureSystemIntegrity }
