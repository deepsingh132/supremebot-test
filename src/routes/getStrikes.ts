import { Router } from "express";
import { getStrikedMembers } from "../controllers/getStrikedMembers";

const router = Router();

router.get("/", getStrikedMembers);

export default router;