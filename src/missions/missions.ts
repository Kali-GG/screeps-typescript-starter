import {initRoomBasics} from "./roomBasics";
import {initAllrounder} from "./roomAllrounder";


const processMissions = () => {
  // ensure that we have RoomBasics mission active for all rooms
  for (let i in Game.rooms) {
    if (!Game.rooms[i]._my()) { continue; }
    if (Game.rooms[i].memory.tickTillSpawnMissions-- > 0) {  continue; }

    initAllrounder(Game.rooms[i]);
    initRoomBasics(Game.rooms[i]);

    Game.rooms[i].memory.tickTillSpawnMissions = 5000;
  }
}



export { processMissions }
