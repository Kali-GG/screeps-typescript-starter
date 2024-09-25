const CPU_PER_CREEP = 0.25;
const REQUIRED_WORK_PARTS_TO_DEPLETE_OWNED_SOURCE = SOURCE_ENERGY_CAPACITY / HARVEST_POWER / 300;

const carryCapacity = 150;
const upgradeCapacityPerTick = 2;

export const roomBasics: Mission = {
  evaluation(): MissionEvaluationResult {
    return {
      requiredCPU: 1,
      expectedGain: 10
    }
  },
  init(room, assignedCPU) {
    if (!room.controller?.my) { return; }

    let spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length == 0) { return; }

    let sources = room.find(FIND_SOURCES);

    let missionInformation: MissionMemory = {
      id: room.name + '_roomBasics',
      origin: null,
      children: [],
      spawnId: [],
      targetId: [],
      path: [],
      creepType: null
    };

    sources.forEach(source => {
      let pathFromSpawn = room.findPath(spawns[0].pos, source.pos, {
        ignoreCreeps: true
      });

      let harvestingContainerPos = new RoomPosition(
        pathFromSpawn[pathFromSpawn.length-1].x,
        pathFromSpawn[pathFromSpawn.length-1].y,
        room.name
      );

      // @ts-ignore
      let pathToController = room.findPath(harvestingContainerPos, room.controller.pos, {
        ignoreCreeps: true,
        range: 3
      });
      let upgradingContainerPos = new RoomPosition(
        pathToController[pathToController.length-1].x,
        pathToController[pathToController.length-1].y,
        room.name
      );

      let deliveryCapacityPerTick = carryCapacity / (pathToController.length * 2);
      let requiredHaulers = Math.max(Math.floor(upgradeCapacityPerTick / deliveryCapacityPerTick), 1);

      missionInformation.children.push( room.name + '_harvest_' + source.id );

      Memory.missions[room.name + '_harvest_' + source.id] = {
        id: room.name + '_harvest_' + source.id,
        origin: room.name + '_roomBasics',
        children: [],
        spawnId: [spawns[0].id],
        targetId: [source.id],
        path: [pathFromSpawn],
        creepType: 0
      };

      // todo: add hauler mission
      // todo: add upgrade mission
    });
    Memory.missions[room.name + '_roomBasics'] = missionInformation;
  }
}
