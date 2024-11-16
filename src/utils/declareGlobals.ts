export default () => {}

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definition alone.
          You must also give them an implementation if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples

  /**
   * Simple Position, requires x, y and optionally allows type (string)
   */
  interface SimplePosition {
    x: number,
    y: number,
    type?: string
  }

  interface StructurePos {
    x: number,
    y: number,
    structure: BuildableStructureConstant
  }

  interface Memory {
    creeps: { [name: string]: CreepMemory };
    powerCreeps: { [name: string]: PowerCreepMemory };
    flags: { [name: string]: FlagMemory };
    rooms: { [name: string]: RoomMemory };
    spawns: { [name: string]: SpawnMemory };
    missions: { [name: string]: MissionMemory };
    empire: EmpireMemory;
  }

  interface MissionMemory {
    id: string,
    type: string,
    roomId: string,
    spawnId?: Id<StructureSpawn>[],
    sourceId?: Id<Source>,
    containerId?: Id<StructureContainer>,
    linkId?: Id<StructureLink>,
    extensionIds?: Id<StructureExtension>[],
    constructionPositions?: SimplePosition[],
    constructionSiteIds?: Id<ConstructionSite>[],
    path: PathStep[],
    pathToController: PathStep[],
    pathFromController: PathStep[],
    creepRole?: creepRoles,
  }

  interface Room {
    _my: Function,
  }

  interface EmpireMemory {
    creepNum: number,
    memoryVersion: number
  }

  interface RoomMemory {
    avoidPositions: SimplePosition[],
    tickTillSpawnMissions: number,
    usedLayout?: string,
    baseLayout?: BaseLayoutMemory
  }

  interface BaseLayoutMemory {
    costMatrix?: CostMatrix, // todo: serialize!
    rampartLayout?: SimplePosition[],
    baseCenter?: SimplePosition
    structurePositions?: { [name: string]: SimplePosition[]},
    ecoPosition?: { [name: string]: EcoPosition }
  }

  interface EcoPosition {
    creepSpot: SimplePosition,
    linkPosition?: SimplePosition
    pathToCreepPosition: PathStep[]
  }

  interface ResupplyLineMemory {
    path: PathStep[],
    reversePath: PathStep[],
    energyStoreLocations: SimplePosition[][]
  }

  interface CreepMemory {
    role: number,
    missionId: string,
  }

  enum creepRoles {
    miner
  }

  interface StructureSpawn {
    _spawnPos: Function,
  }

  interface SpawnMemory {
    queue: SpawnQueue[]
  }
  interface SpawnQueue {
    body: BodyPartConstant[],
    requiredSpawnStart: number,
    repeat: boolean,
    missionId: string,
    role: number
  }

  interface RoomCache {
    emptyEnergyReservesArr: string[],
    updateEmptyEnergyReservesArr: boolean,
    baseCenter?: RoomPosition,
    costMatrix?: CostMatrix,
    rampartLayout?: RoomPosition[]
    structurePositions?: { [name: string]: StructurePos[]},
    ecoPositions?:  { [name: string]: EcoPosition },
    type?: string
  }

  // Syntax for adding properties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
      costMatrixCache: {[name: string]: CostMatrix},
      roomCache: {[name: string]: RoomCache},
    }
  }
}


