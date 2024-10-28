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

import {getCostMatrix} from "./getCostMatrix";
import {distanceTransform, visualizeDistanceTransform} from "./distanceTransform";
import {floodFill} from "./floodFill";

/**
 * getCostMatrix()
 * iterate through flags & set costMatrix
 * distanceTransform
 * Iterate through resulting costMatrix to push positions into potentialBaseCenters[]
 * floodFill From: UpgradeLocation, To: potentialBaseCenters[]
 * select closest base
 * place virtual structures
 * calc paths to upgradePos, miningPositions
 * defense ??
 */

interface BaseLayoutPos {
  xDelta: number,
  yDelta: number,
  structure: string
}

const BASE_LAYOUT: BaseLayoutPos[] = [

  {xDelta: 0, yDelta: 0, structure: STRUCTURE_OBSERVER},
  /**
   * roads
   */
  {xDelta: -6, yDelta: -2, structure: STRUCTURE_ROAD},
  {xDelta: -6, yDelta: -1, structure: STRUCTURE_ROAD},
  {xDelta: -6, yDelta: 0, structure: STRUCTURE_ROAD},
  {xDelta: -6, yDelta: 1, structure: STRUCTURE_ROAD},
  {xDelta: -6, yDelta: 2, structure: STRUCTURE_ROAD},
  {xDelta: -5, yDelta: -3, structure: STRUCTURE_ROAD},
  {xDelta: -5, yDelta: -2, structure: STRUCTURE_ROAD},
  {xDelta: -5, yDelta: 3, structure: STRUCTURE_ROAD},
  {xDelta: -4, yDelta: -4, structure: STRUCTURE_ROAD},
  {xDelta: -4, yDelta: -1, structure: STRUCTURE_ROAD},
  {xDelta: -4, yDelta: 4, structure: STRUCTURE_ROAD},
  {xDelta: -3, yDelta: -5, structure: STRUCTURE_ROAD},
  {xDelta: -3, yDelta: 0, structure: STRUCTURE_ROAD},
  {xDelta: -3, yDelta: 5, structure: STRUCTURE_ROAD},
  {xDelta: -2, yDelta: -6, structure: STRUCTURE_ROAD},
  {xDelta: -2, yDelta: -1, structure: STRUCTURE_ROAD},
  {xDelta: -2, yDelta: 1, structure: STRUCTURE_ROAD},
  {xDelta: -2, yDelta: 5, structure: STRUCTURE_ROAD},
  {xDelta: -2, yDelta: 6, structure: STRUCTURE_ROAD},
  {xDelta: -1, yDelta: -6, structure: STRUCTURE_ROAD},
  {xDelta: -1, yDelta: -2, structure: STRUCTURE_ROAD},
  {xDelta: -1, yDelta: 2, structure: STRUCTURE_ROAD},
  {xDelta: -1, yDelta: 4, structure: STRUCTURE_ROAD},
  {xDelta: -1, yDelta: 6, structure: STRUCTURE_ROAD},
  {xDelta: 0, yDelta: -6, structure: STRUCTURE_ROAD},
  {xDelta: 0, yDelta: -3, structure: STRUCTURE_ROAD},
  {xDelta: 0, yDelta: 3, structure: STRUCTURE_ROAD},
  {xDelta: 0, yDelta: 6, structure: STRUCTURE_ROAD},
  {xDelta: 1, yDelta: -6, structure: STRUCTURE_ROAD},
  {xDelta: 1, yDelta: -4, structure: STRUCTURE_ROAD},
  {xDelta: 1, yDelta: -2, structure: STRUCTURE_ROAD},
  {xDelta: 1, yDelta: 2, structure: STRUCTURE_ROAD},
  {xDelta: 1, yDelta: 6, structure: STRUCTURE_ROAD},
  {xDelta: 2, yDelta: -6, structure: STRUCTURE_ROAD},
  {xDelta: 2, yDelta: -5, structure: STRUCTURE_ROAD},
  {xDelta: 2, yDelta: -1, structure: STRUCTURE_ROAD},
  {xDelta: 2, yDelta: 1, structure: STRUCTURE_ROAD},
  {xDelta: 2, yDelta: 6, structure: STRUCTURE_ROAD},
  {xDelta: 3, yDelta: -5, structure: STRUCTURE_ROAD},
  {xDelta: 3, yDelta: 0, structure: STRUCTURE_ROAD},
  {xDelta: 3, yDelta: 5, structure: STRUCTURE_ROAD},
  {xDelta: 4, yDelta: -4, structure: STRUCTURE_ROAD},
  {xDelta: 4, yDelta: 1, structure: STRUCTURE_ROAD},
  {xDelta: 4, yDelta: 4, structure: STRUCTURE_ROAD},
  {xDelta: 5, yDelta: -3, structure: STRUCTURE_ROAD},
  {xDelta: 5, yDelta: 2, structure: STRUCTURE_ROAD},
  {xDelta: 5, yDelta: 3, structure: STRUCTURE_ROAD},
  {xDelta: 6, yDelta: -2, structure: STRUCTURE_ROAD},
  {xDelta: 6, yDelta: -1, structure: STRUCTURE_ROAD},
  {xDelta: 6, yDelta: 0, structure: STRUCTURE_ROAD},
  {xDelta: 6, yDelta: 1, structure: STRUCTURE_ROAD},
  {xDelta: 6, yDelta: 2, structure: STRUCTURE_ROAD},
]; //todo: complete list

class BunkerBaseLayout {
  room: Room;
  controllerPos: RoomPosition;
  costMatrix: CostMatrix;
  reservedControllerPositions: RoomPosition[];
  reservedSourcePositions: RoomPosition[][];
  baseCenter: RoomPosition;

  complete: boolean;

  constructor (room: Room, loadFromMemory: boolean = false) {
    this.complete = false;
    this.room = room;
    this.controllerPos = this.baseCenter = room.controller ? room.controller.pos : new RoomPosition(25,25,room.name);
    this.costMatrix  = new PathFinder.CostMatrix;
    this.reservedControllerPositions = [];
    this.reservedSourcePositions = [];

    this.complete = loadFromMemory ? this.loadFromMemory() : this.new(room);
  }

  new(room: Room): boolean {
    this.costMatrix = getCostMatrix(room, false);
    this.reservedControllerPositions = this.getReservedTiles(3, this.controllerPos, this.costMatrix);
    room.find(FIND_SOURCES).forEach( (source, index) => {
      this.reservedSourcePositions.push(this.getReservedTiles(1, source.pos, this.costMatrix));
    });

    if (!this.setBaseCenter()) { return false; }

    return true;
  }

  addReservedPositionArrToCostMatrix(costMatrix: CostMatrix, positions: RoomPosition[]): CostMatrix {
    positions.forEach( pos => {
      costMatrix.set(pos.x, pos.y, 0);
    });
    return costMatrix;
  }

  setBaseCenter(): boolean {

    let reverseCostMatrix = getCostMatrix(this.room, true);
    reverseCostMatrix = this.addReservedPositionArrToCostMatrix(reverseCostMatrix, this.reservedControllerPositions);
    this.reservedSourcePositions.forEach( arr => { reverseCostMatrix = this.addReservedPositionArrToCostMatrix(reverseCostMatrix, arr); });

    let distanceTransformCostMatrix = distanceTransform(this.room, reverseCostMatrix);
    let potentialBaseCenters = getPotentialBaseCentersFromCostMatrix(distanceTransformCostMatrix, 6, this.room);
    if (potentialBaseCenters.length == 0) { return false; } // error: no suitable base found
    let floodFilledCostMatrix = floodFill(this.room, getRoomPositionArrOfPotentialUpgradingSpots(this.room, this.costMatrix));

    this.baseCenter = selectBaseCenter(potentialBaseCenters, floodFilledCostMatrix);
    return true;
  }

  loadFromMemory() {
    //todo: implement
    return false;
  }

  visualize() {
    const roomVisual = new RoomVisual(this.room.name);
    roomVisual.rect(this.baseCenter.x - 0.5, this.baseCenter.y - 0.5, 1, 1, {
      fill: 'purple',
      opacity: 0.4,
    });

    BASE_LAYOUT.forEach( spot => {
      switch (spot.structure) {
        case (STRUCTURE_ROAD): {
          if (this.baseCenter == undefined) { return; }
          roomVisual.rect(this.baseCenter.x + spot.xDelta - 0.5, this.baseCenter.y + spot.yDelta - 0.5, 1, 1, {
            fill: 'green',
            opacity: 0.4,
          });
          break;
        }
        default: {

        }
      }
    });
  }

  getReservedTiles (range: number = 3, pos: RoomPosition, costMatrix: CostMatrix): RoomPosition[] {
    let arr: RoomPosition[] = [];

    for (let xDelta = - range; xDelta <= range; xDelta++) {
      for (let yDelta = - range; yDelta <= range; yDelta++) {
        if (costMatrix.get(pos.x + xDelta, pos.y + yDelta) < 255) { arr.push(new RoomPosition(pos.x + xDelta, pos.y + yDelta, pos.roomName)); }
      }
    }

    return arr;
  }
}

//todo: once this works: rewrite the whole thing as a class
const getRoomLayout = (room: Room) => {
  if (!room.controller) { return; } // error: cannot build base in room without controller

  let basicCostMatrix = getCostMatrix(room, false);
  let reverseCostMatrix = getCostMatrix(room, true);

  let manualInstructionArr = findRelevantFlagsForRoomLayout(room);
  reverseCostMatrix = incorporateManualInstructionsInCostMatrix( reverseCostMatrix, manualInstructionArr);
  reverseCostMatrix = reserveCriticalEconomyAreas(room, reverseCostMatrix);
  let distanceTransformCostMatrix = distanceTransform(room, reverseCostMatrix);

  //visualizeDistanceTransform(room, distanceTransformCostMatrix);

  let potentialBaseCenters = getPotentialBaseCentersFromCostMatrix(distanceTransformCostMatrix, 6, room);
  if (potentialBaseCenters.length == 0) { return; } // error: no suitable base found
  let floodFilledCostMatrix = floodFill(room, getRoomPositionArrOfPotentialUpgradingSpots(room, basicCostMatrix));

  let baseCenter = selectBaseCenter(potentialBaseCenters, floodFilledCostMatrix);

  let costMatrix = setBaseLayout(baseCenter, getCostMatrix(room, false));

  // todo: find spawn locations
  // todo: find paths to controller, sources & mineral, reSupplyPaths
  // todo: save everything

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

const reserveCriticalEconomyAreas = (room: Room, costMatrix: CostMatrix, controllerRadius: number = 2, sourceRadius: number = 1, mineralRadius: number = 1): CostMatrix => {
  if (!room.controller) { return costMatrix; }

  costMatrix = reserveTiles(costMatrix, room.controller.pos, controllerRadius);

  room.find(FIND_SOURCES).forEach(source => {
    costMatrix = reserveTiles(costMatrix, source.pos, sourceRadius);
  });

  room.find(FIND_MINERALS).forEach(source => {
    costMatrix = reserveTiles(costMatrix, source.pos, mineralRadius);
  });

  return costMatrix;
}

const reserveTiles = (costMatrix: CostMatrix ,pos: RoomPosition, radius: number): CostMatrix => {
  for (let xDelta = - radius; xDelta <= radius; xDelta++) {
    for (let yDelta = - radius; yDelta <= radius; yDelta++) {
      costMatrix.set(pos.x + xDelta, pos.y + yDelta, 0);
    }
  }
  return costMatrix;
}

const getRoomPositionArrOfPotentialUpgradingSpots = (room: Room, costMatrix: CostMatrix): RoomPosition[] => {
  let arr: RoomPosition[] = [];

  if (!room.controller) { return arr; }

  for (let xDelta = - 3; xDelta <= 3; xDelta++) {
    for (let yDelta = - 3; yDelta <= 3; yDelta++) {
      if (costMatrix.get(room.controller.pos.x + xDelta, room.controller.pos.y + yDelta) < 255) {
        arr.push(new RoomPosition(room.controller.pos.x + xDelta, room.controller.pos.y + yDelta, room.name)) ;
      }
    }
  }
  return arr;
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

const setBaseLayout = (baseCenter: RoomPosition, costMatrix: CostMatrix): CostMatrix => {
  BASE_LAYOUT.forEach(pos => {
    if (pos.structure == STRUCTURE_CONTAINER) { return; }
    costMatrix.set(
      baseCenter.x + pos.xDelta,
      baseCenter.y + pos.yDelta,
      pos.structure == STRUCTURE_ROAD ? 0 : 255);
  });
  return costMatrix;
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
  if (baseCenter == undefined) { return; }
  const roomVisual = new RoomVisual(room.name);
  roomVisual.rect(baseCenter.x - 0.5, baseCenter.y - 0.5, 1, 1, {
    fill: 'purple',
    opacity: 0.4,
  });

  BASE_LAYOUT.forEach( spot => {
    switch (spot.structure) {
      case (STRUCTURE_ROAD): {
        if (baseCenter == undefined) { return; }
        roomVisual.rect(baseCenter.x + spot.xDelta - 0.5, baseCenter.y + spot.yDelta - 0.5, 1, 1, {
          fill: 'green',
          opacity: 0.4,
        });
        break;
      }
      default: {

      }
    }
  });
}

export {visualizeRoomLayout, BunkerBaseLayout}
