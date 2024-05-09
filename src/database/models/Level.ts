import { Schema, model, Document } from 'mongoose';


export interface Level extends Document{
  userId: string;
  username: string;
  guildId: string;
  xp: number;
  level: number;
};

const Level = new Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
});

export const LevelModel = model<Level>('Level', Level);