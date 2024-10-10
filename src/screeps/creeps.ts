
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
        console.log(`${Game.creeps[i].name} processing creep without matching role`)
      }
    }
  }
}

const getCostOfBodyPartArr = (arr: BodyPartConstant[]): number => {
  let cost = 0;
  arr.forEach( part => {
    cost += BODYPART_COST[part]
  });
  return cost;
}

export { processCreeps, getCostOfBodyPartArr }
