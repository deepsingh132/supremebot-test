// import clearstrike from "./clearstrike";
// import { findMember } from "../database/models/Member";
import express from 'express';
import { addKeywordToDB, fetchKeywords, deleteKeywordFromDB } from "../controllers/keywordController";
import getStrikes from "./getStrikes";

export default (app: express.Application) => {
  // app.use("/api/clear", clearstrike);

  // app.use("/api/find/:id", findMember);

  app.use("/api/strikes", getStrikes)


  app.use("/api/addkeyword", addKeywordToDB);

  app.use("/api/fetchkeywords", fetchKeywords);

  app.use("/api/deletekeyword", deleteKeywordFromDB);

}
