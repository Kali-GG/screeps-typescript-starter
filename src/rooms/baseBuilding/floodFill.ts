
/**
 * Use flood fill to get path costs for all the connected tiles from start positions
 * @param {string} roomName - roomName to do flood fill
 * @param {[RoomPosition]} startPositions - positions to start with
 * @param {Object} options
 * @param {CostMatrix} options.costMatrix - costMatrix for the room
 * @param {number} options.costThreshold - threshold to block the tile. default is 255
 * @param {boolean} options.visual - if true, visualize the result with RoomVisual
 * @returns {CostMatrix} cost matrix that shows the path cost for each tile.
 *
 * https://sy-harabi.github.io/Automating-base-planning-in-screeps/
 * https://github.com/sy-harabi/screeps-algorithgm-utils/blob/33a0a406d86ed0a916d540340b3d07e3f5992065/utils.js#L115
 */

const floodFill = (room: Room, startPositions: RoomPosition[], options: {} = {}): CostMatrix => {
  const ADJACENT_VECTORS = [
    { x: 0, y: -1 }, // TOP
    { x: 1, y: -1 }, // TOP_RIGHT
    { x: 1, y: 0 }, // RIGHT
    { x: 1, y: 1 }, // BOTTOM_RIGHT
    { x: 0, y: 1 }, // BOTTOM
    { x: -1, y: 1 }, // BOTTOM_LEFT
    { x: -1, y: 0 }, // LEFT
    { x: -1, y: -1 }, // TOP_LEFT
  ];

  const defaultOptions = {
    costThreshold: 255,
    costMatrix: new PathFinder.CostMatrix()
  };
  const mergedOptions = { ...defaultOptions, ...options };
  let { costMatrix, costThreshold } = mergedOptions;

  const queue: RoomPosition[] = [];

  const result = [];

  const terrain = Game.map.getRoomTerrain(room.name);

  const check = new PathFinder.CostMatrix();

  for (const pos of startPositions) {
    queue.push(pos);
    costMatrix.set(pos.x, pos.y, 0);
    check.set(pos.x, pos.y, 1);
  }

  while (queue.length) {
    const current: any = queue.shift();
    const currentLevel = costMatrix.get(current.x, current.y);

    for (const vector of ADJACENT_VECTORS) {
      const x = current.x + vector.x;
      const y = current.y + vector.y;
      if (x < 0 || x > 49 || y < 0 || y > 49) {
        continue;
      }

      if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
        continue;
      }

      if (costMatrix.get(x, y) >= costThreshold) {
        continue;
      }

      if (check.get(x, y) > 0) {
        continue;
      }

      costMatrix.set(x, y, currentLevel + 1);

      check.set(x, y, 1);

      //queue.push({ x, y });

      const pos = new RoomPosition(x, y, room.name);
      queue.push(pos);
      result.push(pos);
    }
  }

  return costMatrix;
}

const visualizeFloodFill = (room: Room, costs: CostMatrix) => {
  const roomVisual = new RoomVisual(room.name);
  const terrain = new Room.Terrain(room.name);

  for (let x = 49; x >= 0; x--) {
    for (let y = 49; y >= 0; y--) {
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
        continue;
      }
      const cost = costs.get(x, y);

      if (cost === 0) {
        continue;
      }

      roomVisual.text( `${cost}`, x, y);
    }
  }
}

export { floodFill, visualizeFloodFill};
