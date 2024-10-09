import {insertUpdateSpawnQueueItems} from "../structures/spawn/spawn";

const baseName = 'harvest';
let missionId: string;

const initHarvestSourceBasicMission = (room: Room, source: Source, pathFromSpawn: PathStep[], spawn: StructureSpawn) => {

  missionId = room.name + '_' + baseName + '_' + source.id;


  Memory.missions[missionId] = {
    id: missionId,
    type: baseName,
    roomId: room.name,
    spawnId: [spawn.id],
    sourceId: source.id,
    //constructionPositions: getDepositPositions(room, source, pathFromSpawn),
    constructionSiteIds: [],
    path: pathFromSpawn,
    pathFromController: [],
    pathToController: []
  };

  let args: SpawnQueue = {
    body: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE ],
    requiredSpawnStart: Game.time,
    repeat: true,
    missionId: missionId,
    role: 0
  };

  insertUpdateSpawnQueueItems(missionId, spawn, args, 1);

}

const getDepositPositions = (room: Room, source: Source, pathFromSpawn: PathStep[]  | RoomPosition[]): SimplePosition[] => {

  let depositPositions: SimplePosition[] = [];
  if (pathFromSpawn.length < 3) { return depositPositions; } // todo: edge case not yet implemented. Will break stuff!

  const terrain = new Room.Terrain(room.name);

  let terrainPos;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      if (x == 0 && y == 0) { continue; } // miner spot
      if (pathFromSpawn[pathFromSpawn.length-1].x + x < 1 || pathFromSpawn[pathFromSpawn.length-1].x + x > 48 ||
        pathFromSpawn[pathFromSpawn.length-1].y + y < 1 || pathFromSpawn[pathFromSpawn.length-1].y + y > 48) {
        continue;
      } // room edges
      if (pathFromSpawn[pathFromSpawn.length-1].x + x == source.pos.x && pathFromSpawn[pathFromSpawn.length-1].y + source.pos.y == 0) { continue; } // source spot
      if (pathFromSpawn[pathFromSpawn.length-1].x + x == pathFromSpawn[pathFromSpawn.length-2].x && pathFromSpawn[pathFromSpawn.length-1].y + pathFromSpawn[pathFromSpawn.length-2].y == 0) { continue; }

      terrainPos = terrain.get(pathFromSpawn[pathFromSpawn.length-1].x + x, pathFromSpawn[pathFromSpawn.length-1].y + y);

      if (terrainPos === 1) { continue; }

      depositPositions.push({x: pathFromSpawn[pathFromSpawn.length-1].x + x, y: pathFromSpawn[pathFromSpawn.length-1].y + y});
    }
  }
  return depositPositions;
}

export { initHarvestSourceBasicMission }
