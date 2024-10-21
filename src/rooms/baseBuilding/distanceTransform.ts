/**
 * get distance trasform of a room
 * @param {string} roomName
 * @param {Object} options
 * @param {[RoomPosition]} options.innerPositions - array of roomPositions or object with properties x, y
 * @param {boolean} options.visual - if true, visualize the result with RoomVisual
 * @returns {CostMatrix} costMatrix which tells you the distance
 *
 * copied from
 * https://sy-harabi.github.io/Automating-base-planning-in-screeps/
 * https://github.com/sy-harabi/screeps-utils/blob/33a0a406d86ed0a916d540340b3d07e3f5992065/utils.js#L10
 */
import {getCostMatrix} from "./getCostMatrix";


const distanceTransform = (room: Room, costMatrix: CostMatrix = getCostMatrix(room, true)): CostMatrix => {

  const BOTTOM_LEFT = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: 1 },
  ];

  const TOP_RIGHT = [
    { x: 1, y: 0 },
    { x: 0, y: +1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
  ];

  for (let x = 0; x <= 49; x++) {
    for (let y = 0; y <= 49; y++) {
      const nearDistances = BOTTOM_LEFT.map(
        (vector) => costMatrix.get(x + vector.x, y + vector.y) + 1 || 100
      );
      nearDistances.push(costMatrix.get(x, y));
      costMatrix.set(x, y, Math.min(...nearDistances));
    }
  }

  for (let x = 49; x >= 0; x--) {
    for (let y = 49; y >= 0; y--) {
      const nearDistances = TOP_RIGHT.map(
        (vector) => costMatrix.get(x + vector.x, y + vector.y) + 1 || 100
      );
      nearDistances.push(costMatrix.get(x, y));
      const distance = Math.min(...nearDistances);
      costMatrix.set(x, y, distance);
    }
  }

  return costMatrix;
}

const visualizeDistanceTransform = (room: Room, costs: CostMatrix) => {
  const roomVisual = new RoomVisual(room.name);
  const terrain = new Room.Terrain(room.name);

  let maxDistance = 10;

  for (let x = 49; x >= 0; x--) {
    for (let y = 49; y >= 0; y--) {
      if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
        continue;
      }
      const cost = costs.get(x, y);

      if (cost === 0) {
        continue;
      }

      const hue = 180 * (1 - cost / maxDistance);
      const color = `hsl(${hue},100%,60%)`;
      roomVisual.text( `${cost}`, x, y);
      roomVisual.rect(x - 0.5, y - 0.5, 1, 1, {
        fill: color,
        opacity: 0.4,
      });
    }
  }
}

export { distanceTransform, visualizeDistanceTransform };
