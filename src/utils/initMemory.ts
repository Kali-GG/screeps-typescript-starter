

const initMemory = () => {
  if (!Memory.missions) { Memory.missions = {}; }

  for (let i in Game.spawns) {
    if (!Game.spawns[i].memory.queue) { Game.spawns[i].memory.queue = []; }
  }
}

export { initMemory }
