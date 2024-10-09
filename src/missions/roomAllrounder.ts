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
    path: [],
    pathFromController: [],
    pathToController: []
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
      path: [],
      pathFromController: [],
      pathToController: []
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

export { initAllrounder }
