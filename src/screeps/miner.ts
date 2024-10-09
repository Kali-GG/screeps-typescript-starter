import {harvestSource, hasReachedFinalPathPosition, isBuildingThisTick, isRepairingThisTick} from "./sharedCreepBehavior";
import {basicMissionStructureCheck} from "../missions/roomBasics";

/*
  https://docs.screeps.com/simultaneous-actions.html
  Allowed simultaneous actions: harvest & transfer
  Building or repairing cannot be done in the same tick as harvesting or transferring

  1. Move to position
  2. If full storage: optionally build/repair or transfer
  3. If not building/repairing, harvest
 */

let mission: MissionMemory;

const miner = (creep: Creep) => {
  if (!Memory.missions[creep.memory.missionId]) { return; }
  if (!Memory.missions[creep.memory.missionId].sourceId) { return; }
  if (!Memory.missions[creep.memory.missionId].path) { return; }
  mission = Memory.missions[creep.memory.missionId];

  if (!hasReachedFinalPathPosition(creep, mission.path)) { return; }

  if(creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
    if (mission.containerId && mission.constructionSiteIds != undefined && mission.constructionSiteIds.length == 0) {
        basicMissionStructureCheck(creep.memory.missionId);
    }
    if (isBuildingThisTick(creep)) { return; }
    if (isRepairingThisTick(creep)) { return; }
    transfer(creep);
  }

  if (mission.sourceId == undefined) { return; }
  harvestSource(creep, mission.sourceId);
}

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
