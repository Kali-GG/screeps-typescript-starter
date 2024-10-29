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
import {distanceTransform} from "./distanceTransform";
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

interface StructurePos {
  x: number,
  y: number,
  structure: string
}

const BASE_LAYOUT: StructurePos[] = [

  /**
   * Spawn
   */
  {x: 0, y: -2, structure: STRUCTURE_SPAWN},
  {x: 0, y: 2, structure: STRUCTURE_SPAWN},
  {x: 2, y: 0, structure: STRUCTURE_SPAWN},

  /**
   *  Storage
   */
  {x: -2, y: 0, structure: STRUCTURE_STORAGE},

  /**
   * Terminal
   */
  {x: -1, y: -1, structure: STRUCTURE_TERMINAL},

  /**
   * Link
   */
  {x: -1, y: 0, structure: STRUCTURE_LINK},

  /**
   * Observer
   */
  {x: 0, y: 0, structure: STRUCTURE_OBSERVER},

  /**
   * Extension
   */
  {x: -6, y: -1, structure: STRUCTURE_EXTENSION},
  {x: -6, y: 0, structure: STRUCTURE_EXTENSION},
  {x: -6, y: 1, structure: STRUCTURE_EXTENSION},
  {x: -6, y: 2, structure: STRUCTURE_EXTENSION},
  {x: -5, y: -1, structure: STRUCTURE_EXTENSION},

  /**
   * roads
   */
  {x: -6, y: -2, structure: STRUCTURE_ROAD},
  {x: -6, y: -1, structure: STRUCTURE_ROAD},
  {x: -6, y: 0, structure: STRUCTURE_ROAD},
  {x: -6, y: 1, structure: STRUCTURE_ROAD},
  {x: -6, y: 2, structure: STRUCTURE_ROAD},
  {x: -5, y: -3, structure: STRUCTURE_ROAD},
  {x: -5, y: -2, structure: STRUCTURE_ROAD},
  {x: -5, y: 3, structure: STRUCTURE_ROAD},
  {x: -4, y: -4, structure: STRUCTURE_ROAD},
  {x: -4, y: -1, structure: STRUCTURE_ROAD},
  {x: -4, y: 4, structure: STRUCTURE_ROAD},
  {x: -3, y: -5, structure: STRUCTURE_ROAD},
  {x: -3, y: 0, structure: STRUCTURE_ROAD},
  {x: -3, y: 5, structure: STRUCTURE_ROAD},
  {x: -2, y: -6, structure: STRUCTURE_ROAD},
  {x: -2, y: -1, structure: STRUCTURE_ROAD},
  {x: -2, y: 1, structure: STRUCTURE_ROAD},
  {x: -2, y: 5, structure: STRUCTURE_ROAD},
  {x: -2, y: 6, structure: STRUCTURE_ROAD},
  {x: -1, y: -6, structure: STRUCTURE_ROAD},
  {x: -1, y: -2, structure: STRUCTURE_ROAD},
  {x: -1, y: 2, structure: STRUCTURE_ROAD},
  {x: -1, y: 4, structure: STRUCTURE_ROAD},
  {x: -1, y: 6, structure: STRUCTURE_ROAD},
  {x: 0, y: -6, structure: STRUCTURE_ROAD},
  {x: 0, y: -3, structure: STRUCTURE_ROAD},
  {x: 0, y: 3, structure: STRUCTURE_ROAD},
  {x: 0, y: 6, structure: STRUCTURE_ROAD},
  {x: 1, y: -6, structure: STRUCTURE_ROAD},
  {x: 1, y: -4, structure: STRUCTURE_ROAD},
  {x: 1, y: -2, structure: STRUCTURE_ROAD},
  {x: 1, y: 2, structure: STRUCTURE_ROAD},
  {x: 1, y: 6, structure: STRUCTURE_ROAD},
  {x: 2, y: -6, structure: STRUCTURE_ROAD},
  {x: 2, y: -5, structure: STRUCTURE_ROAD},
  {x: 2, y: -1, structure: STRUCTURE_ROAD},
  {x: 2, y: 1, structure: STRUCTURE_ROAD},
  {x: 2, y: 6, structure: STRUCTURE_ROAD},
  {x: 3, y: -5, structure: STRUCTURE_ROAD},
  {x: 3, y: 0, structure: STRUCTURE_ROAD},
  {x: 3, y: 5, structure: STRUCTURE_ROAD},
  {x: 4, y: -4, structure: STRUCTURE_ROAD},
  {x: 4, y: 1, structure: STRUCTURE_ROAD},
  {x: 4, y: 4, structure: STRUCTURE_ROAD},
  {x: 5, y: -3, structure: STRUCTURE_ROAD},
  {x: 5, y: 2, structure: STRUCTURE_ROAD},
  {x: 5, y: 3, structure: STRUCTURE_ROAD},
  {x: 6, y: -2, structure: STRUCTURE_ROAD},
  {x: 6, y: -1, structure: STRUCTURE_ROAD},
  {x: 6, y: 0, structure: STRUCTURE_ROAD},
  {x: 6, y: 1, structure: STRUCTURE_ROAD},
  {x: 6, y: 2, structure: STRUCTURE_ROAD},
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

    /**
     *  Reserve Slots around Economy Centers (Upgrader, Sources)
     *  Todo: Add Minerals
     */
    this.reservedControllerPositions = this.getReservedTiles(3, this.controllerPos, this.costMatrix);
    room.find(FIND_SOURCES).forEach( (source, index) => {
      this.reservedSourcePositions.push(this.getReservedTiles(1, source.pos, this.costMatrix));
    });

    /**
     *  Find & set best RoomPosition for the BaseCenter
     *  Update CostMatrix to enhance pathFinding result
     */

    if (!this.setBaseCenter()) { return false; }
    this.updateCostMatrix(BASE_LAYOUT, true);




    // todo: find paths to controller, sources & mineral, reSupplyPaths
    // todo: save everything

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

  saveToMemory() {
    /**
     * data to save on Room:
     *  BaseCenter
     *  UpgraderSpot, UpgraderLinkSpot, PathFromSpawn
     *  []: MiningSpot, MiningLinkSpot, PathFromSpawn, SourceId
     *  MineralMiningSpot, PathFromSpawn, MineralId ? ExtractorId?
     *  Defense ?
     */
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
          roomVisual.rect(this.baseCenter.x + spot.x - 0.5, this.baseCenter.y + spot.y - 0.5, 1, 1, {
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

  updateCostMatrix (structureArr: StructurePos[], relativeToBaseCenter: boolean = false) {
    structureArr.forEach(pos => {
      if (pos.structure == STRUCTURE_CONTAINER) { return; }
      this.costMatrix.set(
        pos.x + (relativeToBaseCenter ? this.baseCenter.x : 0),
        pos.y + (relativeToBaseCenter ? this.baseCenter.y : 0),
        pos.structure == STRUCTURE_ROAD ? 1 : 255);
    });
  }
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

export {BunkerBaseLayout}
