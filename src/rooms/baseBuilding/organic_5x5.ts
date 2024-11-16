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


// @ts-ignore
import {getMincut} from "./utils.js";
import {globalRoom} from "../rooms";
import {getCostMatrix} from "./getCostMatrix";
import {distanceTransform} from "./distanceTransform";
import {floodFill} from "./floodFill";



/*
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


const BASE_TYPE = `organic5x5`;
const COST_RESERVED_POS = 30;
const STRUCTURE_COST_FOR_COSTMATRIX: { [name: string]: number } = {
  [STRUCTURE_ROAD]: 1,
  [STRUCTURE_OBSERVER]: 10, // observer should stay the lowest rated building, as this value is used in logic to check if a position is still free to build
  [STRUCTURE_EXTENSION]: 11,
  [STRUCTURE_TOWER]: 12,
  [STRUCTURE_FACTORY]: 13,
  [STRUCTURE_NUKER]: 14,
  [STRUCTURE_POWER_SPAWN]: 15,
  [STRUCTURE_LAB]: 16,
  [STRUCTURE_SPAWN]: 19,
  [STRUCTURE_LINK]: 20,
  [STRUCTURE_TERMINAL]: 21,
  [STRUCTURE_STORAGE]: 22,

  [STRUCTURE_EXTRACTOR]: 255,
};

/**
 * Defines the core of the base
 */
const BASE_LAYOUT: { [name: string]: StructurePos[] } = {
  [STRUCTURE_SPAWN]: [
    {x: 1, y: 1, structure: STRUCTURE_SPAWN},
    {x: -1, y: 1, structure: STRUCTURE_SPAWN},
    {x: -1, y: -1, structure: STRUCTURE_SPAWN},
  ],
  [STRUCTURE_STORAGE]: [
    {x: -1, y: 0, structure: STRUCTURE_STORAGE}
  ],
  [STRUCTURE_TOWER]: [],
  [STRUCTURE_LINK]: [
    {x: 1, y: 0, structure: STRUCTURE_LINK},
  ],
  [STRUCTURE_TERMINAL]: [
    {x: 0, y: 1, structure: STRUCTURE_TERMINAL},
  ],
  [STRUCTURE_ROAD]: [
    {x: -4, y: -1, structure: STRUCTURE_ROAD},
    {x: -4, y: 1, structure: STRUCTURE_ROAD},
    {x: -3, y: 0, structure: STRUCTURE_ROAD},
    {x: -2, y: -1, structure: STRUCTURE_ROAD},
    {x: -2, y: 1, structure: STRUCTURE_ROAD},
    {x: -1, y: -4, structure: STRUCTURE_ROAD},
    {x: -1, y: -2, structure: STRUCTURE_ROAD},
    {x: -1, y: 2, structure: STRUCTURE_ROAD},
    {x: -1, y: 4, structure: STRUCTURE_ROAD},
    {x: 0, y: -3, structure: STRUCTURE_ROAD},
    {x: 0, y: 3, structure: STRUCTURE_ROAD},
    {x: 1, y: -4, structure: STRUCTURE_ROAD},
    {x: 1, y: -2, structure: STRUCTURE_ROAD},
    {x: 1, y: 2, structure: STRUCTURE_ROAD},
    {x: 1, y: 4, structure: STRUCTURE_ROAD},
    {x: 2, y: -1, structure: STRUCTURE_ROAD},
    {x: 2, y: 1, structure: STRUCTURE_ROAD},
    {x: 3, y: 0, structure: STRUCTURE_ROAD},
    {x: 4, y: -1, structure: STRUCTURE_ROAD},
    {x: 4, y: 1, structure: STRUCTURE_ROAD},
  ],
  [STRUCTURE_EXTENSION]: [],
  [STRUCTURE_LAB]: [
    {x: 2, y: 2, structure: STRUCTURE_LAB},

  ],
  [STRUCTURE_OBSERVER]: [
    {x: 3, y: 3, structure: STRUCTURE_OBSERVER},
  ],
  [STRUCTURE_POWER_SPAWN]: [
    {x: 0, y: -2, structure: STRUCTURE_POWER_SPAWN},
  ],
  [STRUCTURE_NUKER]: [
    {x: -2, y: 0, structure: STRUCTURE_NUKER},
  ],
  [STRUCTURE_FACTORY]: [
    {x: 0, y: 2, structure: STRUCTURE_FACTORY},
  ],
}
const BASE_LAYOUT_COMPLETE: StructurePos[] = [
  // https://screepers.github.io/screeps-tools/?share=N4IgTgxgNiBcAcAaEAjArgSygEwwOwHMBnOUMAewENs4BtUADzgCYA2ZATxYAYBfRRiwDsnFgEZ+g2MwCso2GICckkE2kBmecwkDVLACxa+utc0MguC+CtPMtOqdqM2Wmiy2Yvp5y83VfZLX0A9ncrEK1-E2EtT2jvLRkIsNkApBS4x3TfBz1pRWd45gKw4KKS3yjHOwyAsUiAt19WAJEUlqKmuDEhAJrLMQ7HNoHeouzuobz1bnklLxmggNmUsscVgeUAXWQAUwYAF128IgxyPDpHH27lTrnrO7D5ov6ePrnbx3qnz7ynFNypm+vkyf2uCjGjjkTweULmkL+oVGyU2rQ+aJhGN8xiyhVxPwCFRuAXBZkaiXeKSqfy6GnJq0pvjWf2BBkJ9nZtSK0N8SXGDSKI1cnKZaSWgvFjiRbIlKT51XhjO6sJZiv5TwRpgm4SKrIUU1MtMGJLmBpY0v1WMmIut5XuCw2yodeOmjukgJYRIhzqpPpBfpY8r+XtS6t5YvaKPNAR50Z2ICIAAdKAB3C6weh-WN0ooW7RR6SeeNEA7kMCUAi7S5gjnxo5gAC2+EoMAzV1ivHjUHwAGtq4bnFteLwgA#/building-planner
  ...BASE_LAYOUT[STRUCTURE_ROAD],
  ...BASE_LAYOUT[STRUCTURE_OBSERVER],
  ...BASE_LAYOUT[STRUCTURE_EXTENSION],
  ...BASE_LAYOUT[STRUCTURE_TOWER],
  ...BASE_LAYOUT[STRUCTURE_LAB],
  ...BASE_LAYOUT[STRUCTURE_SPAWN],
  ...BASE_LAYOUT[STRUCTURE_LINK],
  ...BASE_LAYOUT[STRUCTURE_TERMINAL],
  ...BASE_LAYOUT[STRUCTURE_STORAGE],
  ...BASE_LAYOUT[STRUCTURE_POWER_SPAWN],
  ...BASE_LAYOUT[STRUCTURE_NUKER],
  ...BASE_LAYOUT[STRUCTURE_FACTORY],
];

const CENTRAL_DEPOSIT_DELTA_POSITION: SimplePosition = {x: -1, y: 0};
const BASE_ROAD_ENDS: StructurePos[] = [
  {x: -4, y: -1, structure: STRUCTURE_ROAD},
  {x: -4, y: 1, structure: STRUCTURE_ROAD},
  {x: -1, y: -4, structure: STRUCTURE_ROAD},
  {x: -1, y: 4, structure: STRUCTURE_ROAD},
  {x: 1, y: -4, structure: STRUCTURE_ROAD},
  {x: 1, y: 4, structure: STRUCTURE_ROAD},
  {x: 4, y: -1, structure: STRUCTURE_ROAD},
  {x: 4, y: 1, structure: STRUCTURE_ROAD},
];

class OrganicBaseLayout {
  room: Room;
  costMatrix: CostMatrix;
  reservedControllerPositions: RoomPosition[];
  reservedSourceAndMineralPositions: RoomPosition[];
  baseCenter: RoomPosition;
  reSupplyLines: ResupplyLineMemory[];
  sourcesArr: Source[];
  mineralsArr: Mineral[];
  ecoPositions:  { [name: string]: EcoPosition };
  structurePositions: { [name: string]: StructurePos[]};
  controller: StructureController;

complete: boolean;

  constructor (room: Room, controller: StructureController, loadFromMemory: boolean = false) {
    this.complete = false;
    this.room = room;
    this.controller = controller;
    this.baseCenter = new RoomPosition(0,0 ,room.name);
    this.costMatrix  = new PathFinder.CostMatrix;
    this.reservedControllerPositions = [];
    this.reservedSourceAndMineralPositions = [];
    this.reSupplyLines = []; //todo: the concept of resupply lines was discarded. can be simplified
    this.sourcesArr = room.find(FIND_SOURCES);
    this.mineralsArr = room.find(FIND_MINERALS);
    this.ecoPositions = {};
    this.structurePositions = {
      [STRUCTURE_SPAWN]: [], [STRUCTURE_STORAGE]: [], [STRUCTURE_TOWER]: [], [STRUCTURE_LINK]: [], [STRUCTURE_TERMINAL]: [], [STRUCTURE_ROAD]: [],
      [STRUCTURE_EXTENSION]: [], [STRUCTURE_LAB]: [], [STRUCTURE_OBSERVER]: [], [STRUCTURE_RAMPART]: [], [STRUCTURE_EXTRACTOR]: [],
      [STRUCTURE_CONTAINER]: [], [STRUCTURE_POWER_SPAWN]: [], [STRUCTURE_NUKER]: [], [STRUCTURE_FACTORY]: [],
    };

    if (!this.loadFromCache()) {
      console.log(`loading from cache failed`)
      this.complete = loadFromMemory ? this.loadFromMemory() : this.new(room);
      if (this.complete) { this.cacheRoom(); }
    }
  }

  new(room: Room): boolean {
    this.costMatrix = getCostMatrix(room, false);

    /**
     *  Reserve Slots around Economy Centers (Upgrader, Sources, Mineral)
     */
    this.reservedControllerPositions = this.getReservedTiles(3, this.controller.pos);
    this.sourcesArr.forEach(source => { this.reservedSourceAndMineralPositions.push(...this.getReservedTiles(1, source.pos)); });
    this.mineralsArr.forEach( mineral => {this.reservedSourceAndMineralPositions.push(...this.getReservedTiles(1, mineral.pos));})

    /**
     *  Find & set best RoomPosition for the BaseCenter
     *  Update CostMatrix to enhance pathFinding result
     */

    if (!this.setBaseCenterNew(3,5)) { return false; }
    this.setBaseLayoutPositions(BASE_LAYOUT_COMPLETE, true);

    /**
     *  Expand base to have enough room for all extensions & set up resupplyLines
     */

    this.expandBase(); // todo: this returns true if base could be expanded. react on false

    /**
     *  Economy Paths & Layouts (Controller, Sources)
     */

    this.setEconomyLayout(3, this.controller);
    this.sourcesArr.forEach(source => { this.setEconomyLayout(1, source); });
    this.mineralsArr.forEach(mineral => { this.setEconomyLayout(1, mineral); });

    /**
     *   Find Walls
     */

    this.setRampartLayout();

    // todo: placement of observer, tower
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
    this.addReservedPositionArrToCostMatrix(reverseCostMatrix, this.reservedSourceAndMineralPositions, 0);

    let distanceTransformCostMatrix = distanceTransform(this.room, reverseCostMatrix);
    let floodFilledCostMatrix = floodFill(this.room, this.reservedControllerPositions);

    this.baseCenter = this.findBestBaseCenter(floodFilledCostMatrix, distanceTransformCostMatrix, minBaseRadius, optimalBaseRadius);
    this.costMatrix.set(this.baseCenter.x, this.baseCenter.y, 255);

    return this.baseCenter.x != 0;
  }

  expandBase(): boolean {
    const requiredBuildingSpots = 60;
    let foundBuildingSpots = 0;

    // initial setup
    BASE_ROAD_ENDS.forEach( endPoint => {
      this.reSupplyLines.push(
        {
          path: this.room.findPath(
            new RoomPosition(this.baseCenter.x + CENTRAL_DEPOSIT_DELTA_POSITION.x, this.baseCenter.y + CENTRAL_DEPOSIT_DELTA_POSITION.y, this.room.name),
            new RoomPosition(this.baseCenter.x + endPoint.x, this.baseCenter.y + endPoint.y, this.room.name),
            {ignoreCreeps: true, costCallback: () => {return this.costMatrix}}
          ),
          reversePath: [],
          energyStoreLocations: []
        }
      );
    });

    // fill construction spots along the lines
    const maxSteps = 20;
    let stepCount = 0;

    // expand base
    while (stepCount < maxSteps && foundBuildingSpots < requiredBuildingSpots) {
      for (let num in this.reSupplyLines) {
        if (!this.reSupplyLines[num].path[stepCount]) {
          if (!this.reSupplyLines[num].path[stepCount-1]) { continue; }
          let lastStep = this.reSupplyLines[num].path[stepCount-1];
          if (!this.isValidBuildingSpot(lastStep.x + lastStep.dx, lastStep.y + lastStep.dy)) { continue; }
          // add step to supplyPath
          this.reSupplyLines[num].path.push({
            x: lastStep.x + lastStep.dx,
            y: lastStep.y + lastStep.dy,
            dx: lastStep.dx,
            dy: lastStep.dy,
            direction: lastStep.direction
          });

          // build road on location
          this.setBaseLayoutPositions([{
            x: this.reSupplyLines[num].path[stepCount].x,
            y: this.reSupplyLines[num].path[stepCount].y,
            structure: STRUCTURE_ROAD
          }]);
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
            if (_.filter(this.reservedSourceAndMineralPositions, pos => { return pos.x == newX && pos.y == newY }).length >= 1) { continue; }

            if (this.isValidBuildingSpot(newX, newY)) {
              foundBuildingSpots ++;
              this.setBaseLayoutPositions([{
                x: newX,
                y: newY,
                structure: STRUCTURE_EXTENSION
              }]);
            }
          }
        }
      }

      stepCount ++;
    }

    return foundBuildingSpots >= requiredBuildingSpots;
  }

  setEconomyLayout(range: number, target: StructureController | Source | Mineral): void {
    // find path to target
    let path = this.room.findPath(
      new RoomPosition(this.baseCenter.x + CENTRAL_DEPOSIT_DELTA_POSITION.x, this.baseCenter.y + CENTRAL_DEPOSIT_DELTA_POSITION.y, this.room.name),
      target.pos,
      {ignoreCreeps: true, range: range, costCallback: () => {return this.costMatrix}}
    );
    let workPos = path[path.length-1];
    path.pop();

    // update costMatrix
    path.forEach( step => {
      if (this.costMatrix.get(step.x, step.y) >= 10 ) {
        // todo: this means we override a base building, react properly to it
      }

      if (this.isValidBuildingSpot(step.x, step.y)) {
        this.setBaseLayoutPositions([{x: step.x, y: step.y, structure: STRUCTURE_ROAD}]);
      }
    });
    this.costMatrix.set(workPos.x, workPos.y, COST_RESERVED_POS);

    if (target instanceof Mineral ) {
      this.setBaseLayoutPositions([{x: workPos.x, y: workPos.y, structure: STRUCTURE_CONTAINER}]);
      this.setBaseLayoutPositions([{x: target.pos.x, y: target.pos.y, structure: STRUCTURE_EXTRACTOR}]);

      this.ecoPositions[target.id] = {
        creepSpot: {x: workPos.x, y: workPos.y},
        pathToCreepPosition: path,
      };
      return;
    }

    // find link pos
    let bestSpot: SimplePosition = {x: 0, y: 0};

    let bestSpotEval: number = 1000;
    let currentSpotEval: number;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (!this.isValidBuildingSpot(workPos.x + x, workPos.y + y)) { continue; }
        currentSpotEval = Math.abs(workPos.x + x - this.baseCenter.x) + Math.abs(workPos.y + y - this.baseCenter.y);
        if (currentSpotEval < bestSpotEval) {
          bestSpotEval = currentSpotEval;
          bestSpot.x = workPos.x + x;
          bestSpot.y = workPos.y + y;
        }
      }
    }
    if (bestSpot.x != 0) {
      this.setBaseLayoutPositions([{x: bestSpot.x, y: bestSpot.y, structure: STRUCTURE_LINK}]);
    }
    // todo: what if we do not find a spot for the link??

    this.ecoPositions[target.id] = {
      creepSpot: {x: workPos.x, y: workPos.y},
      pathToCreepPosition: path,
      linkPosition: {x: bestSpot.x, y: bestSpot.y}
    };
  }

  setRampartLayout(): void {
    let arr: RoomPosition[] = [];

    for (let structurePositionsKey in this.structurePositions) {
      if (structurePositionsKey == (STRUCTURE_CONTAINER || STRUCTURE_ROAD || STRUCTURE_EXTRACTOR || STRUCTURE_LINK)) { continue; }

      this.structurePositions[structurePositionsKey].forEach( structure => {
        arr.push(new RoomPosition(structure.x , structure.y, this.room.name));
      })
    }

    let result = getMincut(this.room.name, arr, this.costMatrix);

    if (result.cuts && result.cuts.length) {
      result.cuts.forEach( (pos: RoomPosition) => {
        this.structurePositions[STRUCTURE_RAMPART].push({
          x: pos.x,
          y: pos.y,
          structure: STRUCTURE_RAMPART
        });
      });
    }

    /*
    getMincut(this.room.name, arr, this.costMatrix).forEach( (pos: RoomPosition) => {
      this.structurePositions[STRUCTURE_RAMPART].push({
        x: pos.x,
        y: pos.y,
        structure: STRUCTURE_RAMPART
      });
    });
     */
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
    roomCache.baseCenter = this.baseCenter; //todo: change to simplePos - or do I even need it?
    roomCache.structurePositions = this.structurePositions;
    roomCache.ecoPositions = this.ecoPositions;
    roomCache.type = BASE_TYPE;
  }

  loadFromCache(): boolean {
    let roomCache = globalRoom(this.room.name);
    if (!roomCache.type || roomCache.type != BASE_TYPE) { return false; }
    if (!roomCache.costMatrix) { return false; }
    if (!roomCache.baseCenter) { return false; }

    this.baseCenter = roomCache.baseCenter;
    this.costMatrix = roomCache.costMatrix;

    if (roomCache.structurePositions) { this.structurePositions = roomCache.structurePositions; }
    if (roomCache.ecoPositions) { this.ecoPositions = roomCache.ecoPositions; }

    return true;
  }

  saveToMemory() {
    /**
     * data to save on Room:
     *  BaseCenter
     *  List of all structure placement spots
     *
     *  UpgraderSpot, UpgraderLinkSpot, PathFromSpawn
     *  []: MiningSpot, MiningLinkSpot, PathFromSpawn, SourceId
     *  MineralMiningSpot, PathFromSpawn, MineralId ? ExtractorId?
     *  Defense ?
     */
    let baseLayoutMemory: BaseLayoutMemory = {
      costMatrix: this.costMatrix,
      baseCenter: this.baseCenter,
      ecoPosition: {}
    }
  }

  visualize() {
    const roomVisual = new RoomVisual(this.room.name);

    for (let structurePositionsKey in this.structurePositions) {
      this.structurePositions[structurePositionsKey].forEach(structurePos => {
        switch (structurePos.structure) {
          case (STRUCTURE_ROAD): {
            roomVisual.rect(structurePos.x - 0.4, structurePos.y - 0.4, 0.8, 0.8, {
              fill: 'grey',
              opacity: 0.4,
            });
            break;
          }
          case (STRUCTURE_EXTENSION): {
            roomVisual.circle(structurePos.x, structurePos.y, {
              fill: 'yellow',
              opacity: 0.4,
              radius: 0.25
            });
            break;
          }
          case (STRUCTURE_STORAGE): {
            roomVisual.rect(structurePos.x - 0.3, structurePos.y - 0.4, 0.6, 0.8, {
              fill: 'yellow',
              opacity: 0.8,
            });
            break;
          }
          case (STRUCTURE_LINK): {
            roomVisual.text(`♦`, structurePos.x + 0.05, structurePos.y + 0.25, {
              color: 'yellow',
              opacity: 0.8,
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_TERMINAL): {
            roomVisual.text(`✈`, structurePos.x + 0.05, structurePos.y + 0.25, {
              color: 'white',
              opacity: 0.8,
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_SPAWN): {
            roomVisual.text(`🏘️`, structurePos.x + 0.05, structurePos.y + 0.25, {
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_OBSERVER): {
            roomVisual.text(`🕵️`, structurePos.x + 0.05, structurePos.y + 0.25, {
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_NUKER): {
            roomVisual.text(`☢️`, structurePos.x + 0.05, structurePos.y + 0.25, {
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_LAB): {
            roomVisual.circle(structurePos.x, structurePos.y, {
              fill: 'white',
              opacity: 1.0,
              radius: 0.25
            });
            break;
          }
          case (STRUCTURE_RAMPART): {
            roomVisual.rect(structurePos.x - 0.5, structurePos.y - 0.5, 1, 1, {
              fill: 'blue',
              opacity: 0.4,
            });
            break;
          }
          case (STRUCTURE_POWER_SPAWN): {
            roomVisual.text(`🏙️️`, structurePos.x + 0.05, structurePos.y + 0.25, {
              font: 0.8
            });
            break;
          }
          case (STRUCTURE_FACTORY): {
            roomVisual.text(`⚙️️`, structurePos.x + 0.05, structurePos.y + 0.25, {
              font: 0.8
            });
            break;
          }
          default: {

          }
        }
      })
    }

    for (let ecoPositionsKey in this.ecoPositions) {
      roomVisual.circle(this.ecoPositions[ecoPositionsKey].creepSpot.x, this.ecoPositions[ecoPositionsKey].creepSpot.y, {
        fill: 'transparent',
        opacity: 0.8,
        radius: 0.45,
        stroke: 'red',
      });
    }
  }

  getReservedTiles (range: number = 3, pos: RoomPosition): RoomPosition[] {
    let arr: RoomPosition[] = [];

    for (let xDelta = - range; xDelta <= range; xDelta++) {
      for (let yDelta = - range; yDelta <= range; yDelta++) {
        if (this.costMatrix.get(pos.x + xDelta, pos.y + yDelta) < 255) { arr.push(new RoomPosition(pos.x + xDelta, pos.y + yDelta, pos.roomName)); }
      }
    }

    return arr;
  }

  setBaseLayoutPositions (structureArr: StructurePos[], relativeToBaseCenter: boolean = false) {
    structureArr.forEach(pos => {

      try {
        this.structurePositions[pos.structure].push({
          x: pos.x + (relativeToBaseCenter ? this.baseCenter.x : 0),
          y: pos.y + (relativeToBaseCenter ? this.baseCenter.y : 0),
          structure: pos.structure
        });
      }
      catch (e) {
        console.log(pos.structure)
      }

      if (pos.structure == STRUCTURE_CONTAINER) { return; }

      this.costMatrix.set(
        pos.x + (relativeToBaseCenter ? this.baseCenter.x : 0),
        pos.y + (relativeToBaseCenter ? this.baseCenter.y : 0),
        STRUCTURE_COST_FOR_COSTMATRIX[pos.structure] || 9);
    });
  }

  isValidBuildingSpot(x: number, y: number): boolean {
    return between(this.costMatrix.get(x, y), 1, STRUCTURE_COST_FOR_COSTMATRIX[STRUCTURE_OBSERVER]);
  }
}

const between = (num: number, min: number, max: number): boolean => {
  return (num > min && num < max);
}

export {OrganicBaseLayout}
