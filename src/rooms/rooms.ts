import {defendRoom} from "./defend";

Room.prototype._my = function(): boolean {
  if (!this.controller) { return false; }
  if (!this.controller.my) { return false; }
  return true;
}

const processRooms = () => {
  for (let i in Game.rooms) {
    if (!Game.rooms[i].controller || !Game.rooms[i].controller?.my) { continue; }
    defendRoom(Game.rooms[i]);
  }
}

const pushPositionToAvoidPositionArr = (room: Room, pos: SimplePosition ): void => {
    if (!room._my()) { return; }
    let filterResult = _.filter(room.memory.avoidPositions, (item) => { return item.x == pos.x && item.y == item.y });
    if (filterResult.length == 0) {
      room.memory.avoidPositions.push(pos);
    }
}

const getAvoidPositionArrAsRoomPositions = (room: Room): RoomPosition[] => {
  let arr: RoomPosition[] = [];
  room.memory.avoidPositions.forEach( pos => {
    arr.push(new RoomPosition(pos.x, pos.y, room.name));
  });
  return arr;
}

export { processRooms, pushPositionToAvoidPositionArr, getAvoidPositionArrAsRoomPositions }
