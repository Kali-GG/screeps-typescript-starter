const getCostForBodyPartsArr = (arr: BodyPartConstant[]): number => {
  let cost = 0;

  arr.forEach( part => {
    cost += BODYPART_COST[part];
  });

  return cost;
}

export { getCostForBodyPartsArr }
