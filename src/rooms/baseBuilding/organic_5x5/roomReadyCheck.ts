
const roomReadyCheck = (room: Room, baseLayout: BaseLayoutMemory): boolean => {
  if (!room._my()) { return false; }
  return checkMinimumRequirements(room, baseLayout);


}

/**
 * Returns true if minimum requirements are met:
 *  - Center Position is given
 *  - At least one spawn is in place
 *  - Storage is placed correctly
 */
const checkMinimumRequirements = (room: Room, baseLayout: BaseLayoutMemory): boolean => {
  if (room.lookForAt(LOOK_STRUCTURES, baseLayout.baseCenter.x, baseLayout.baseCenter.y).length > 0) { return false; }
  if (room.lookForAt(LOOK_CONSTRUCTION_SITES, baseLayout.baseCenter.x, baseLayout.baseCenter.y).length > 0) { return false; }

  let correctlyPlacedSpawns = 0;
  for (let spawnsKey in Game.spawns) {
    if (Game.spawns[spawnsKey].room.name != room.name) { continue; }
    baseLayout.structurePositions[STRUCTURE_SPAWN].forEach( spawnPos => {
      if(spawnPos.x == Game.spawns[spawnsKey].pos.x && spawnPos.y == Game.spawns[spawnsKey].pos.y) { correctlyPlacedSpawns++; }
    });
  }
  if(correctlyPlacedSpawns == 0) { return false; }

  let lookForStorage = room.lookForAt(LOOK_STRUCTURES, baseLayout.structurePositions[STRUCTURE_STORAGE][0].x, baseLayout.structurePositions[STRUCTURE_STORAGE][0].y);

  if (lookForStorage.length == 0) { return false; }
  if (lookForStorage[0].structureType != STRUCTURE_STORAGE) { return false; }
  // Structure doesn't have my-property. Although a storage does
  // @ts-ignore
  if (!lookForStorage[0].my) { return false; }

  return true;
}
