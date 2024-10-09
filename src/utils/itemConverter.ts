
const pathStepToRoomPosition = (room: Room, pathStep: PathStep): RoomPosition => {
  return new RoomPosition(pathStep.x, pathStep.y, room.name);
}

export { pathStepToRoomPosition }
