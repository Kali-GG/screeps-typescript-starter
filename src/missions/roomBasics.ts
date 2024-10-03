import {addToSpawnQueue} from "../structures/spawn/spawn";

const CPU_PER_CREEP = 0.25;
const REQUIRED_WORK_PARTS_TO_DEPLETE_OWNED_SOURCE = SOURCE_ENERGY_CAPACITY / HARVEST_POWER / 300;

const carryCapacity = 150;
const upgradeCapacityPerTick = 2;

const getName = (room: Room) => {
  return room.name + '_roomBasics'
}

const initRoomBasics = (room: Room, assignedCPU: number) => {
  if (!room.controller?.my) { return; }

  let spawns = room.find(FIND_MY_SPAWNS);
  if (spawns.length == 0) { return; }

  let sources = room.find(FIND_SOURCES);

  let missionInformation: MissionMemory = {
    id: room.name + '_roomBasics',
    roomId: room.name,
    type: 'roomBasics',
    origin: room.name,
    children: [],
    spawnId: [],
  };

  sources.forEach(source => {
    let pathFromSpawn = room.findPath(spawns[0].pos, source.pos, {
      ignoreCreeps: true
    });
    pathFromSpawn.pop();

    let harvestingContainerPos = new RoomPosition(
      pathFromSpawn[pathFromSpawn.length-1].x,
      pathFromSpawn[pathFromSpawn.length-1].y,
      room.name
    );

    // @ts-ignore
    let pathToController = room.findPath(harvestingContainerPos, room.controller.pos, {
      ignoreCreeps: true,
      range: 3
    });
    let upgradingContainerPos = new RoomPosition(
      pathToController[pathToController.length-1].x,
      pathToController[pathToController.length-1].y,
      room.name
    );

    let deliveryCapacityPerTick = carryCapacity / (pathToController.length * 2);
    let requiredHaulers = Math.max(Math.floor(upgradeCapacityPerTick / deliveryCapacityPerTick), 1);

    //harvest mission
    missionInformation.children?.push( room.name + '_harvest_' + source.id );
    spawnHarvestMission(room, source, pathFromSpawn, spawns[0]);

    // todo: add hauler mission & spawn creep
    // todo: add upgrade mission & spawn creep
  });
  Memory.missions[room.name + '_roomBasics'] = missionInformation;
}

const spawnHarvestMission = (room: Room, source: Source, pathFromSpawn: PathStep[], spawn: StructureSpawn) => {


  Memory.missions[room.name + '_harvest_' + source.id] = {
    id: room.name + '_harvest_' + source.id,
    type: 'harvest',
    roomId: room.name,
    origin: room.name + '_roomBasics',
    children: [],
    spawnId: [spawn.id],
    sourceId: source.id,
    constructionPositions: getDepositPositions(room, source, pathFromSpawn),
    constructionSiteIds: [],
    path: pathFromSpawn,
    creepRole: 0, //todo: in SIM creepRoles.miner is crashing.
    ticksTillNextCheck: 2
  };

  let containerId = lookForContainer(room, pathFromSpawn);
  if (containerId) { Memory.missions[room.name + '_harvest_' + source.id].containerId = containerId; }

  if (!containerId) {
    let containerConstructionSiteId = lookForContainerConstructionSite(room, pathFromSpawn);
    if (containerConstructionSiteId) { Memory.missions[room.name + '_harvest_' + source.id].constructionSiteIds?.push(containerConstructionSiteId); }
    if (!containerConstructionSiteId) {
      room.createConstructionSite(pathFromSpawn[pathFromSpawn.length-1].x, pathFromSpawn[pathFromSpawn.length-1].y, STRUCTURE_CONTAINER);
    }
  }

  addToSpawnQueue(spawn, {
    body: [WORK, CARRY, MOVE ],
    opts: {memory: {
        missionId: room.name + '_harvest_' + source.id,
        role: 0,
        targetId: source.id,
        path: pathFromSpawn
      },
      directions: [pathFromSpawn[0].direction]
    }
  });
}

const getDepositPositions = (room: Room, source: Source, pathFromSpawn: PathStep[]): SimplePosition[] => {

  let depositPositions: SimplePosition[] = [];
  if (pathFromSpawn.length < 3) { return depositPositions; } // todo: edge case not yet implemented. Will break stuff!

  const terrain = new Room.Terrain(room.name);

  let terrainPos;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      if (x == 0 && y == 0) { continue; } // miner spot
      if (pathFromSpawn[pathFromSpawn.length-1].x + x < 1 || pathFromSpawn[pathFromSpawn.length-1].x + x > 48 ||
        pathFromSpawn[pathFromSpawn.length-1].y + y < 1 || pathFromSpawn[pathFromSpawn.length-1].y + y > 48) {
        continue;
      } // room edges
      if (pathFromSpawn[pathFromSpawn.length-1].x + x == source.pos.x && pathFromSpawn[pathFromSpawn.length-1].y + source.pos.y == 0) { continue; } // source spot
      if (pathFromSpawn[pathFromSpawn.length-1].x + x == pathFromSpawn[pathFromSpawn.length-2].x && pathFromSpawn[pathFromSpawn.length-1].y + pathFromSpawn[pathFromSpawn.length-2].y == 0) { continue; }

      terrainPos = terrain.get(pathFromSpawn[pathFromSpawn.length-1].x + x, pathFromSpawn[pathFromSpawn.length-1].y + y);

      if (terrainPos === 1) { continue; }

      depositPositions.push({x: pathFromSpawn[pathFromSpawn.length-1].x + x, y: pathFromSpawn[pathFromSpawn.length-1].y + y});
    }
  }
  return depositPositions;
}

const lookForContainer = (room: Room, pathFromSpawn: PathStep[]): Id<Structure> | null => {
  let searchResult = room.lookForAt(LOOK_STRUCTURES, pathFromSpawn[pathFromSpawn.length-1].x, pathFromSpawn[pathFromSpawn.length-1].y);

  if (searchResult.length) {
    if (searchResult[0].structureType == STRUCTURE_CONTAINER) { return searchResult[0].id; }
    searchResult[0].destroy();
  }

  return null;
}

const lookForContainerConstructionSite = (room: Room, pathFromSpawn: PathStep[]): Id<ConstructionSite> | null => {
  let searchResult = room.lookForAt(LOOK_CONSTRUCTION_SITES, pathFromSpawn[pathFromSpawn.length-1].x, pathFromSpawn[pathFromSpawn.length-1].y);
  if (searchResult.length) {
    if (searchResult[0].structureType == STRUCTURE_CONTAINER) { return searchResult[0].id; }
    searchResult[0].remove();
  }
  return null;
}

const harvestMissionSanityCheck = (id: string) => {
  console.log('harvestMissionSanityCheck: ' + id);
  Memory.missions[id].ticksTillNextCheck = 5000;

  let mission = Memory.missions[id];
  if (!mission.path) { return; } //todo: should we kill the mission?
  let room = Game.rooms[mission.roomId];
  if (!room) { return; } //todo: should we kill the mission?

  if (!mission.containerId || !Game.getObjectById(mission.containerId)) {
    let containerId = lookForContainer(room, mission.path );
    if (containerId) { mission.containerId = containerId; }
  }

  if (!mission.containerId) {
    let containerConstructionSiteId = lookForContainerConstructionSite(room, mission.path);
    if (containerConstructionSiteId) { Memory.missions[id].constructionSiteIds?.push(containerConstructionSiteId); }
    if (!containerConstructionSiteId) {
      room.createConstructionSite(mission.path[mission.path.length-1].x, mission.path[mission.path.length-1].y, STRUCTURE_CONTAINER);
      Memory.missions[id].ticksTillNextCheck = 2;
    }
  }
}


const spawnHaulerMission = () => {}

const spawnUpgradeMission = () => {}

export { initRoomBasics, getName, harvestMissionSanityCheck }
