 const getReverseCostMatrix = (room: Room): CostMatrix => {

   let costs = new PathFinder.CostMatrix();

   const terrain = new Room.Terrain(room.name);

   for (let x = 0; x <= 49; x++) {
     for (let y = 0; y <= 49; y++) {
       if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
         costs.set(x, y, 0);
         continue;
       }
       if (x < 1 || x > 48 || y < 1 || y > 48) {
         costs.set(x, y, 0);
         continue;
       }
       costs.set(x, y, 1 << 8);
     }
   }

  return costs;
 }

 export { getReverseCostMatrix };
