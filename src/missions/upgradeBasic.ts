import {insertUpdateSpawnQueueItems} from "../structures/spawn/spawn";

const baseName = 'upgrader';
let missionId: string;

const initUpgradeBasicMission = (room: Room, spawn: StructureSpawn, path: PathStep[]) => {

  missionId = room.name + '_' + baseName;

  Memory.missions[missionId] = {
    id: missionId,
    roomId: room.name,
    type: baseName,
    spawnId: [spawn.id],
    path: path,
    pathToController: [],
    pathFromController: [],
    constructionSiteIds: [],
  };

  let args: SpawnQueue = {
    body: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE ],
    requiredSpawnStart: Game.time,
    repeat: true,
    missionId: missionId,
    role: 2
  };

  insertUpdateSpawnQueueItems(missionId, spawn, args, 1);
}

export { initUpgradeBasicMission }
