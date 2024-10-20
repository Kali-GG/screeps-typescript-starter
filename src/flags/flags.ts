
import {visualizeBaseBuilding} from "../rooms/visualizeBaseBuilding";
import {distanceTransform, visualizeDistanceTransform} from "../rooms/baseBuilding/distanceTransform";
import {floodFill, visualizeFloodFill} from "../rooms/baseBuilding/floodFill";
import {visualizeRoomLayout} from "../rooms/baseBuilding/bunker";

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
      case 'distanceTransform': {
        let room = Game.flags[i].room;
        if (!room) { return; }
        visualizeDistanceTransform(room, distanceTransform(room));
        break;
      }
      case 'floodFill': {
        let room = Game.flags[i].room;
        if (!room) { return; }
        visualizeFloodFill(room, floodFill(room, [Game.flags[i].pos]));
        break;
      }
      case 'baseTest': {
        let room = Game.flags[i].room;
        if (!room) { return; }
        visualizeRoomLayout(room);
        break;
      }
      default: {
        console.log(`Removed flag ${i} in room ${Game.flags[i].pos.roomName}`);
        //Game.flags[i].remove();
      }
    }
  }
}

export { processFlags }
