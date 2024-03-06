const clearStrike = async (req, res) => {
  // app.get("/clear/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log("Clearing strikes for user:", userId);
  if (userStrikes[userId]) {
    // remove the user from the userStrikes const object
    delete userStrikes[userId];
    res.status(200).send("User strikes cleared");
  } else {
    res.status(404).send("User not found");
  }
};
//);

module.exports = clearStrike;
