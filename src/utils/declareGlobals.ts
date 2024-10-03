export default () => {}

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface SimplePosition {
    x: number,
    y: number,
    type?: string
  }

  interface Memory {
    creeps: { [name: string]: CreepMemory };
    powerCreeps: { [name: string]: PowerCreepMemory };
    flags: { [name: string]: FlagMemory };
    rooms: { [name: string]: RoomMemory };
    spawns: { [name: string]: SpawnMemory };
    missions: { [name: string]: MissionMemory };
  }

  interface MissionMemory {
    id: string,
    type: string,
    roomId: string,
    origin?: string,
    children?: string[],
    spawnId?: Id<StructureSpawn>[],
    sourceId?: Id<Source>,
    containerId?: Id<Structure>,
    linkId?: Id<StructureLink>,
    extensionIds?: Id<StructureExtension>[],
    constructionPositions?: SimplePosition[],
    constructionSiteIds?: Id<ConstructionSite>[],
    path?: PathStep[],
    creepRole?: creepRoles,
    ticksTillNextCheck?: number
  }

  interface MissionCache {
    id: string,
    spawn?: StructureSpawn,
    source?: Source,
    container?: StructureContainer,
    link?: StructureLink,
    extensions?: StructureExtension[]
  }

  interface CreepMemory {
    role: number,
    missionId: string,
    targetId?: string,
    path?: PathStep[]
  }

  enum creepRoles {
    miner
  }

  interface SpawnMemory {
    queue: SpawnQueue[]
  }
  interface SpawnQueue {
    body: BodyPartConstant[],
    opts: SpawnOptions
  }


  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
      missionCache: {[name: string]: MissionCache}
    }
  }
}

