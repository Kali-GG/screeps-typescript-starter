import {harvest, hasReachedFinalPathPosition} from "./sharedCreepBehavior";

/*
  https://docs.screeps.com/simultaneous-actions.html
  Allowed simultaneous actions: harvest & transfer
  Building or repairing cannot be done in the same tick as harvesting or transferring

  1. Move to position
  2. If full storage: optionally build or transfer
  3. If not building, harvesting
 */

const miner = (creep: Creep) => {
  if (!Memory.missions[creep.memory.missionId]) { return; }
  if (!Memory.missions[creep.memory.missionId].sourceId) { return; }
  if (!Memory.missions[creep.memory.missionId].path) { return; }

  // @ts-ignore
  if (!hasReachedFinalPathPosition(creep, Memory.missions[creep.memory.missionId].path)) { return; };

  if(creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
    console.log('store full')
    //if (isBuildingThisTick(creep)) { console.log('should build'); return; } //todo: this function crashes the code!
    transfer(creep);
  }

  // @ts-ignore
  harvest(creep, Memory.missions[creep.memory.missionId].sourceId);
}


let constructionSite: ConstructionSite | null = null;

const isBuildingThisTick = (creep: Creep): boolean => {
  if (!Memory.missions[creep.memory.missionId].constructionSiteIds) { return false; }
  console.log('1')
  if (Memory.missions[creep.memory.missionId].constructionSiteIds?.length == 0) { return false; }
  console.log('2')

  // @ts-ignore
  for (let i = Memory.missions[creep.memory.missionId].constructionSiteIds?.length -1; i <= 0; i--) {
    // @ts-ignore
    constructionSite = getConstructionSiteObject(Memory.missions[creep.memory.missionId].constructionSiteIds[i]);
    if (constructionSite) {
      console.log('3')
      creep.build(constructionSite);
      return true;
    }
    // @ts-ignore
    Memory.missions[creep.memory.missionId].constructionSiteIds.splice(i, 1);
  }

  return false;
}


const getConstructionSiteObject = (id: Id<ConstructionSite>): ConstructionSite | null => {
  constructionSite = Game.getObjectById(id);

  if (constructionSite == null) { return null; }
  if (!constructionSite.progress) { return null; }

  return constructionSite;
}

let source: Source | null = null;
const transfer = (creep: Creep) => {

  // todo: implement :)

  /*
  // @ts-ignore
  target = Game.getObjectById<Id<Source>>(Memory.missions[creep.memory.missionId].sourceId);

  if (source != null) {
    if (source instanceof ConstructionSite) { creep.build(source); return; }

  }
   */

  // check for extensions
  // check for link
  // check for container (repair?)
}

export { miner }
