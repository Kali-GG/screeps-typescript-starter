/**
 * Check if room is ready to work on new construction project
 *  - we are under global construction site limit
 *  - the room has no active construction site (we want to focus on 1 construction site)
 *
 *  Find Structures of each type, (some priority?) ans compare to the maximum available number for current room level
 *    if possible to build structure, place a construction site
 *
 */

const STRUCTURE_BUILD_PRIORITY = [
  STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_EXTENSION,
  STRUCTURE_EXTRACTOR, STRUCTURE_OBSERVER, STRUCTURE_CONTAINER,
  STRUCTURE_POWER_SPAWN, STRUCTURE_FACTORY,
  STRUCTURE_LAB, STRUCTURE_NUKER, STRUCTURE_ROAD, STRUCTURE_RAMPART, STRUCTURE_WALL,
];


const placeNextBuilding = (room: Room) => {
  if (Object.keys(Game.constructionSites).length >= MAX_CONSTRUCTION_SITES) { return; }
  if (room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) { return; }

  if (!room._my() || !room.controller) { return; }
  let controller = room.controller;

  STRUCTURE_BUILD_PRIORITY.every( type => {
    if (findMyStructures(type, room).length < CONTROLLER_STRUCTURES[type][controller.level]) {
      // find spot
      // place structure &
      // return false; // breaks out of .every
    }
    return true;
  });


}

const findMyStructures = (type: BuildableStructureConstant, room?: Room) => {
  return _.filter(Game.structures, (s) => {
    return s.structureType == type && (room ? s.room.name == room.name : true);
  });
}

export  {placeNextBuilding};