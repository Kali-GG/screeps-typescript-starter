import {insertUpdateSpawnQueueItems} from "../structures/spawn/spawn";

const baseName = 'allrounder';
let missionId: string;

const initAllrounder = (room: Room) => {

  missionId = room.name + '_' + baseName;

  let spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length == 0) { return; }

  Memory.missions[missionId] = {
    id: missionId,
    roomId: room.name,
    type: baseName,
    spawnId: [spawns[0].id],
  };

  let sources = room.find(FIND_SOURCES);
  sources.forEach(source => {
    Memory.missions[`${missionId}_${source.id}`] = {
      id: `${missionId}_${source.id}`,
      roomId: room.name,
      type: baseName,
      spawnId: [spawns[0].id],
      sourceId: source.id,
      creepRole: 1,
    };

    let args: SpawnQueue = {
      body: [WORK, CARRY, MOVE, MOVE ],
      requiredSpawnStart: Game.time,
      repeat: true,
      missionId: `${missionId}_${source.id}`,
      role: 1
    };

    insertUpdateSpawnQueueItems(`${missionId}_${source.id}`, spawns[0], args, 3);
  });
}

/*
const updateSpawnQueueItems = (missionId: string, spawn: StructureSpawn): void => {

  let args: SpawnQueue = {
    body: [WORK, CARRY, MOVE, MOVE ],
    requiredSpawnStart: Game.time,
    repeat: true,
    missionId: missionId,
    role: 1
  };

  let spawnQueueItemCount = _.filter(spawn.memory.queue, (item) => { return item.missionId && item.missionId == missionId; }).length;

  for (let i = 0; i < 3 - spawnQueueItemCount; i++) {
    addToSpawnQueue(spawn, args);
  }
}

 */

/*
const allrounderMissionSpawnCheck = (id: string): void => {
  // @ts-ignore
  let spawn = Game.getObjectById(Memory.missions[id].spawnId[0]);
  if (!spawn) { return; }

  let args: SpawnQueue = {
    body: [WORK, CARRY, MOVE, MOVE ],
    opts: {memory: {
        missionId: id,
        role: 1,
      },
    },
    requiredSpawnStart: Game.time,
    repeat: true,
    missionId: id,
    role: 1
  };

  let spawnQueueItemCount = _.filter(spawn.memory.queue, (item) => { return item.missionId && item.missionId == id; }).length;

  for (let i = 0; i < 3 - spawnQueueItemCount; i++) {
    addToSpawnQueue(spawn, args);
  }

  //Memory.missions[id].ticksTillNextSpawn = 1500; //todo: best would be to set the value when actually spawning!
}

 */

export { initAllrounder }
