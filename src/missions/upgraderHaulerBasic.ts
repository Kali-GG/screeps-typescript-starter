import {insertUpdateSpawnQueueItems} from "../structures/spawn/spawn";
import {getAvoidPositionArrAsRoomPositions} from "../rooms/rooms";
import {lookForSpecificStructureTypeAt, lookForSpecificTypeConstructionSite} from "../utils/lookFor";

const baseName = 'upgraderHauler';
let missionId: string;

const spawnUpgraderHaulerMission = (room: Room, source: Source, spawn: StructureSpawn, upgraderPos: RoomPosition) => {
  if (!Memory.missions[room.name + '_harvest_' + source.id]) { return; }
  if (!Memory.missions[room.name + '_harvest_' + source.id].path) { return; }
  if (!Memory.missions[room.name + '_harvest_' + source.id].containerId) {
    room.memory.tickTillSpawnMissions = Math.min(room.memory.tickTillSpawnMissions, 1500);
    return;
  }

  missionId = room.name + '_' + baseName + '_' + source.id;

  if (!Memory.missions[missionId]) {
    //path to get to
    let path: PathStep[] = [];
    // @ts-ignore
    for (let i = 0; i < Memory.missions[room.name + '_harvest_' + source.id].path.length - 1; i++) {
      // @ts-ignore
      path.push(Memory.missions[room.name + '_harvest_' + source.id].path[i]);
    }

    let pickUpPos = new RoomPosition(path[path.length-1].x, path[path.length-1].y,room.name);
    let pathToController = room.findPath(pickUpPos, upgraderPos, {
      ignoreCreeps: true,
      range: 1,
      avoid: getAvoidPositionArrAsRoomPositions(room)
    });

    let dropOffPos = new RoomPosition(pathToController[pathToController.length-1].x, pathToController[pathToController.length-1].y,room.name)
    let pathFromController = room.findPath(dropOffPos, pickUpPos, {
      ignoreCreeps: true,
      avoid: getAvoidPositionArrAsRoomPositions(room)
    });

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

  let args: SpawnQueue = {
    body: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE ],
    requiredSpawnStart: Game.time,
    repeat: true,
    missionId: missionId,
    role: 3
  };

  insertUpdateSpawnQueueItems(missionId, spawn, args, 1);


}


const upgraderHaulerStructureCheck = (missionId: string) => {

  let mission = Memory.missions[missionId];
  if (!mission.path) { return; } //todo: should we kill the mission?
  let room = Game.rooms[mission.roomId];
  if (!room) { return; } //todo: should we kill the mission?

  if (!mission.containerId || !Game.getObjectById(mission.containerId)) {
    let container = lookForSpecificStructureTypeAt(room, mission.path[mission.path.length-1].x, mission.path[mission.path.length-1].y, STRUCTURE_CONTAINER);

    if (container && container.structureType == STRUCTURE_CONTAINER ) {
      // @ts-ignore
      mission.containerId = container.id;
    }
  }

  if (!mission.containerId && (!Memory.missions[missionId].constructionSiteIds || Memory.missions[missionId].constructionSiteIds?.length == 0 )) {
    let containerConstructionSiteId = lookForSpecificTypeConstructionSite(room, mission.path[mission.path.length-1].x, mission.path[mission.path.length-1].y, STRUCTURE_CONTAINER);
    if (containerConstructionSiteId) { Memory.missions[missionId].constructionSiteIds?.push(containerConstructionSiteId); }
    if (!containerConstructionSiteId) {
      room.createConstructionSite(mission.path[mission.path.length-1].x, mission.path[mission.path.length-1].y, STRUCTURE_CONTAINER);
      Memory.missions[missionId].ticksTillNextCheck = 2;
    }
  }
}



export { spawnUpgraderHaulerMission }
