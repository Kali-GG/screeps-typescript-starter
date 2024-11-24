/**
 * Check if room is ready to work on new construction project
 *  - we are under global construction site limit
 *  - the room has no active construction site (we want to focus on 1 construction site)
 *
 *  Find Structures of each type, (some priority?) and compare to the maximum available number for current room level
 *    if possible to build structure, place a construction site
 *
 */

const STRUCTURE_BUILD_PRIORITY = [
  STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_EXTENSION,
  STRUCTURE_EXTRACTOR, STRUCTURE_OBSERVER, STRUCTURE_CONTAINER,
  STRUCTURE_POWER_SPAWN, STRUCTURE_FACTORY,
  STRUCTURE_LAB, STRUCTURE_NUKER, STRUCTURE_ROAD, STRUCTURE_RAMPART, STRUCTURE_WALL,
];

const buildBase =  (room: Room): void => {
  //todo: find a smart way to make sure this expensive operation only runs when needed

  if (!room._my() || !room.controller) { return; }
  if (!room.memory.baseLayout) { return; }
  if (Object.keys(Game.constructionSites).length >= MAX_CONSTRUCTION_SITES) { return; }
  let controller = room.controller;
  let baseLayout = room.memory.baseLayout;
  if (room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) { return; }

  STRUCTURE_BUILD_PRIORITY.every( type => {
    if (type == STRUCTURE_RAMPART || type == STRUCTURE_ROAD || type == STRUCTURE_WALL) { return true; }

    let filteredStructuresArr = findMyStructures(type, room);
    if (!structureNeedsToBeBuilt(filteredStructuresArr, type, controller)) { return true; }

    placeNextBuilding(room, filteredStructuresArr, baseLayout, type);

    return false;
  });
}

const structureNeedsToBeBuilt = (filteredStructuresArr: Structure[], type: BuildableStructureConstant, controller: StructureController) => {
  return filteredStructuresArr.length < CONTROLLER_STRUCTURES[type][controller.level];
}

const placeNextBuilding = (room: Room, filteredStructuresArr: Structure[], baseLayout: BaseLayoutMemory, type: BuildableStructureConstant) => {
  baseLayout.structurePositions[type].every( structurePos => {
    if (_.filter(filteredStructuresArr, (current) => {
      return current.pos.x == structurePos.x && current.pos.y == structurePos.y;
    }).length > 0) { return true; }

    room.createConstructionSite(structurePos.x, structurePos.y, type);
    //todo: check return values, normally it should be fine, but -7 ERR_INVALID_TARGET might mean that there is a structure already in this location
    return false;
  });
}

const findMyStructures = (type: BuildableStructureConstant, room?: Room) => {
  return _.filter(Game.structures, (s) => {
    return s.structureType == type && (room ? s.room.name == room.name : true);
  });
}


export  {buildBase};
