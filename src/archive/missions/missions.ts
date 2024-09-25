/*
const missions = new Map<string, MissionInfo>();

const addMission = (missionInfo: MissionInfo, memoryUpdate: boolean = true): void => {
  missions.set(missionInfo.id, missionInfo);
  if (memoryUpdate) { saveMemory(); }
}

const cancelMission = (id: string, memoryUpdate: boolean = true): void => {
  missions.delete(id);
  if (memoryUpdate) { saveMemory(); }
}

const loadMissions = (): void => {
  Memory.missions.forEach(mission => {
    addMission(mission, false);
  })
}

const saveMemory = () : void => {
  let newMemory: MissionInfo[] = [];

  missions.forEach( mission => {
    newMemory.push(mission);
  });

  Memory.missions = newMemory;
}

export { missions, addMission, cancelMission, loadMissions };

 */
