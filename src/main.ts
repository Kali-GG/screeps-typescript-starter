import { ErrorMapper } from "utils/ErrorMapper";

import {processCreeps} from "./screeps/creeps";
import {processSpawns} from "./structures/spawn/spawn";
import {processMissions} from "./missions/missions";
import {processRooms} from "./rooms/rooms";
import {ensureSystemIntegrity} from "./utils/ensureSystemIntegrity";

ensureSystemIntegrity();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  processRooms();
  processMissions();
  processCreeps();
  processSpawns();

  console.log(`Tick ${Game.time} - CPU Usage: ${Game.cpu.getUsed()}`);


});
