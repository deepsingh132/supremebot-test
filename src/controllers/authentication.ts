import express from 'express';

import { createAdmin, getAdminBySessionToken, getAdminByUsername } from '../database/models/Admin';
import { authentication as auth, random } from '../helpers';

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    const admin = await getAdminByUsername(username).select(
      '+authentication.salt +authentication.password',
    );

    if (!admin) {
      return res.status(404).send({ message: 'Admin not found' });
    }

    const expectedHash = auth(admin.authentication.salt, password);

    if (expectedHash !== admin.authentication.password) {
      return res.status(403).send({ message: 'Invalid username or password!' });
    }

    const salt = random();
    admin.authentication.sessionToken = auth(
      salt,
      admin._id.toString(),
    );

    await admin.save();

    res.cookie('SUPREMEBOT-AUTH', admin.authentication.sessionToken, {
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      // secure disabled for development
      // secure: true,
    });

    const { authentication, ...adminWithoutAuth } = admin.toObject();

    return res.status(200).json(adminWithoutAuth).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { username, password, discordId, discordUsername } = req.body;

    if (!username || !password || !discordId || !discordUsername) {
      return res.status(400).send('Username and password are required');
    }

    const existingAdmin = await getAdminByUsername(username);

    if (existingAdmin) {
      return res.sendStatus(409);
    }

    const salt = random();
    const admin = await createAdmin({
      username,
      discordId,
      discordUsername,
      authentication: {
        salt,
        password: auth(salt, password),
      },
    });
    console.log('A new admin has been created');
    return res.status(200).json(admin).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export const verifyToken = async (req: express.Request, res: express.Response) => {
  try {
    const currentToken = req.cookies['SUPREMEBOT-AUTH'] as string;

    if (!currentToken) {
      return res.sendStatus(403);
    }

    const admin = await getAdminBySessionToken(currentToken).select('+authentication.sessionToken');

    if (!admin) {
      return res.status(404).send({ message: 'Admin not found!' });
    }

    if (admin.authentication.sessionToken !== currentToken) {
      return res.status(403).send({ message: 'Invalid session token or session expired!'});
    }

    // extend the session
    // const salt = random();
    // admin.authentication.sessionToken = auth(salt, admin._id.toString());
    // await admin.save();

    // res.cookie('SUPREMEBOT-AUTH', admin.authentication.sessionToken, {
    //   domain: 'localhost',
    //   path: '/',
    //   httpOnly: true,
    //   sameSite: 'lax',
    //   maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    //   // secure disabled for development
    //   // secure: true,
    // });

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}