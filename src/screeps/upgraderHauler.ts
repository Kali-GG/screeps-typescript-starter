import { hasReachedFinalPathPosition} from "./sharedCreepBehavior";

/*
  1. If store.energy is empty -> move to source container
  2. If no upgrader container -> drop energy next to upgrading position
  3. Transfer energy to container
 */

let mission: MissionMemory;
let container: StructureContainer | null;

const upgraderHauler = (creep: Creep) => {
  if (!Memory.missions[creep.memory.missionId]) { return; }
  mission = Memory.missions[creep.memory.missionId];
  if (!mission.path) { return; }
  if (!mission.pathToController) { return; }
  if (!mission.pathFromController) { return; }
  if (!mission.sourceId) { return; }
  if (!Memory.missions[mission.roomId + '_harvest_' + mission.sourceId]) { return; }

  if(creep.store[RESOURCE_ENERGY] == 0) {
    let harvestMission = Memory.missions[mission.roomId + '_harvest_' + mission.sourceId];
    container = harvestMission.containerId != undefined ? Game.getObjectById(harvestMission.containerId) : null;
    if (!container || container.structureType != STRUCTURE_CONTAINER) { creep.suicide(); return; } //todo: look for energy to pick up at this location
    if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      if( creep.moveByPath(mission.pathFromController) == ERR_NOT_FOUND) {
        if( creep.moveByPath(mission.path) == ERR_NOT_FOUND) {
          creep.moveTo(mission.path[Math.min(5, mission.path.length-1)].x, mission.path[Math.min(5, mission.path.length-1)].y, {maxOps: 100});
        }
      }
    }
    return;
  }

  let upgraderMission = Memory.missions[`${mission.roomId}_upgrader`];
  container = upgraderMission.containerId != undefined ? Game.getObjectById(upgraderMission.containerId) : null;
  if (!container || container.structureType != STRUCTURE_CONTAINER) {
    if (hasReachedFinalPathPosition(creep, mission.pathToController)) {
      creep.drop(RESOURCE_ENERGY);
    }
    return;
  }

  let transferAction = creep.transfer(container, RESOURCE_ENERGY);
  if(transferAction == ERR_NOT_IN_RANGE) {
    if( creep.moveByPath(mission.pathToController) == ERR_NOT_FOUND) {
      console.log(`${creep.name} | ${creep.memory.missionId} mission.pathToController ERR_NOT_FOUND`);
      creep.moveTo(mission.pathToController[Math.min(5, mission.pathToController.length-1)].x, mission.pathToController[Math.min(5, mission.pathToController.length-1)].y, {maxOps: 20});
    }
  }
  else if (transferAction == ERR_FULL) {
    creep.drop(RESOURCE_ENERGY);
  }
}

export { upgraderHauler }
