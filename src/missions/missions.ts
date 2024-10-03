import {getName, harvestMissionSanityCheck, initRoomBasics} from "./roomBasics";

const processMissions = () => {

  // todo: I do not want to run missions every tick. perhaps some kind of plausibility / cleanup check every x ticks

  // ensure that we have RoomBasics mission active for all rooms
  for (let i in Game.rooms) {
    if (!Game.rooms[i].controller || !Game.rooms[i].controller?.my) { continue; }
    if (!Memory.missions[getName(Game.rooms[i])]) { initRoomBasics(Game.rooms[i], 10); }
  }

  for (let i in Memory.missions) {
    if (Memory.missions[i].ticksTillNextCheck) {
      // @ts-ignore
      Memory.missions[i].ticksTillNextCheck --;
      // @ts-ignore
      if (Memory.missions[i].ticksTillNextCheck <= 0) {
        switch (Memory.missions[i].type) {
          case 'harvest': {
            harvestMissionSanityCheck(Memory.missions[i].id);
            break;
          }
          default: {

          }
        }
      }
    }
  }

}

const missionCache = (missionId: string): MissionCache => {
  if(!global.missionCache[missionId]) { global.missionCache[missionId] = initMissionCache(missionId) }
  return global.missionCache[missionId];
}

const initMissionCache = (missionId: string): MissionCache => {

  let missionCache = {id: missionId};

  return missionCache;
}

export { processMissions, missionCache }
