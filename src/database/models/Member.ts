import { Document, model, Schema } from "mongoose";

export interface Members extends Document {
  memberId: string;
  avatar: string;
  username: string;
  roles: string[];
  strikes: number;
  warnings: number;
  bans: number;
  kicks: number;
  banned: boolean;
}

const Members = new Schema({
  memberId: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  roles: {
    type: Array,
    default: [],
  },
  strikes: {
    type: Number,
    default: 0,
  },
  warnings: {
    type: Number,
    default: 0,
  },
  bans: {
    type: Number,
    default: 0,
  },
  kicks: {
    type: Number,
    default: 0,
  },
  banned: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

export default model<Members>('Members', Members);