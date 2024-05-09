import express from 'express';

import authentication from './authentication';
import admins from './admins';
import features from './features';
import getRecentMembers from './getRecentMembers';
import getRecentKickedMembers from './getRecentKickedMembers';

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  admins(router);
  features(router);
  getRecentMembers(router);
  getRecentKickedMembers(router);

  // app.use("/api/clear", clearstrike);

  // app.use("/api/find/:id", findMember);

  // app.use("/api/strikes", getStrikes)

  // app.get('/api/strikes', getStrikedMembers);


  // app.put("/api/addkeyword", addKeywordToDB);

  // app.get("/api/fetchkeywords", fetchKeywords);

  // app.delete("/api/deletekeyword", deleteKeywordFromDB);

  return router;
}
