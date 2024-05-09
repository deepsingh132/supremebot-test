import express from 'express';

import { deleteAdmin, getAllAdmins, updateAdmin } from '../controllers/admins';
import { isAuthenticated, isOwner } from '../middlewares';
import { createAdmin } from '../database/models/Admin';

export default (router: express.Router) => {
  router.get('/api/admins', isAuthenticated, getAllAdmins);
  router.delete('/api/admin/:id', isAuthenticated, isOwner, deleteAdmin);
  router.patch('/api/admin/:id', isAuthenticated, isOwner, updateAdmin);
  router.post('/api/admin/register', isAuthenticated, isOwner, createAdmin);
};