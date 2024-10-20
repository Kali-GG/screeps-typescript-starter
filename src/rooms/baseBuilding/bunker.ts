/**
 * We are trying to find a suitable building spot for a bunker base
 * https://screepers.github.io/screeps-tools/?share=N4IgTgxgNiBcAcAaEAjArgSygEwwOwHMBnOUAUwA8AXMvIjAezzgG1QK4BGATmQE8u3AL6J2cAEwAGfhMkixsKTNg95IDos7LVo9bO3w1G8VpACVh3cfEGjE0+c4B2O4ptmuLqxIDM2rwriACzaAGyu4n4eKuHebmGunEjRUonJ5iaJvCmcacri4ln5hXFKKSUKPPk+EdIpNaUOvrX5QRFNim2l7hldgR3iAKztCaV1jgF6KtmOlpXpzXFVKX1TZRnD3fmxgVEbEXsSO2shKxGD+ZuBF2eloZcR97fX1Y+vd8URTu+B388nD1KNwyx2MpxB538b2izmhswiC0UclKiJ0v20wlKf3hpXBsgieM0CM+KPyuSxZKEAF1kGAGABDbCsQJPDLkl7lAk-NaHToRHqLfokwLjexFFLIjkZSUAmGYoUS-kYg62Jao+VrRGRLkwybGbESCpTZzKtWqyozTwtGGg+zaK7GrWrDTLfZjbZKlIO-WAwJOiKWxQNKVcb1HUbo3WQm3EmFzNaBtFrVlHaMZPWG-IZoNZnXpkYpbMmD1LA1IxJlzKl4XGyvBtYClRhnMw5vBe0B-Iy4yBquBXuFGkgKD0lDM5NduGCL6ToHm2U4kPTanIIgAB3pAHdmLA2GtgWLSryk8Zedqh0QqAwwPSCGRx8YBrkhzQwABbfD0mC7wKN1JDqB8AAawfTMchXEAGBQIgyDAAA3WDQJbNkIJvN8NzAKgkOLVtPUcNtjzbQlODbA8mynGIZyjUk407OU6OlBjD37Gse25Yx-QpL0KPEW1FDI8Qi0JQSVULPCJCLAYi1FRQ+NdCRmySVoK3YzxWLU8Dq0VLTHA1F1UXjF1E2khIqSEIQgA#/building-planner
 *
 * Step 0 scan for flags
 *  Color Coded for manual instructions. eg upgrading spot
 * Step 0.1
 *  Fill cost matrix with areas of interest (eg around mining spots & upgrader spots)
 * Step 1 distanceTransform, we are looking for spots with score 6 or higher
 * Step 2 floodFill, we are looking for the closest score 6+ tile to the controller
 *
 * Step 3 Analyse Sources
 * Step 4 Analyse Controller
 * Step 5 Analyse Mineral
 * Step 6 Defense
 */

import {getReverseCostMatrix} from "./getReverseCostMatrix";
import {distanceTransform, visualizeDistanceTransform} from "./distanceTransform";
import {floodFill} from "./floodFill";

/**
 * getCostMatrix()
 * iterate through flags & set costMatrix
 * distanceTransform
 * Iterate through resulting costmatrix to push positions into potentialBaseCenters[]
 * floodfill From: UpgradeLocation, To: potentialBaseCenters[]
 * select closest base
 * place virtual structures
 * calc paths to upgradePos, miningPositions
 * defense ??
 */

const getRoomLayout = (room: Room) => {
  if (!room.controller) { return; } // error: cannot build base in room without controller
  let manualInstructionArr = findRelevantFlagsForRoomLayout(room);
  let reverseCostMatrix = incorporateManualInstructionsInCostMatrix(getReverseCostMatrix(room), manualInstructionArr);
  let distanceTransformCostMatrix = distanceTransform(room, reverseCostMatrix);

  visualizeDistanceTransform(room, distanceTransformCostMatrix);
  let potentialBaseCenters = getPotentialBaseCentersFromCostMatrix(distanceTransformCostMatrix, 6, room);
  if (potentialBaseCenters.length == 0) { return; } // error: no suitable base found
  let floodFilledCostMatrix = floodFill(room, [room.controller.pos]);

  let baseCenter = selectBaseCenter(potentialBaseCenters, floodFilledCostMatrix);

  return baseCenter;
}

const findRelevantFlagsForRoomLayout = (room: Room): Flag[] => {
  let relevantFlagArr = [];
  for (let i in Game.flags) {
    if (Game.flags[i].color != COLOR_PURPLE) { continue; }
    if (Game.flags[i].room == undefined) { continue; }
    // @ts-ignore
    if (Game.flags[i].room.name == room.name) {
      relevantFlagArr.push(Game.flags[i]);
    }
  }
  return  relevantFlagArr;
}

const incorporateManualInstructionsInCostMatrix = (costMatrix: CostMatrix, instructions: Flag[]): CostMatrix => {
  instructions.forEach( flag => {
    if (flag.secondaryColor == COLOR_YELLOW) { costMatrix.set(flag.pos.x, flag.pos.y, 0); }
  });
  return costMatrix;
}

const getPotentialBaseCentersFromCostMatrix = (costMatrix: CostMatrix, baseSize: number, room: Room): RoomPosition[] => {
  let potentialBaseCenters: RoomPosition[] = [];

  for (let x = 0; x <= 49; x++) {
    for (let y = 0; y <= 49; y++) {
      if (costMatrix.get(x,y) >= baseSize) { potentialBaseCenters.push(new RoomPosition(x,y,room.name)); }
    }
  }

  return  potentialBaseCenters;
}

const selectBaseCenter = (potentialBaseCenters: RoomPosition[], floodFilledCostMatrix: CostMatrix): RoomPosition => {
  let closestPoint: RoomPosition = potentialBaseCenters[0];
  let closestDistance = floodFilledCostMatrix.get(closestPoint.x, closestPoint.y);

  potentialBaseCenters.forEach(point => {
    if (floodFilledCostMatrix.get(point.x, point.y) > closestDistance) { return; }
    closestDistance = floodFilledCostMatrix.get(point.x, point.y);
    closestPoint = point;
  });

  return closestPoint;
}

/**
 * data to save on Room:
 *  BaseCenter
 *  UpgraderSpot, UpgraderLinkSpot, PathFromSpawn
 *  []: MiningSpot, MiningLinkSpot, PathFromSpawn, SourceId
 *  MineralMiningSpot, PathFromSpawn, MineralId ? ExtractorId?
 *  Defense ?
 */

/**
 * Visualize Room Layout
 */

const visualizeRoomLayout = (room: Room) => {
  let baseCenter = getRoomLayout(room);
  if (!baseCenter) { return; }
  const roomVisual = new RoomVisual(room.name);
  roomVisual.rect(baseCenter.x - 0.5, baseCenter.y - 0.5, 1, 1, {
    fill: 'purple',
    opacity: 0.4,
  });
}

export {visualizeRoomLayout}
