let actionResult = undefined;
let target: Source | null = null;

const harvestSource = (creep: Creep, sourceId: Id<Source>): void => {
  target = Game.getObjectById(sourceId);
  if (target == null) { return; } //todo: this can only happen if id is not set correctly or altered. react somehow smart
  if (!target.energy) { return; }

  actionResult = creep.harvest(target);

  switch (actionResult) {
    case 0: { // OK
      break;
    }
    case -1: { // ERR_NOT_OWNER
      console.error(creep.name + ' was supposed to harvest, error code -1 (not owned)');
      break;
    }
    case -4: { // ERR_BUSY
      break;
    }
    case -5: { // ERR_NOT_FOUND
      break;
    }
    case -6: { // ERR_NOT_ENOUGH_RESOURCES
      break;
    }
    case -7: { // ERR_INVALID_TARGET
      console.error(creep.name + ' was supposed harvest, error code -7 (invalid target)');
      break;
    }
    case -9: { // ERR_NOT_IN_RANGE
      break;
    }
    case -11: { // ERR_TIRED
      console.error(creep.name + ' was supposed harvest, error code -11 (tired)');
      break;
    }
    case -12: { // ERR_NO_BODYPART
      break;
    }
    default: {

    }
  }
}



const deposit = () => {

}

const hasReachedFinalPathPosition = (creep: Creep, path: PathStep[]): boolean => { // returns true if target location is reached. otherwise false

  if (creep.pos.x == path[path.length-1].x && creep.pos.y == path[path.length-1].y) { return true; }

  if (creep.fatigue > 0) {
    return false;
  }

  actionResult = creep.moveByPath(path);

  switch (actionResult) {
    case 0: { // OK
      return false;
    }
    case -1: { // ERR_NOT_OWNER
      console.error(creep.name + ' was supposed to move by path, error code -1 (not owned)');
      return false;
    }
    case -4: { // ERR_BUSY
      return false;
    }
    case -5: { // ERR_NOT_FOUND, The specified path doesn't match the creep's location.
      console.log(`${creep.name} path does not exist ${path}`)
      //if (creep.ticksToLive != undefined && creep.ticksToLive < 1400) { creep.suicide(); }
      creep.moveTo(path[Math.min(5, path.length-1)].x, path[Math.min(5, path.length-1)].y, {maxOps: 20});
      return false;
    }
    case -10: { // ERR_INVALID_ARGS
      return false;
    }
    case -11: { // ERR_TIRED
      console.error(creep.name + ' was supposed to move by path, error code -11 (tired)');
      return false;
    }
    case -12: { // ERR_NO_BODYPART
      return false;
    }
    default: {
      return false;
    }
  }
}

let constructionSite: ConstructionSite | null = null;
let mission: MissionMemory;

const isBuildingThisTick = (creep: Creep): boolean => {
  mission = Memory.missions[creep.memory.missionId];
  if (!mission) { return false; }
  if (mission.constructionSiteIds == undefined) { return false; }


  for (let i = mission.constructionSiteIds.length -1; i >= 0; i--) {
    constructionSite = Game.getObjectById(mission.constructionSiteIds[i]);
    if (constructionSite && constructionSite.progressTotal) {
      creep.build(constructionSite);
      return true;
    }
    mission.constructionSiteIds.splice(i, 1);
  }
  return false;
}

const isRepairingThisTick = (creep: Creep): boolean => {
  mission = Memory.missions[creep.memory.missionId];
  if (!mission) { return false; }
  if (!mission.containerId) { return false; }

  let container: Structure | null = Game.getObjectById(mission.containerId);
  if (!container || container.structureType != STRUCTURE_CONTAINER) { return false; }

  if (container.hits <= container.hitsMax * 0.9) { creep.repair(container); return true; }

  return false;
}

export { harvestSource, deposit, hasReachedFinalPathPosition, isBuildingThisTick, isRepairingThisTick }
