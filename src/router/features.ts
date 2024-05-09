import express from 'express';
import { createFeature, deleteFeature, getFeatures, getFeature, toggleFeature, updateFeature } from '../controllers/features';
import { isAuthenticated } from '../middlewares';

export default (router: express.Router) => {
  router.get('/api/features', isAuthenticated, getFeatures);
  router.get('/api/feature/:id', isAuthenticated, getFeature);
  router.post('/api/feature', isAuthenticated, createFeature);
  router.patch('/api/feature/:id', isAuthenticated, toggleFeature);
  router.put('/api/feature/:id', isAuthenticated, updateFeature);
  router.delete('/api/feature/:id', isAuthenticated, deleteFeature);
}