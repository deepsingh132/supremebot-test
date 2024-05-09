import { Document, model, Schema } from 'mongoose';

interface FeatureType extends Document {
  guildId: string;
  name: string;
  description: string;
  featureType: string;
  featureId: string;
  featureData: {};
  isEnabled: boolean;
}

const Feature = new Schema(
  {
    guildId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    featureType: {
      type: String,
      // required: true,
    },
    icon: {
      type: String,
    },
    featureId: {
      type: String,
      required: true,
    },
    featureData: {
      type: Object,
    },
    isEnabled: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

export default model<FeatureType>('Feature', Feature);