import {isBuildingThisTick, isRepairingThisTick} from "./sharedCreepBehavior";
import {basicMissionStructureCheck} from "../missions/roomBasics";

/*
  1. If store.energy is empty
    1.1 withdraw from container
    1.2 pick up from nearby energy source
    1.3 move to upgrader position
  2. build / repair container
  3. upgrade

  Allowed simultaneous actions: Non upgrading / building / repairing / withdraw are allowed in the same tick
 */

let mission: MissionMemory;
let container: StructureContainer | null;

const upgrader = (creep: Creep) => {
  if (!Memory.missions[creep.memory.missionId]) { return; }
  mission = Memory.missions[creep.memory.missionId];
  if (!mission.path) { return; }

  if (creep.pos.x != mission.path[mission.path.length-1].x || creep.pos.y != mission.path[mission.path.length-1].y) {
    if( creep.moveByPath(mission.path) == ERR_NOT_FOUND) {
      if (creep.ticksToLive != undefined && creep.ticksToLive < 1400) { creep.suicide(); }
      creep.moveTo(mission.path[Math.min(5, mission.path.length-1)].x, mission.path[Math.min(5, mission.path.length-1)].y, {maxOps: 20});
    }
    return;
  }


  if(creep.store[RESOURCE_ENERGY] == 0) {

    container = mission.containerId != undefined ? Game.getObjectById(mission.containerId) : null;
    if (!container || container.structureType != STRUCTURE_CONTAINER || container.store[RESOURCE_ENERGY] == 0) {

      let droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: function(object) {
          return object.resourceType == RESOURCE_ENERGY;
        }
      });
      if (droppedEnergy) { creep.pickup(droppedEnergy); }

      if (mission.constructionSiteIds != undefined) {
        basicMissionStructureCheck(creep.memory.missionId);
      }

      return;
    }
    creep.withdraw(container, RESOURCE_ENERGY);
    return;
  }

  if (isBuildingThisTick(creep)) { return; }
  if (isRepairingThisTick(creep)) { return; }

  if (creep.room.controller) { creep.upgradeController(creep.room.controller); }
}

export { upgrader }
