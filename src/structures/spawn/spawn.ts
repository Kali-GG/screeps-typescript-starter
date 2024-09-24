let spawnResult = 0;

const tick = (spawn: StructureSpawn) => {
  if (spawn.spawning != null) { return; }
  if (spawn.memory.queue.length == 0) { return; }

  spawnResult = spawn.spawnCreep(
    spawn.memory.queue[0].body,
    spawn.memory.queue[0].name,
    spawn.memory.queue[0].opts
  );

  switch (spawnResult) {
    case 0: {
      spawn.memory.queue.splice(0,1);
      return;
    }
    case -1: {
      //todo
      return;
    }
    case -3: {
      //todo
      return;
    }
    case -4: {
      //todo
      return;
    }
    case -6: {
      //todo
      return;
    }
    case -10: {
      //todo
      return;
    }
    case -14: {
      //todo
      return;
    }
    default: {
      console.log('Error while spawning ' + spawn.memory.queue[0] + ' on spawn ' + spawn.id + ': (default case in switch statement reached. This should never happen)');
      return;
    }
  }
}

const addToSpawnQueue = (spawn: StructureSpawn, item: SpawnQueue) => {
  spawn.memory.queue.push(item);
}

const removeFromSpawnQueue = () => {

}

export { tick, addToSpawnQueue, removeFromSpawnQueue }
