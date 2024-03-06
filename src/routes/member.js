const Member = require("../database/models/Member");

const findMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await Member.getMember(memberId);
    if (!member) {
      return res.status(404).send("Member not found");
    }
    res.json(member);
  } catch (error) {
    console.error("Error finding member:", error);
    res.status(500).send("Error finding member");
  }
};

module.exports = {findMember};