
import {visualizeBaseBuilding} from "../rooms/visualizeBaseBuilding";
import {distanceTransform, visualizeDistanceTransform} from "../rooms/baseBuilding/distanceTransform";
import {floodFill, visualizeFloodFill} from "../rooms/baseBuilding/floodFill";
import {BunkerBaseLayout} from "../rooms/baseBuilding/bunker";
import {OrganicBaseLayout} from "../rooms/baseBuilding/organic";

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
      case 'floodFill': {
        let room = Game.flags[i].room;
        if (!room) { return; }
        visualizeFloodFill(room, floodFill(room, [Game.flags[i].pos]));
        break;
      }
      case 'baseTest': {
        if (Game.cpu.bucket < 9000) { return; }
        let room = Game.flags[i].room;
        if (!room) { return; }
        let baseLayout = new BunkerBaseLayout(room);
        baseLayout.visualize();
        break;
      }
      case 'organicBaseTest': {
        if (Game.cpu.bucket < 9000) { return; }
        let room = Game.flags[i].room;
        if (!room) { return; }
        let baseLayout = new OrganicBaseLayout(room);
        baseLayout.visualize();
        break;
      }
      default: {
        if (Game.flags[i].color == COLOR_PURPLE) { return; } // those are used to give instructions for roomLayout
        console.log(`Removed flag ${i} in room ${Game.flags[i].pos.roomName}`);
        Game.flags[i].remove();
      }
    }
  }
}

export { processFlags }
