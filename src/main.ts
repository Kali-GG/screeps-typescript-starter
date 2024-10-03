import { ErrorMapper } from "utils/ErrorMapper";

import {processCreeps} from "./screeps/creeps";
import {processSpawns} from "./structures/spawn/spawn";
import {initMemory} from "./utils/initMemory";
import {processMissions} from "./missions/missions";

initMemory();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time} FLO1`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  processMissions();
  processCreeps();
  processSpawns();
});
