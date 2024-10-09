import { hasReachedFinalPathPosition} from "./sharedCreepBehavior";

/*
  1. If store.energy is empty -> move to source container
  2. If no upgrader container -> drop energy next to upgrading position
  3. Transfer energy to container
 */

let mission: MissionMemory;
let container: StructureContainer | null;
let containerId: Id<StructureContainer>;

const upgraderHauler = (creep: Creep) => {
  if (!Memory.missions[creep.memory.missionId]) { return; }
  mission = Memory.missions[creep.memory.missionId];
  if (!mission.path) { return; }
  if (!mission.pathToController) { return; }
  if (!mission.pathFromController) { return; }
  if (!mission.sourceId) { return; }
  if (!Memory.missions[mission.roomId + '_harvest_' + mission.sourceId]) { return; }
  if (!Memory.missions[mission.roomId + '_harvest_' + mission.sourceId].containerId) { return; }

  if(creep.store[RESOURCE_ENERGY] == 0) {
    // @ts-ignore
    containerId = Memory.missions[mission.roomId + '_harvest_' + mission.sourceId].containerId;
    // @ts-ignore
    container = Game.getObjectById(containerId);
    if (!container || container.structureType != STRUCTURE_CONTAINER) { return; } //todo: look for energy to pick up at this location

    if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      if( creep.moveByPath(mission.pathFromController) == ERR_NOT_FOUND) {
        console.log(`${creep.name} | ${creep.memory.missionId} mission.pathFromController ERR_NOT_FOUND`);
        if( creep.moveByPath(mission.path) == ERR_NOT_FOUND) {
          console.log(`${creep.name} | ${creep.memory.missionId} mission.path ERR_NOT_FOUND`);
          creep.moveTo(mission.path[Math.min(5, mission.path.length-1)].x, mission.path[Math.min(5, mission.path.length-1)].y, {maxOps: 100});
        }
      }
    }
    return;
  }

  // @ts-ignore
  containerId = Memory.missions[`${mission.roomId}_upgrader`].containerId;
  // @ts-ignore
  container = Game.getObjectById(containerId);
  let isContainer = (container && container.structureType == STRUCTURE_CONTAINER);

  if (!isContainer) {
    if (hasReachedFinalPathPosition(creep, mission.pathToController)) {
      creep.drop(RESOURCE_ENERGY);
    }
    return;
  }

  // @ts-ignore
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
