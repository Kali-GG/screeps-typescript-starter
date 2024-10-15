
/*
  Concept of resupplyLine

  Goal is to reduce cpu cost to refill extensions & spawns by
    eliminating the need of pathfinding
    reducing the amount of FIND_STRUCTURES calls to return unfilled extensions

  a resupplyLine consists of
    1 path (2 actually, a reversed one to get back to the starting point)
    an id[] of extensions & spawns which are located beside the path

  When comparing the id[] of the supplyLine & an [] of unfilled extensions, we can derive how many extensions of the
  supplyLine need refilling. By that we can determine if a creep should start resupplying. It would follow the path until
  either all extensions on the line are filled or it's energy store is empty

  there can be several resupplyLines per room.
    in low level rooms one per source makes sense. it should actually be the path to the controller
    in high level rooms there might be different concepts (to be evaluated when we get there!)

  1) reducing the amount of FIND_STRUCTURES calls to return unfilled extensions
    global id[] that holds empty extension & spawn ids cached for every owned room
    FIND_STRUCTURES to replace the array after each successful spawnCreep action (spawn)
    splice items from array after successful resupply (creep.transfer)

  2) eliminating the need of pathfinding
    after the init of the supply line no pathfinding operations are needed anymore. the creep is simply following the path
    one every step it checks if there is an empty extension in range to transfer to. if not, it moves on
 */

import {globalRoom} from "./rooms";

let structureArr: AnyOwnedStructure[];

const updateEmptyEnergyReservesArr = (room: Room) => {
  if (!globalRoom(room.name).updateEmptyEnergyReservesArr) { return; }
  structureArr = room.find(FIND_MY_STRUCTURES, {filter: (structure) => {return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0}});
  globalRoom(room.name).emptyEnergyReservesArr = convertStructureArrToIdArr(structureArr);
  globalRoom(room.name).updateEmptyEnergyReservesArr = false;
}

let outputArr: string[];
const convertStructureArrToIdArr = (inputArr: AnyOwnedStructure[]) => {
  outputArr = [];
  inputArr.forEach( input => {outputArr.push(input.id)});
  return outputArr;
}

const spliceIdFromEmptyEnergyArr = (room: Room, id: string) => {

}

export { updateEmptyEnergyReservesArr, spliceIdFromEmptyEnergyArr }
