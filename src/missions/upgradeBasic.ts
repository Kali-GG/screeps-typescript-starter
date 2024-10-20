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
    body: getBodyParts(room),
    requiredSpawnStart: Game.time,
    repeat: true,
    missionId: missionId,
    role: 2
  };

  insertUpdateSpawnQueueItems(missionId, spawn, args, 1);
}

const initialBodyCost = BODYPART_COST.work + BODYPART_COST.move + BODYPART_COST.carry;
const additionalWorkMovePartsCost = BODYPART_COST.work + BODYPART_COST.move;
const bodyBartCostBuffer = 1.0;

const getBodyParts = (room: Room): BodyPartConstant[] => {
  let arr: BodyPartConstant[] = [WORK, CARRY, MOVE];

  let maxNeededAdditionalSets = room.find(FIND_SOURCES).length * 10 - 1; // harvest 10 energy per source per tick. upgrade 20 per tick. a bit optimistic but okay
  let requiredAdditionalBodyPartSets = Math.min(maxNeededAdditionalSets, Math.floor ( ((room.energyCapacityAvailable * bodyBartCostBuffer) - initialBodyCost) / additionalWorkMovePartsCost));

  for (let i = 0; i < requiredAdditionalBodyPartSets; i++) {
    arr.push(WORK, MOVE);
  }

  //if (requiredAdditionalBodyPartSets > 10) { arr.push(CARRY, CARRY); }

  return arr;
}

export { initUpgradeBasicMission }

