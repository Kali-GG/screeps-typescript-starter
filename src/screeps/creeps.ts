
import {miner} from "./miner";

const processCreeps = () => {

  for (const i in Game.creeps) {
    if (Game.creeps[i].spawning) { continue; }
    switch (Game.creeps[i].memory.role) {
      case 0: {
          miner(Game.creeps[i]);
          break;
      }
      default: {
        console.log('processing creep without matching role')
      }
    }
  }
}

export { processCreeps }
