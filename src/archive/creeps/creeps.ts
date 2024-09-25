import {missions} from "../missions/missions";
import {miner} from "./miner";

const roles = [
  miner
];

const processCreeps = () => {
  for (let i in Game.creeps) {
    let mission = missions.get(Game.creeps[i].memory.missionId);
    if (!mission?.creepType) { return; }

    roles[mission.creepType](Game.creeps[i], mission);
  }
}
