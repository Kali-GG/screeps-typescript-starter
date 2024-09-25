import {addMission, missions} from "./missions";

const CPU_PER_CREEP = 0.25;
const REQUIRED_WORK_PARTS_TO_DEPLETE_OWNED_SOURCE = SOURCE_ENERGY_CAPACITY / HARVEST_POWER / 300;

const carryCapacity = 150;
const upgradeCapacityPerTick = 2;

enum roles {
  miner,
  upgrader,
  hauler,
  builder
}

export const simpleRoom: Mission = {
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

    let missionInfo: any = [];

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

      missionInfo.push(JSON.stringify({
        sourceId: source.id,
        harvestingContainerPos: harvestingContainerPos,
        pathFromSpawn: pathFromSpawn,
        requiredMiners: 1,
        upgradingContainerPos: upgradingContainerPos,
        pathToController: pathToController,
        requiredUpgraders: 1,
        requiredHaulers: requiredHaulers
      }));
    });


    addMission({
      id: room.name + '_simpleRoom',
      room: room.name,
      mission: 'simpleRoom',
      info: missionInfo,
      creepType: null
    });


  }



}

