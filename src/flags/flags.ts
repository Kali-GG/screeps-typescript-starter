
import {visualizeBaseBuilding} from "../rooms/visualizeBaseBuilding";

const processFlags = () => {
  for (let i in Game.flags) {
    switch (i) {
      case 'showVisuals': {
        let room = Game.flags[i].room;
        if(room == undefined) {
          Game.flags[i].remove();
          return;
        }
        visualizeBaseBuilding(room);
        break;
      }
      case 'initMissions': {
        let room = Game.flags[i].room;
        if(room == undefined || room.memory == undefined) {
          Game.flags[i].remove();
          return;
        }
        room.memory.tickTillSpawnMissions = 1;
        Game.flags[i].remove();
        break;
      }
      default: {
        console.log(`Removed flag ${i} in room ${Game.flags[i].pos.roomName}`);
        Game.flags[i].remove();
      }
    }
  }
}

export { processFlags }
