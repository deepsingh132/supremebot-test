import express from 'express';

import Features from '../database/models/Features';

export const getFeatures = async (req: express.Request, res: express.Response) => {
  try {
    const features = await Features.find();
    return res.status(200).json(features).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export const getFeature = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    console.log(id);
    const feature = await Features.findOne({ id });
    if (!feature) {
      return res.status(404).send({message: 'Feature not found'});
    }
    return res.status(200).json(feature).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export const createFeature = async (req: express.Request, res: express.Response) => {
  try {
    const { guildId, name, description, featureType, featureId, featureData, isEnabled } = req.body;

    if (!guildId || !name || !description || !featureId || !isEnabled) {
      return res.status(400).send({message: 'Guild Id, Name, description, featureId, and isEnabled are required'});
    }

    const feature = new Features({
      guildId,
      name,
      description,
      featureType,
      featureId,
      featureData: featureData || {},
      isEnabled,
    });
    await feature.save();

    return res.status(201).json(feature).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export const toggleFeature = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    console.log(req.params);
    const feature = await Features.findOne({ _id: id });
    if (!feature) {
      return res.status(404).send({message: 'Feature not found'});
    }
    feature.isEnabled = !feature.isEnabled;
    await feature.save();
    console.log(`Feature ${feature.name} is now ${feature.isEnabled ? 'enabled' : 'disabled'}`)
    return res.status(200).json(feature).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

export const updateFeature = async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, featureType, featureId, featureData, isEnabled } = req.body;

    if (!name || !description || !featureType || !featureId || !isEnabled) {
      return res.status(400).send({message: 'Name, description, featureType, featureId, and isEnabled are required'});
    }

    const feature = await Features.findOne({ name });
    if (!feature) {
      return res.status(404).send({message: 'Feature not found'});
    }

    feature.name = name;
    feature.description = description;
    feature.featureType = featureType;
    feature.featureId = featureId;
    feature.featureData = featureData || {};
    feature.isEnabled = isEnabled;

    await feature.save();

    return res.status(200).json(feature).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export const deleteFeature = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    console.log(id);

    if (!id) {
      return res.status(400).send({message: 'Name is required'});
    }

    const feature = await Features.findOne({ id });
    if (!feature) {
      return res.status(404).send({message: 'Feature not found'});
    }

    await feature.deleteOne();

    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};