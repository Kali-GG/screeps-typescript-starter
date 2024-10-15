

/*
  We want a simple base layout
  The closer Source (path to controller)
    should have at least 1 mining spot. container will be build there too
    directly adjacent we want a path to the controller, a spot for the link and a spawn (which will be the initial one)
      the spawn is ideally placed to be able to spawn 1) on the mining spot 2) on additional mining (spots) & on the path or near to the path
  The source further away (if any) should be handled the same, minus (initially) the spawn obviously

  on the path from the closer spawn to the controller, left and right to the path, extensions will be built

  at the controller, a few tiles from the controller, a container is placed. ideally so that we have 3+ potential upgrading spots where
  creeps can withdraw energy from the container

  the rest of the structures are built clsoe to the controller:
    towers
    storage
    terminal
 */

/*
  we intend to not use any sort of creeps apart from
    harvesters (ideally without movement parts)
    haulers (1+ each per source) who supply the controller & refill extensions on the path
    upgraders (enough to consume all available energy)

    building of nex extensions could be covered by the haulers (need to spawn special type)
 */


const getStarterBase = () => {

}

