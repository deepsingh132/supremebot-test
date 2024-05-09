import { Request, Response } from 'express';
import express from 'express';
import { getRecentMembers } from '../controllers/getRecentMembers';
import { isAuthenticated } from '../middlewares';

export default (router: express.Router) => {
  router.get('/api/recent-kicked-members', isAuthenticated, (req : Request, res: Response) => getRecentMembers(req, res, 'kicked_members'));
};
