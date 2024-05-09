import { Document, model, Schema } from 'mongoose';

export interface NotificationConfigType extends Document {
  guildId: string;
  notificationChannelId: string;
  ytChannelId: string;
  customMessage: string;
  isEnabled: boolean;
  lastChecked: Date;
  lastCheckedVid: {
    id: string;
    pubDate: Date;
  };
}

const NotificationConfig = new Schema(
  {
    guildId: {
      type: String,
      required: true,
    },
    notificationChannelId: {
      type: String,
      required: true,
    },
    ytChannelId: {
      type: String,
      required: true,
    },
    customMessage: {
      type: String,
      required: false,
    },
    isEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    lastChecked: {
      type: Date,
      required: true,
    },
    lastCheckedVid: {
      type: {
        id: {
          type: String,
          required: true,
        },
        pubDate: {
          type: Date,
          required: true,
        }
      }
    }
  }, { timestamps: true },
);

export default model<NotificationConfigType>(
  'NotificationConfig',
  NotificationConfig,
);
