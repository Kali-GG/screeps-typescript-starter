
let hostiles: Creep[];
let towers: AnyOwnedStructure[];

const defendRoom = (room: Room) => {
  hostiles = room.find(FIND_HOSTILE_CREEPS);
  if(hostiles.length > 0) {
    towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
    towers.forEach(tower => {
      if (tower.structureType === "tower") {
        tower.attack(hostiles[0])
      }
    });
  }
}

export { defendRoom }
