
import {miner} from "./miner";
// @ts-ignore
import {allrounder} from "./allrounder";
import {upgrader} from "./upgrader";
import {upgraderHauler} from "./upgraderHauler";

const processCreeps = () => {

  for (const i in Game.creeps) {
    if (Game.creeps[i].spawning) { continue; }
    switch (Game.creeps[i].memory.role) {
      case 0: {
          miner(Game.creeps[i]);
          break;
      }
      case 1: {
        allrounder(Game.creeps[i]);
        break;
      }
      case 2: {
        upgrader(Game.creeps[i]);
        break;
      }
      case 3: {
        upgraderHauler(Game.creeps[i]);
        break;
      }
      default: {
        console.log('processing creep without matching role')
      }
    }
  }
}

export { processCreeps }
