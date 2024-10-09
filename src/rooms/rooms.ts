import {defendRoom} from "./defend";
import {updateCostMatrix} from "../utils/findPath";

Room.prototype._my = function(): boolean {
  if (!this.controller) { return false; }
  if (!this.controller.my) { return false; }
  return true;
}

const processRooms = () => {
  for (let i in Game.rooms) {
    if (!Game.rooms[i]._my()) { continue; }
    defendRoom(Game.rooms[i]);
  }
}

const pushPositionToAvoidPositionArr = (room: Room, pos: SimplePosition ): void => {
    if (!room._my()) { return; }
    let filterResult = _.filter(room.memory.avoidPositions, (item) => {
      return item.x == pos.x && item.y == pos.y;
    });
    if (filterResult.length == 0) {
      room.memory.avoidPositions.push(pos);
      updateCostMatrix(room.name, pos, 200);
    }
}

const getAvoidPositionByType = (room: Room, type: string): RoomPosition | null => {
  if (!room.memory.avoidPositions) { return null; }
  let filterResult = _.filter(room.memory.avoidPositions, (item) => { return item.type == type });
  if (filterResult.length > 0) { return new RoomPosition(filterResult[0].x, filterResult[0].y, room.name); }
  return null;
}

export { processRooms, pushPositionToAvoidPositionArr, getAvoidPositionByType }
