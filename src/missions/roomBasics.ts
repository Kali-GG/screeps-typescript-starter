import {initHarvestSourceBasicMission} from "./harvestSourceBasic";
import {getAvoidPositionByType, pushPositionToAvoidPositionArr} from "../rooms/rooms";
import {initUpgradeBasicMission} from "./upgradeBasic";
import {initUpgraderHaulerBasicMission} from "./upgraderHaulerBasic";
import {lookForSpecificStructureTypeAt, lookForSpecificTypeConstructionSite} from "../utils/lookFor";
import {findPath} from "../utils/findPath";


const baseName = 'roomBasics';
let missionId: string;

const initRoomBasics = (room: Room) => {
  // this check is not necessary as we already check that the room is owned by us before invoking the function (which implies that there is a controller)
  // however, we need to do the check to satisfy typescript and avoid ts-ignore
  if (room.controller == undefined) { return; }

  missionId = room.name + '_' + baseName;

  Memory.missions[missionId] = {
    id: missionId,
    roomId: room.name,
    type: baseName,
    spawnId: [],
    path: [],
    pathToController: [],
    pathFromController: []
  };

  let spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length == 0) { return; }

  let spawnPos = spawns[0]._spawnPos();
  let upgraderPos = getAvoidPositionByType(room, `upgraderPosition`);

  let pathToUpgraderPosition = upgraderPos == null ?
    findPath(room, spawnPos, room.controller.pos, {range: 3}) :
    findPath(room, spawnPos, upgraderPos, {range: 0});

  let renewedUpgraderPos = new RoomPosition(pathToUpgraderPosition[pathToUpgraderPosition.length-1].x, pathToUpgraderPosition[pathToUpgraderPosition.length-1].y, room.name);
  pushPositionToAvoidPositionArr(room, {x: renewedUpgraderPos.x, y: renewedUpgraderPos.y, type:'upgraderPosition' });

  let sources = room.find(FIND_SOURCES);
  sources.forEach(source => {
    let harvestPos = getAvoidPositionByType(room, `harvestPosition_${source.id}`);

    if (source.id == '2df0d5ca2eb24664f7403392') {console.log(`harvestPos ${harvestPos}`)}

    let pathFromSpawn = harvestPos == null ?
      findPath(room, spawnPos, source.pos, {range: 1}) :
      findPath(room, spawnPos, harvestPos, {range: 0});

    if (source.id == '2df0d5ca2eb24664f7403392') {console.log(`pathFromSpawn ${JSON.stringify(pathFromSpawn)}`)}

    pushPositionToAvoidPositionArr(room, {x: pathFromSpawn[pathFromSpawn.length-1].x, y: pathFromSpawn[pathFromSpawn.length-1].y, type:`harvestPosition_${source.id}` });

    initHarvestSourceBasicMission(room, source, pathFromSpawn, spawns[0]);
    initUpgraderHaulerBasicMission(room, source, spawns[0], renewedUpgraderPos);

  });

  initUpgradeBasicMission(room, spawns[0], pathToUpgraderPosition);
}

const basicMissionStructureCheck = (missionId: string) => { //works for both miner & upgrader

  let mission = Memory.missions[missionId];
  if (!mission.path || mission.path.length == 0) { return; } //todo: should we kill the mission?
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
    }
  }
}

export { initRoomBasics, basicMissionStructureCheck }
