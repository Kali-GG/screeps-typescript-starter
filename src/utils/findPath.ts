

const findPath = (room: Room, from: RoomPosition, to: RoomPosition, opts: FindPathOpts): PathStep[] => {
  opts.costCallback = function(roomName, costMatrix) {
    return getCostMatrix(room);
  };

  return room.findPath(from, to, opts );
}

const getCostMatrix = (room: Room):  CostMatrix => {

  if(global.costMatrixCache[room.name]) { return global.costMatrixCache[room.name]};

  let costs = new PathFinder.CostMatrix;

  room.find(FIND_STRUCTURES).forEach(function(struct) {
    if (struct.structureType !== STRUCTURE_CONTAINER &&
      (struct.structureType !== STRUCTURE_RAMPART ||
        !struct.my)) {
      // Can't walk through non-walkable buildings
      costs.set(struct.pos.x, struct.pos.y, 0xff);
    }
  });

  if (room.memory.avoidPositions) {
    room.memory.avoidPositions.forEach( position => {
      costs.set(position.x, position.y, 200);
    });
  }

  if (room._my()) { global.costMatrixCache[room.name] = costs; }

  return costs;
}

const updateCostMatrix = (roomName: string, pos: SimplePosition, cost: number) => {
  if(!global.costMatrixCache[roomName]) {return;}
}

export { updateCostMatrix, findPath }
