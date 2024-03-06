import Members  from "../database/models/Member";

export const getMember = async (memberId: string) => {
  try {
    const member = await Members.findOne({ memberId });
    return member;
  } catch (err) {
    console.error("Error getting member:", err);
  }
};