import Members  from "../database/models/Member";

export const getStrikedMembers = async (req: any, res: any) => {
  const members = await Members.find({ strikes: { $gt: 0 } });
  console.log(members);
  res.status(200).send(members);
};