const lookForSpecificStructureTypeAt = (room: Room, x: number, y: number, structureType: string): Structure | null => {
  let searchResult = room.lookForAt(LOOK_STRUCTURES, x, y);

  if (searchResult.length) {
    if (searchResult[0].structureType == structureType) { return searchResult[0]; }
    searchResult[0].destroy(); //todo: this might cause trouble
  }

  return null;
}

const lookForSpecificTypeConstructionSite = (room: Room, x: number, y: number, structureType: string): Id<ConstructionSite> | null => {
  let searchResult = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
  if (searchResult.length) {
    if (searchResult[0].structureType == structureType) { return searchResult[0].id; }
    searchResult[0].remove();
  }
  return null;
}

export { lookForSpecificStructureTypeAt, lookForSpecificTypeConstructionSite }
