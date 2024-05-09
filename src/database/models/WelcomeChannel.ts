import { Document, model, Schema } from 'mongoose';

export interface WelcomeChannelType extends Document {
  guildId: string;
  channelId: string;
  customMessage: string;
}

const WelcomeChannel = new Schema(
  {
    guildId: {
      type: String,
      required: true,
    },
    channelId: {
      type: String,
      unique: true,
      required: true,
    },
    customMessage: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

export default model<WelcomeChannelType>('WelcomeChannel', WelcomeChannel);