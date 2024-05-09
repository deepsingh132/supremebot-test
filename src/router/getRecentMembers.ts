import express from 'express';
import { getRecentMembers } from '../controllers/getRecentMembers';
import { isAuthenticated } from '../middlewares';

export default (router: express.Router) => {
  router.get('/api/recent-members', isAuthenticated , (req, res) => getRecentMembers(req, res, 'joined_members'));
};
