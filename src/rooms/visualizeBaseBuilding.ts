
const visualizeBaseBuilding = (room: Room) => {
  if (!room.memory.avoidPositions) { return; }
  room.memory.avoidPositions.forEach( position => {
    room.visual.circle(position.x,position.y, {fill: 'transparent', radius: 0.55, stroke: 'red'})
  });
}

export {visualizeBaseBuilding};
