const COST_PLAIN = 1; // set to 1 so that we can discount & therefore reuse roads!
const COST_SWAMP = 2;
const COST_WALL = 255;

const REVERSE_COST_PLAIN = 255;
const REVERSE_COST_SWAMP = 255;
const REVERSE_COST_WALL = 0;

const getCostMatrix = (room: Room, reverseCost: boolean = false): CostMatrix => {

   let costs = new PathFinder.CostMatrix();
   const terrain = new Room.Terrain(room.name);

   for (let x = 0; x <= 49; x++) {
     for (let y = 0; y <= 49; y++) {
       if (reverseCost && (x < 1 || x > 48 || y < 1 || y > 48)) {
         costs.set(x, y, REVERSE_COST_WALL);
         continue;
       }
       switch (terrain.get(x, y)) {
         case TERRAIN_MASK_WALL || TERRAIN_MASK_LAVA: {
           costs.set(x, y, reverseCost ? REVERSE_COST_WALL : COST_WALL);
           continue;
         }
         case TERRAIN_MASK_SWAMP: {
           costs.set(x, y, reverseCost ? REVERSE_COST_SWAMP : COST_SWAMP);
           continue;
         }
         default: {
           costs.set(x, y, reverseCost? REVERSE_COST_PLAIN : COST_PLAIN);
         }
       }
     }
   }

  return costs;
 }

 export { getCostMatrix };
