////////////////////
// quick & dirty
// terribly inefficient
// but does the trick for now
// probably best to get rid of it completely
////////////////////


const allrounder = (creep) => {
  var task = creep.memory.task;
  var target = Game.getObjectById(creep.memory.target);

  if (task == undefined || !target){
    if(creep.store.getUsedCapacity() == 0) {
      let droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: function(object) {
          return object.resourceType == RESOURCE_ENERGY && object.amount >= creep.store.getCapacity();
        }
      });

      if (droppedEnergy) {
        //console.log(`allrounder found energy ${droppedEnergy} | ${droppedEnergy.id}`)
        target = droppedEnergy;
        task = 'pickUp';
      }
      else {
        target = Game.getObjectById(Memory.missions[creep.memory.missionId].sourceId);
        if (!target) { target = creep.pos.findClosestByPath(FIND_SOURCES);}
        task = 'mining';
      }
    }
    else {
      target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (structure) => {return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_SPAWN) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}});
      if (target){
        // found empty storage -- deliver energy
        task = 'transporting';
      }
      else {
        target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (target){
          // found construction site - gonna build something
          task = 'building';
        }
        else {
          target = creep.room.controller;
          task = 'upgrading';
        }
      }
    }
  }

  if (task == 'pickUp'){
    if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
    if(creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
      target = undefined;
      task = undefined;
    }
  }

  if (task == 'mining'){
    if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
    if(creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
      target = undefined;
      task = undefined;
    }
  }

  if (task == 'transporting'){
    if (target.energyCapacity - target.energy < creep.carry.energy) {
      var energy2deliver = target.energyCapacity - target.energy;
    }
    else {
      var energy2deliver = creep.carry.energy;
    }

    if(creep.transfer(target, RESOURCE_ENERGY, energy2deliver) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
    else {
      target = undefined;
      task = undefined;
    }
  }

  if (task == 'building'){
    if (creep.build(target) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }
    if (creep.carry.energy == 0) {
      task = undefined;
      target = undefined;
    }
  }

  if (task == 'upgrading'){
    if (creep.pos.getRangeTo(target) > 2) { // we move closer than necessary to avoid blocking the supply lines
      creep.moveTo(target);
    }
    else {
      creep.upgradeController(target);
    }
    if (creep.carry.energy == 0) {
      task = undefined;
      target = undefined;
    }
  }

  creep.memory.task = task;
  creep.memory.target = target ? target.id : undefined;
}

export { allrounder }
