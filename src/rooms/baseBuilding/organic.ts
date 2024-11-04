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
// @ts-ignore
import {getMincut} from "./utils.js";
import {globalRoom} from "../rooms";

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

/**
 * Defines the core of the base
 */
const BASE_LAYOUT: StructurePos[] = [
  // https://screepers.github.io/screeps-tools/?share=N4IgTgxgNiBcAcAaEAjArgSygEwwOwHMBnOUMAewENs4BtUADzgCYA2ZATxYAYBfRRiwDsnFgEZ+g2MwCso2GICckkE2kBmecwkDVLACxa+utc0MguC+CtPMtOqdqM2Wmiy2Yvp5y83VfZLX0A9ncrEK1-E2EtT2jvLRkIsNkApBS4x3TfBz1pRWd45gKw4KKS3yjHOwyAsUiAt19WAJEUlqKmuDEhAJrLMQ7HNoHeouzuobz1bnklLxmggNmUsscVgeUAXWQAUwYAF128IgxyPDpHH27lTrnrO7D5ov6ePrnbx3qnz7ynFNypm+vkyf2uCjGjjkTweULmkL+oVGyU2rQ+aJhGN8xiyhVxPwCFRuAXBZkaiXeKSqfy6GnJq0pvjWf2BBkJ9nZtSK0N8SXGDSKI1cnKZaSWgvFjiRbIlKT51XhjO6sJZiv5TwRpgm4SKrIUU1MtMGJLmBpY0v1WMmIut5XuCw2yodeOmjukgJYRIhzqpPpBfpY8r+XtS6t5YvaKPNAR50Z2ICIAAdKAB3C6weh-WN0ooW7RR6SeeNEA7kMCUAi7S5gjnxo5gAC2+EoMAzV1ivHjUHwAGtq4bnFteLwgA#/building-planner
  /**
   * Spawn
   */
  {x: 1, y: 0, structure: STRUCTURE_SPAWN},
  {x: 1, y: 1, structure: STRUCTURE_SPAWN},
  {x: 0, y: 2, structure: STRUCTURE_SPAWN},

  /**
   *  Storage
   */
  {x: -1, y: 0, structure: STRUCTURE_STORAGE},

  /**
   * Terminal
   */
  {x: -1, y: 1, structure: STRUCTURE_TERMINAL},

  /**
   * Link
   */
  {x: 0, y: -1, structure: STRUCTURE_LINK},

  /**
   * Observer
   */


  /**
   * Labs
   */
  {x: 0, y: 0, structure: STRUCTURE_LAB},
  {x: 0, y: 1, structure: STRUCTURE_LAB},

  /**
   * Extension
   */

  /**
   * roads
   */
  {x: -4, y: -1, structure: STRUCTURE_ROAD},
  {x: -4, y: 2, structure: STRUCTURE_ROAD},
  {x: -3, y: 0, structure: STRUCTURE_ROAD},
  {x: -3, y: 1, structure: STRUCTURE_ROAD},
  {x: -2, y: -4, structure: STRUCTURE_ROAD},
  {x: -2, y: 0, structure: STRUCTURE_ROAD},
  {x: -2, y: 1, structure: STRUCTURE_ROAD},
  {x: -1, y: -3, structure: STRUCTURE_ROAD},
  {x: -1, y: -1, structure: STRUCTURE_ROAD},
  {x: -1, y: 2, structure: STRUCTURE_ROAD},
  {x: -1, y: 4, structure: STRUCTURE_ROAD},
  {x: 0, y: -2, structure: STRUCTURE_ROAD},
  {x: 0, y: 3, structure: STRUCTURE_ROAD},
  {x: 1, y: -3, structure: STRUCTURE_ROAD},
  {x: 1, y: -1, structure: STRUCTURE_ROAD},
  {x: 1, y: 2, structure: STRUCTURE_ROAD},
  {x: 1, y: 4, structure: STRUCTURE_ROAD},
  {x: 2, y: -4, structure: STRUCTURE_ROAD},
  {x: 2, y: 0, structure: STRUCTURE_ROAD},
  {x: 2, y: 1, structure: STRUCTURE_ROAD},
  {x: 3, y: 0, structure: STRUCTURE_ROAD},
  {x: 3, y: 1, structure: STRUCTURE_ROAD},
  {x: 4, y: -1, structure: STRUCTURE_ROAD},
  {x: 4, y: 2, structure: STRUCTURE_ROAD},

]; //todo: complete list

const RESERVED_POS = `RESERVED`;
const STRUCTURE_COST_FOR_COSTMATRIX: { [name: string]: number } = {
  [STRUCTURE_ROAD]: 1,
  [STRUCTURE_OBSERVER]: 10,
  [STRUCTURE_EXTENSION]: 11,
  [STRUCTURE_TOWER]: 12,
  [STRUCTURE_LAB]: 13,
  [STRUCTURE_SPAWN]: 19,
  [STRUCTURE_LINK]: 20,
  [STRUCTURE_TERMINAL]: 21,
  [STRUCTURE_STORAGE]: 22,
  [RESERVED_POS]: 30
};

const centralDepositPos: SimplePosition = {x: -2, y: 0};
const BASE_ROAD_ENDS: SimplePosition[] = [
  {x: -4, y: -1},
  {x: -4, y: 2},
  {x: -2, y: -4},
  {x: -1, y: 4},
  {x: 1, y: 4},
  {x: 2, y: -4},
  {x: 4, y: -1},
  {x: 4, y: 2},
];


class OrganicBaseLayout {
  room: Room;
  controllerPos: RoomPosition;
  costMatrix: CostMatrix;
  reservedControllerPositions: RoomPosition[];
  reservedSourcePositions: RoomPosition[][];
  baseCenter: RoomPosition;
  ramparts: RoomPosition[];
  reSupplyLines: ResupplyLineMemory[];
  sources: Source[];

  complete: boolean;

  constructor (room: Room, loadFromMemory: boolean = false) {
    this.complete = false;
    this.room = room;
    this.controllerPos = this.baseCenter = room.controller ? room.controller.pos : new RoomPosition(25,25,room.name);
    this.costMatrix  = new PathFinder.CostMatrix;
    this.reservedControllerPositions = [];
    this.reservedSourcePositions = [];
    this.ramparts = [];
    this.reSupplyLines = [];
    this.sources = room.find(FIND_SOURCES);

    if (!this.loadFromCache()) {
      console.log(`loading from cache failed`)
      this.complete = loadFromMemory ? this.loadFromMemory() : this.new(room);
      if (this.complete) { this.cacheRoom(); }
    }

  }

  new(room: Room): boolean {
    this.costMatrix = getCostMatrix(room, false);

    /**
     *  Reserve Slots around Economy Centers (Upgrader, Sources)
     *  Todo: Add Minerals
     */
    this.reservedControllerPositions = this.getReservedTiles(3, this.controllerPos, this.costMatrix);
    this.sources.forEach( source => { this.reservedSourcePositions.push(this.getReservedTiles(1, source.pos, this.costMatrix)); });

    /**
     *  Find & set best RoomPosition for the BaseCenter
     *  Update CostMatrix to enhance pathFinding result
     */

    if (!this.setBaseCenterNew(4,5)) { return false; }
    this.updateCostMatrix(BASE_LAYOUT, true);

    /**
     *  Expand base to have enough room for all extensions & set up resupplyLines
     */

    this.expandBase(); // todo: this returns bool if base could be expanded. react on false

    /**
     *  Economy Paths & Layouts (Controller, Sources)
     */

    this.findEconomyLayout(3, this.controllerPos);
    this.sources.forEach( source => { this.findEconomyLayout(1, source.pos); });
    // todo:  mineral

    /**
     *   Find Walls
     */

    this.ramparts = this.findBestRampartLayout();

    // todo: save everything

    return true;
  }

  addReservedPositionArrToCostMatrix(costMatrix: CostMatrix, positions: RoomPosition[], cost: number): CostMatrix {
    positions.forEach( pos => {
      costMatrix.set(pos.x, pos.y, cost);
    });
    return costMatrix;
  }

  setBaseCenterNew(minBaseRadius: number, optimalBaseRadius: number): boolean {

    let reverseCostMatrix = getCostMatrix(this.room, true);
    this.addReservedPositionArrToCostMatrix(reverseCostMatrix, this.reservedControllerPositions, 0);
    this.reservedSourcePositions.forEach( arr => { this.addReservedPositionArrToCostMatrix(reverseCostMatrix, arr, 0); });

    let distanceTransformCostMatrix = distanceTransform(this.room, reverseCostMatrix);
    let floodFilledCostMatrix = floodFill(this.room, this.reservedControllerPositions);

    this.baseCenter = this.findBestBaseCenter(floodFilledCostMatrix, distanceTransformCostMatrix, minBaseRadius, optimalBaseRadius);

    return this.baseCenter.x != 0;
  }

  expandBase(): boolean {
    const requiredBuildingSpots = 60;
    let foundBuildingSpots: SimplePosition[] = [];

    // initial setup
    BASE_ROAD_ENDS.forEach( endPoint => {
      this.reSupplyLines.push(
        {
          path: this.room.findPath(
            new RoomPosition(this.baseCenter.x + centralDepositPos.x, this.baseCenter.y + centralDepositPos.y, this.room.name),
            new RoomPosition(this.baseCenter.x + endPoint.x, this.baseCenter.y + endPoint.y, this.room.name),
            {ignoreCreeps: true, costCallback: () => {return this.costMatrix}}
          ),
          reversePath: [],
          energyStoreLocations: []
        }
      );
    });

    // init energyStoreLocations
    this.reSupplyLines.forEach( line => {
      line.path.forEach( () => {
        line.energyStoreLocations.push([]);
      });
    })

    // fill construction spots along the lines
    const maxSteps = 20;
    let stepCount = 0;

    // expand base
    while (stepCount < maxSteps && foundBuildingSpots.length < requiredBuildingSpots) {
      for (let num in this.reSupplyLines) {
        if (!this.reSupplyLines[num].path[stepCount]) {
          if (!this.reSupplyLines[num].path[stepCount-1]) { continue; }
          let lastStep = this.reSupplyLines[num].path[stepCount-1];
          if (this.costMatrix.get(lastStep.x + lastStep.dx, lastStep.y + lastStep.dy) == 255) { continue; }
          // add step to supplyPath
          this.reSupplyLines[num].path.push({
            x: lastStep.x + lastStep.dx,
            y: lastStep.y + lastStep.dy,
            dx: lastStep.dx,
            dy: lastStep.dy,
            direction: lastStep.direction
          });
          this.reSupplyLines[num].energyStoreLocations.push([]);

          // build road on location
          this.costMatrix.set(this.reSupplyLines[num].path[stepCount].x, this.reSupplyLines[num].path[stepCount].y, 1);
          //todo: ensure that this doesn't run in reserved tiles;
          //todo: make it more dynamic
        }

        //find & set new extension building spots
        let newX: number, newY: number;
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            // ensure we do not block further expansion
            if (x == this.reSupplyLines[num].path[stepCount].dx && y == this.reSupplyLines[num].path[stepCount].dy) { continue; }
            newX = this.reSupplyLines[num].path[stepCount].x + x;
            newY = this.reSupplyLines[num].path[stepCount].y + y;
            // ensure we do not develop into critical economy areas
            if (_.filter(this.reservedControllerPositions, pos => { return pos.x == newX && pos.y == newY }).length >= 1) { continue; }
            if (_.filter(this.reservedSourcePositions[0] || [], pos => { return pos.x == newX && pos.y == newY }).length >= 1) { continue; }
            if (_.filter(this.reservedSourcePositions[1] || [], pos => { return pos.x == newX && pos.y == newY }).length >= 1) { continue; }

            if (between(this.costMatrix.get(newX, newY), 1, 10) ) {
              foundBuildingSpots.push({x: newX, y: newY});
              this.costMatrix.set(newX, newY, STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_EXTENSION]);
              this.reSupplyLines[num].energyStoreLocations[stepCount].push({x: newX, y: newY});
            }
          }
        }
      }

      stepCount ++;
    }

    return foundBuildingSpots.length >= requiredBuildingSpots;
  }

  findEconomyLayout(range: number, targetPos: RoomPosition) {
    // find path to controller
    let path = this.room.findPath(
      new RoomPosition(this.baseCenter.x + centralDepositPos.x, this.baseCenter.y + centralDepositPos.y, this.room.name),
      targetPos,
      {ignoreCreeps: true, range: range, costCallback: () => {return this.costMatrix}}
    );
    let workPos = path[path.length-1];

    // update costMatrix
    path.forEach( step => {
      if (this.costMatrix.get(step.x, step.y) >= 10 ) {
        // todo: this means we override a base building, react properly to it
      }

      if (this.costMatrix.get(step.x, step.y) > STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_ROAD] ) {
        this.costMatrix.set(step.x, step.y, STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_ROAD]);
      }
    });
    this.costMatrix.set(workPos.x, workPos.y, STRUCTURE_COST_FOR_COSTMATRIX[RESERVED_POS]);

    // find link pos
    let bestSpot: SimplePosition = {x: 0, y: 0};
    let bestSpotEval: number = 1000;
    let currentSpotEval: number;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (!between(this.costMatrix.get(workPos.x + x, workPos.y + y), 1, 10 )) { continue; }
        currentSpotEval = Math.abs(workPos.x + x - this.baseCenter.x) + Math.abs(workPos.y + y - this.baseCenter.y);
        if (currentSpotEval < bestSpotEval) {
          bestSpotEval = currentSpotEval;
          bestSpot.x = workPos.x + x;
          bestSpot.y = workPos.y + y;
        }
      }
    }
    if (bestSpot.x != 0) { this.costMatrix.set(bestSpot.x, bestSpot.y, STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_LINK]); }

    // todo: what if we do not find a spot for the link??
    // todo: save path, pos

  }

  findBestRampartLayout() {
    let arr = [];
    for (let x = -4; x <=4; x++) {
      for (let y = -4; y <=4; y++) {
        arr.push(new RoomPosition(this.baseCenter.x + x, this.baseCenter.y + y, this.room.name));
      }
    }

    return getMincut(this.room.name, arr, this.costMatrix);
  }

  findBestBaseCenter(floodFilledCostMatrix: CostMatrix, distanceTransformCostMatrix: CostMatrix, minBaseRadius: number, optimalBaseRadius: number): RoomPosition {

    const baseEvaluation = 200;
    const radiusValueModification = 1.1;

    let currentSpot: RoomPosition = new RoomPosition(0,0, this.room.name);
    let currentSpotEvaluation: number = 0;

    let distance: number;
    let radius: number;
    let evaluation: number;

    for (let x = minBaseRadius; x <= 49 - minBaseRadius; x++) {
      for (let y = minBaseRadius; y <= 49 - minBaseRadius; y++) {
        if (distanceTransformCostMatrix.get(x,y) < minBaseRadius) { continue; }

        distance = floodFilledCostMatrix.get(x,y);
        radius = distanceTransformCostMatrix.get(x,y);

        evaluation = baseEvaluation - distance  + Math.min(radius, optimalBaseRadius) * radiusValueModification;

        if (evaluation > currentSpotEvaluation) {
          currentSpotEvaluation = evaluation;
          currentSpot.x = x;
          currentSpot.y = y;
        }
      }
    }

    return currentSpot;
  }

  loadFromMemory() {
    //todo: implement
    return false;
  }

  cacheRoom() {
    let roomCache = globalRoom(this.room.name);
    roomCache.costMatrix = this.costMatrix;
    roomCache.baseCenter = this.baseCenter;
    roomCache.rampartLayout = this.ramparts;

    // todo: cache resupply lines are not
  }

  loadFromCache(): boolean {
    let roomCache = globalRoom(this.room.name);
    if (!roomCache.costMatrix) { return false; }
    if (!roomCache.baseCenter) { return false; }

    this.baseCenter = roomCache.baseCenter;
    this.costMatrix = roomCache.costMatrix;

    this.ramparts = roomCache.rampartLayout || [];

    return true;
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

    for (let x = 0; x <= 49; x++) {
      for (let y = 0; y <= 49; y++) {
        switch (this.costMatrix.get(x,y)) {
          case (STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_ROAD]): {
            roomVisual.rect(x - 0.4, y - 0.4, 0.8, 0.8, {
              fill: 'grey',
              opacity: 0.4,
            });
            break;
          }
          case (STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_EXTENSION]): {
            roomVisual.circle(x, y, {
              fill: 'yellow',
              opacity: 0.4,
              radius: 0.25
            });
            break;
          }
          case (STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_STORAGE]): {
            roomVisual.rect(x - 0.3, y - 0.4, 0.6, 0.8, {
              fill: 'yellow',
              opacity: 0.8,
            });
            break;
          }
          case (STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_LINK]): {
            roomVisual.text(`♦`, x + 0.05, y + 0.25, {
              color: 'yellow',
              opacity: 0.8,
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_TERMINAL]): {
            roomVisual.text(`✈`, x + 0.05, y + 0.25, {
              color: 'white',
              opacity: 0.8,
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_SPAWN]): {
            roomVisual.text(`🏘️`, x + 0.05, y + 0.25, {
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_OBSERVER]): {
            roomVisual.text(`🕵️`, x + 0.05, y + 0.25, {
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_NUKER]): {
            roomVisual.text(`☢️`, x + 0.05, y + 0.25, {
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_LAB]): {
            roomVisual.circle(x, y, {
              fill: 'white',
              opacity: 1.0,
              radius: 0.25
            });
            break;
          }
          case (STRUCTURE_COST_FOR_COSTMATRIX[RESERVED_POS]): {
            roomVisual.circle(x, y, {
              fill: 'transparent',
              opacity: 0.6,
              radius: 0.4,
              stroke: 'red',
              strokeWidth: 0.2
            });
            break;
          }
          default: {

          }
        }
      }
    }

    this.ramparts.forEach(pos => {
      roomVisual.rect(pos.x - 0.5, pos.y - 0.5, 1, 1, {
        fill: 'blue',
        opacity: 0.4,
      });
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
        STRUCTURE_COST_FOR_COSTMATRIX[pos.structure] || 10);
    });
  }
}

const between = (num: number, min: number, max: number): boolean => {
  return (num > min && num < max);
}


export {OrganicBaseLayout}
