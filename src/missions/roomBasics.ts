import {spawnHarvestSourceBasicMission} from "./harvestSourceBasic";
import {getAvoidPositionArrAsRoomPositions, pushPositionToAvoidPositionArr} from "../rooms/rooms";
import {initUpgradeBasicMission} from "./upgradeBasic";
import {spawnUpgraderHaulerMission} from "./upgraderHaulerBasic";
import {lookForSpecificStructureTypeAt, lookForSpecificTypeConstructionSite} from "../utils/lookFor";

const baseName = 'roomBasics';
let missionId: string;

const initRoomBasics = (room: Room) => {

  missionId = room.name + '_' + baseName;

  Memory.missions[missionId] = {
    id: missionId,
    roomId: room.name,
    type: baseName,
    children: [],
    spawnId: [],
  };

  let spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length == 0) { return; }

  // @ts-ignore
  let pathToUpgraderPosition = room.findPath(spawns[0].pos, room.controller.pos, {
    ignoreCreeps: true,
    range: 3
  });
  pushPositionToAvoidPositionArr(room, {x: pathToUpgraderPosition[pathToUpgraderPosition.length-1].x, y: pathToUpgraderPosition[pathToUpgraderPosition.length-1].y, type:'upgraderPosition' });

  let sources = room.find(FIND_SOURCES);
  sources.forEach(source => {
    let pathFromSpawn = room.findPath(new RoomPosition(spawns[0].pos.x +1, spawns[0].pos.y, room.name), source.pos, {
      ignoreCreeps: true,
      avoid: getAvoidPositionArrAsRoomPositions(room),
      range: 1
    });

    spawnHarvestSourceBasicMission(room, source, pathFromSpawn, spawns[0]);
    spawnUpgraderHaulerMission(room, source, spawns[0], new RoomPosition(pathToUpgraderPosition[pathToUpgraderPosition.length-1].x, pathToUpgraderPosition[pathToUpgraderPosition.length-1].y, room.name));

  });

  initUpgradeBasicMission(room, spawns[0], pathToUpgraderPosition);
}

const basicMissionStructureCheck = (missionId: string) => { //works for both miner & upgrader

  let mission = Memory.missions[missionId];
  if (!mission.path) { return; } //todo: should we kill the mission?
  let room = Game.rooms[mission.roomId];
  if (!room) { return; } //todo: should we kill the mission?

  if (!mission.containerId || !Game.getObjectById(mission.containerId)) {
    let container = lookForSpecificStructureTypeAt(room, mission.path[mission.path.length-1].x, mission.path[mission.path.length-1].y, STRUCTURE_CONTAINER);
    if (container && container.structureType == STRUCTURE_CONTAINER) {
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

export { initRoomBasics, basicMissionStructureCheck }
