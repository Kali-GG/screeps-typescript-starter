import {insertUpdateSpawnQueueItems} from "../structures/spawn/spawn";
import {findPath} from "../utils/findPath";
import {pathStepToRoomPosition} from "../utils/itemConverter";


const baseName = 'upgraderHauler';
let missionId: string;

const initUpgraderHaulerBasicMission = (room: Room, source: Source, spawn: StructureSpawn, upgraderPos: RoomPosition) => {
  if (!Memory.missions[room.name + '_harvest_' + source.id]) { return; }
  if (!Memory.missions[room.name + '_harvest_' + source.id].containerId) {
    room.memory.tickTillSpawnMissions = Math.min(room.memory.tickTillSpawnMissions, 1500);
    return;
  }

  // @ts-ignore
  let container: Structure = Game.getObjectById(Memory.missions[room.name + '_harvest_' + source.id].containerId);

  if (!container || container.structureType != STRUCTURE_CONTAINER) {
    room.memory.tickTillSpawnMissions = Math.min(room.memory.tickTillSpawnMissions, 1500);
    return;
  }

  missionId = room.name + '_' + baseName + '_' + source.id;

  //path to get to pickuplocation
  let path = findPath(room, spawn._spawnPos(), container.pos, {range: 1});

  let pickUpPos = pathStepToRoomPosition(room, path[path.length-1]);
  let pathToController = findPath(room, pickUpPos, upgraderPos, {range: 1});

  let dropOffPos = pathStepToRoomPosition(room, pathToController[pathToController.length-1]);
  let pathFromController = findPath(room, dropOffPos, pickUpPos, {range: 0});

  if (!Memory.missions[missionId]) {
    Memory.missions[missionId] = {
      id: missionId,
      type: baseName,
      roomId: room.name,
      spawnId: [spawn.id],
      sourceId: source.id,
      path: path,
      pathToController: pathToController,
      pathFromController: pathFromController,
      creepRole: 3, //todo: in SIM creepRoles.miner is crashing.
    };
  }

  Memory.missions[missionId].spawnId = [spawn.id];
  Memory.missions[missionId].path = path;
  Memory.missions[missionId].pathToController = pathToController;
  Memory.missions[missionId].pathFromController = pathFromController;

  let args: SpawnQueue = {
    body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ],
    requiredSpawnStart: Game.time,
    repeat: true,
    missionId: missionId,
    role: 3
  };

  insertUpdateSpawnQueueItems(missionId, spawn, args, 1);
}

export { initUpgraderHaulerBasicMission }
