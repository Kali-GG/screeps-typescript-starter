import { ErrorMapper } from "utils/ErrorMapper";

import {processCreeps} from "./screeps/creeps";
import {processSpawns} from "./structures/spawn/spawn";
import {processMissions} from "./missions/missions";
import {processRooms} from "./rooms/rooms";
import {ensureSystemIntegrity} from "./utils/ensureSystemIntegrity";
import {processFlags} from "./flags/flags";

ensureSystemIntegrity();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  processRooms();
  processMissions();
  processCreeps();
  processSpawns();
  processFlags();

  console.log(`Tick ${Game.time} - CPU Usage: ${Game.cpu.getUsed()}`);

});
